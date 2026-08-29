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
        const { message, history, sessionId, userTimeZone, prayerData } = req.body;
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
                let itemInfo = `ID: ${doc.id} | Nama: ${data.title} | Harga: Rp${data.price} | Kategori: ${data.category}`;
                if (data.description) itemInfo += ` | Deskripsi: ${data.description}`;
                if (data.facilities) itemInfo += ` | Fasilitas: ${data.facilities}`;
                if (data.include) itemInfo += ` | Include: ${data.include}`;
                if (data.exclude) itemInfo += ` | Exclude: ${data.exclude}`;
                items.push(itemInfo);
            });
            contextData = items.join('\\n');
        } catch(e) {
            console.error("Gagal menarik data untuk konteks chatbot", e);
        }

        // Fetch AI Knowledge Base (Aturan tambahan dari Admin)
        let knowledgeBaseContext = '';
        try {
            const kbSnapshot = await db.collection('ai_knowledge_base').where('isActive', '==', true).get();
            const rules = [];
            kbSnapshot.forEach(doc => {
                rules.push(`- ${doc.data().rule}`);
            });
            if (rules.length > 0) {
                knowledgeBaseContext = `\nCatatan Penting Tambahan (Knowledge Base):\n${rules.join('\\n')}\n`;
            }
        } catch(e) {
            console.error("Gagal menarik data knowledge base", e);
        }

        // Fetch Recent Chats Context (agar AI tahu apa yang sering ditanyakan)
        let recentChatsContext = '';
        try {
            const recentSnapshot = await db.collection('chat_sessions').orderBy('lastUpdate', 'desc').limit(10).get();
            const recentQuestions = [];
            recentSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.history && data.history.length > 0) {
                    const userMsgs = data.history.filter(msg => msg.role === 'user');
                    if (userMsgs.length > 0) {
                        recentQuestions.push(`"${userMsgs[userMsgs.length - 1].parts[0].text}"`);
                    }
                }
            });
            if (recentQuestions.length > 0) {
                recentChatsContext = `\nSebagai referensi tren, berikut beberapa pertanyaan terakhir dari pelanggan lain: ${recentQuestions.slice(0, 5).join(', ')}.\n`;
            }
        } catch(e) {
            console.error("Gagal menarik data recent chats", e);
        }

        const dateObj = new Date();
        const timeZoneToUse = userTimeZone || 'Asia/Makassar';
        let currentTimeLocal = '';
        try {
            currentTimeLocal = new Intl.DateTimeFormat('id-ID', { timeZone: timeZoneToUse, hour: '2-digit', minute: '2-digit', hour12: false }).format(dateObj);
        } catch(e) {
            currentTimeLocal = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false }).format(dateObj);
        }

        let prayerContext = '';
        let prayerReminderAlert = '';
        if (prayerData && prayerData.timings) {
            prayerContext = `\nJadwal sholat wajib pengguna hari ini di ${prayerData.city} (${prayerData.date}):\nSubuh: ${prayerData.timings.Subuh}, Dzuhur: ${prayerData.timings.Dzuhur}, Ashar: ${prayerData.timings.Ashar}, Maghrib: ${prayerData.timings.Maghrib}, Isya: ${prayerData.timings.Isya}.\n`;
            
            // Hitung selisih waktu menggunakan JavaScript agar presisi 100%
            try {
                const [currH, currM] = currentTimeLocal.replace('.', ':').split(':').map(Number);
                const currTotalMins = currH * 60 + currM;
                
                const prayersToCheck = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
                for (const prayer of prayersToCheck) {
                    if (prayerData.timings[prayer]) {
                        const timeStr = prayerData.timings[prayer].split(' ')[0]; // Bersihkan zona waktu jika ada
                        const [pH, pM] = timeStr.split(':').map(Number);
                        const pTotalMins = pH * 60 + pM;
                        
                        const diff = pTotalMins - currTotalMins;
                        if (diff >= 1 && diff <= 10) {
                            prayerReminderAlert = `\n[INSTRUKSI MUTLAK]: Saat ini adalah ${diff} menit menuju sholat ${prayer}. WAJIB awali balasan Anda dengan pengingat sholat yang ramah (contoh: "Sekadar mengingatkan, sekitar ${diff} menit lagi akan masuk waktu sholat ${prayer}...").\n`;
                            break;
                        }
                    }
                }
            } catch(e) {
                console.error("Gagal menghitung selisih waktu sholat", e);
            }
        }

        const systemPrompt = `Anda adalah "Lombok AI", asisten customer service ramah dan cerdas untuk website travel "Travel Lombok Airport". 
Anda ahli dalam merekomendasikan paket tour, sewa mobil/motor, dan jasa antar jemput.
Gunakan sapaan sopan seperti "Kak" atau "Bapak/Ibu" saat menjawab. 

Saat ini waktu di lokasi pengguna (berdasarkan zona waktu lokalnya) adalah jam ${currentTimeLocal}. ${prayerContext}

Berikut adalah database layanan yang tersedia saat ini:
${contextData}

Aturan Penting:
1. JANGAN MENGARANG HARGA, LAYANAN ATAU FASILITAS. Hanya rekomendasikan dan jelaskan apa yang benar-benar ada di database di atas.
2. PERHATIKAN dengan sangat teliti bagian "Include" dan "Exclude". JANGAN PERNAH bilang tiket destinasi atau fasilitas lain itu termasuk (include) jika di data tertulis "Exclude" atau jika tidak disebutkan sama sekali di "Include".
3. Jika pelanggan bertanya rekomendasi, berikan pilihan terbaik dari database, jelaskan mengapa, lalu berikan link dalam format markdown: [Nama Layanan](/?item=ID_LAYANAN). 
   Contoh: [Paket Tour Pantai Kuta](/?item=tour-kuta-123)
4. Jawab dalam bahasa Indonesia yang natural, hangat, dan tidak terlalu kaku.
5. Gunakan emoji secukupnya agar percakapan lebih ramah.
6. DILARANG KERAS menggunakan tanda bintang (*) untuk membuat daftar (list) atau untuk menebalkan/memiringkan teks (bold/italic). Gunakan tanda hubung (-) untuk membuat list.
7. Jika pelanggan menanyakan artikel atau blog, berikan link: [Blog Travel Lombok Airport](https://www.travellombokairport.com/blog) secara profesional.
8. Jika pelanggan meminta nomor admin/WhatsApp atau ingin menghubungi admin, berikan link: [Kontak Kami](https://www.travellombokairport.com/kontak) secara profesional.
9. ${prayerReminderAlert ? prayerReminderAlert : 'Jawablah pertanyaan pengguna dengan baik dan profesional.'}
${knowledgeBaseContext}
${recentChatsContext}`;

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

        // Set header untuk Server-Sent Events (SSE)
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no' // Mencegah NGINX atau proxy menahan buffer
        });

        const result = await chat.sendMessageStream(message);
        let fullReply = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullReply += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        // Kirim tanda selesai
        res.write(`data: [DONE]\n\n`);
        res.end();
        
        // Simpan ke Firebase di background (tanpa memblokir response ke klien)
        try {
            const currentSessionId = sessionId || 'guest_' + Date.now();
            const docRef = db.collection('chat_sessions').doc(currentSessionId);
            
            const savedHistory = history ? [...history] : [];
            savedHistory.push({ role: 'user', parts: [{ text: message }] });
            savedHistory.push({ role: 'model', parts: [{ text: fullReply }] });

            await docRef.set({
                sessionId: currentSessionId,
                lastUpdate: new Date().toISOString(),
                isGuest: currentSessionId.startsWith('guest_'),
                history: savedHistory
            }, { merge: true });
        } catch(dbErr) {
            console.error('Failed to save chat session:', dbErr);
        }

    } catch (error) {
        console.error('Error in AI chat:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Gagal merespons obrolan', error: error.message });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Terjadi kesalahan sistem AI' })}\n\n`);
            res.end();
        }
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

// GET Knowledge Base
router.get('/knowledge-base', async (req, res) => {
    try {
        const snapshot = await db.collection('ai_knowledge_base').orderBy('createdAt', 'desc').get();
        const rules = [];
        snapshot.forEach(doc => {
            rules.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, data: rules });
    } catch (error) {
        console.error('Error fetching knowledge base:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil knowledge base' });
    }
});

// POST Knowledge Base
router.post('/knowledge-base', async (req, res) => {
    try {
        const { rule } = req.body;
        if (!rule) {
            return res.status(400).json({ success: false, message: 'Aturan tidak boleh kosong' });
        }
        
        const newRule = {
            rule,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('ai_knowledge_base').add(newRule);
        res.json({ success: true, message: 'Aturan berhasil ditambahkan', data: { id: docRef.id, ...newRule } });
    } catch (error) {
        console.error('Error adding knowledge base:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan aturan' });
    }
});

// DELETE Knowledge Base
router.delete('/knowledge-base/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('ai_knowledge_base').doc(id).delete();
        res.json({ success: true, message: 'Aturan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting knowledge base:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus aturan' });
    }
});

module.exports = router;
