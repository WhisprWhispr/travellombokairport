const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../config/firebase');

// Inisialisasi Gemini API
// Pastikan GEMINI_API_KEY disetel di .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/scan-image', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'Gambar tidak ditemukan' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Server belum dikonfigurasi dengan GEMINI_API_KEY' });
        }

        // Hapus prefix "data:image/jpeg;base64," jika ada
        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        // Pilih model Gemini Flash (cepat dan akurat untuk gambar)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Anda adalah asisten AI untuk website travel & rental.
Tugas Anda adalah membaca gambar brosur promosi ini (Sewa Mobil, Motor, Tour, Jasa Antar Jemput, dll) dan merangkum informasinya.
Tolong keluarkan HANYA JSON murni (tanpa tag \`\`\`json) dengan struktur berikut:
{
  "title": "Nama Layanan/Kendaraan/Tour (Singkat)",
  "price": 500000, 
  "category": "car" atau "motorcycle" atau "package" atau "transfer" atau "drone",
  "description": "Fasilitas yang termasuk (include) atau deskripsi singkat.\\nFormat menggunakan bullet points ( ) untuk setiap fasilitas.",
  "transferMatrix": [
    {
      "area": "Nama Area (misal: Area Kuta Mandalika)",
      "prices": {
        "Nama Kendaraan 1": 150000,
        "Nama Kendaraan 2": 200000
      }
    }
  ]
}
Catatan:
- Pastikan 'price' adalah angka murni tanpa titik atau huruf (contoh: 500000). Jika harga tidak ditemukan, set ke 0.
- Field 'transferMatrix' HANYA diisi jika gambar merupakan pricelist "Jasa Antar Jemput" (Airport Transfer) yang memiliki struktur harga berdasarkan area dan kendaraan. Jika bukan, abaikan field ini atau set menjadi array kosong [].
- Pastikan HANYA mengembalikan text JSON yang bisa di-parse.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg" // atau png, dsb. Gemini cukup cerdas mendeteksinya.
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        // Membersihkan response barangkali Gemini memasukkan tag ```json
        let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const data = JSON.parse(cleanJson);

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error scanning image:', error);
        res.status(500).json({ success: false, message: 'Gagal menganalisis gambar', error: error.message });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { message, history, sessionId } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Pesan kosong' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Server belum dikonfigurasi dengan GEMINI_API_KEY' });
        }

        // Fetch data context
        let contextData = '';
        try {
            const snapshot = await db.collection('items').get();
            const items = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                items.push(`ID: ${doc.id} | Nama: ${data.title} | Harga: Rp${data.price} | Kategori: ${data.category} | Deskripsi Singkat: ${data.description ? data.description.substring(0,100) : ''}...`);
            });
            contextData = items.join('\\n');
        } catch(e) {
            console.error("Gagal menarik data untuk konteks chatbot", e);
        }

        const systemPrompt = `Anda adalah "Lombok AI", asisten customer service ramah dan cerdas untuk website travel "Travel Lombok Airport". 
Anda ahli dalam merekomendasikan paket tour, sewa mobil/motor, dan jasa antar jemput.
Gunakan sapaan sopan seperti "Kak" atau "Bapak/Ibu" saat menjawab. 

Berikut adalah database layanan yang tersedia saat ini:
${contextData}

Aturan Penting:
1. JANGAN MENGARANG HARGA ATAU LAYANAN. Hanya rekomendasikan apa yang ada di database di atas.
2. Jika pelanggan bertanya rekomendasi, berikan pilihan terbaik dari database, jelaskan mengapa, lalu berikan link dalam format markdown: [Nama Layanan](/?item=ID_LAYANAN). 
   Contoh: [Paket Tour Pantai Kuta](/?item=tour-kuta-123)
3. Jawab dalam bahasa Indonesia yang natural, hangat, dan tidak terlalu kaku.
4. Gunakan emoji secukupnya agar percakapan lebih ramah.
5. Format jawaban gunakan bullet points jika memberikan daftar.`;

        const model = genAI.getGenerativeModel({ model: "gemini-3.7-flash" });
        
        // Start a chat session
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Siap! Saya mengerti instruksi tersebut dan siap membantu pelanggan dengan ramah berdasarkan data layanan yang ada." }],
                },
                ...(history || [])
            ],
            generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const replyText = response.text();
        
        // Save to Firebase chat_sessions
        try {
            const currentSessionId = sessionId || 'guest_' + Date.now();
            // We use the ID to update or create
            const docRef = db.collection('chat_sessions').doc(currentSessionId);
            
            // Generate full history array to save
            const savedHistory = history ? [...history] : [];
            savedHistory.push({ role: 'user', parts: [{ text: message }] });
            savedHistory.push({ role: 'model', parts: [{ text: replyText }] });

            await docRef.set({
                sessionId: currentSessionId,
                lastUpdate: new Date().toISOString(),
                isGuest: currentSessionId.startsWith('guest_'),
                history: savedHistory
            }, { merge: true });
        } catch(dbErr) {
            console.error('Failed to save chat session:', dbErr);
        }
        
        res.json({ success: true, reply: replyText });

    } catch (error) {
        console.error('Error in AI chat:', error);
        res.status(500).json({ success: false, message: 'Gagal merespons obrolan', error: error.message });
    }
});

router.get('/sessions', async (req, res) => {
    try {
        const snapshot = await db.collection('chat_sessions').orderBy('lastUpdate', 'desc').limit(50).get();
        const sessions = [];
        snapshot.forEach(doc => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat obrolan' });
    }
});

module.exports = router;
