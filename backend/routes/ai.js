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

        try {
            const settingsDoc = await db.collection('settings').doc('global').get();
            if (settingsDoc.exists && settingsDoc.data().aiMaintenanceMode) {
                return res.json({
                    success: true,
                    reply: 'Mohon maaf, fitur AIRA saat ini sedang dalam pemeliharaan dan peningkatan sistem. Silakan coba beberapa saat lagi atau hubungi kami via WhatsApp.',
                    sessionId
                });
            }
        } catch (e) {
            console.error('Error checking AI maintenance mode:', e);
        }

        // Fetch data context
        let contextData = '';
        try {
            const snapshot = await db.collection('items').get();
            const items = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const numPrice = Number(data.price || 0);
                const titleLower = (data.title || '').toLowerCase();
                const catLower = (data.category || '').toLowerCase();
                // DILARANG mengirim item dengan harga 0, kosong, folder induk (parent), dokumen pricelist, atau jasa transfer matrix ke AI
                if (numPrice <= 0 || data.isParent === true || titleLower.includes('pricelist') || catLower === 'transfer' || (data.transferMatrix && data.transferMatrix.length > 0)) return;

                let itemInfo = `ID: ${doc.id} | Nama: ${data.title} | Harga: Rp${numPrice} | Kategori: ${data.category}`;
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

        const systemPrompt = `Anda adalah "AIRA", asisten customer service ramah dan cerdas untuk website travel "Travel Lombok Airport". 
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
   DILARANG KERAS merekomendasikan item yang berharga Rp 0 atau yang belum memiliki harga resmi! Hanya rekomendasikan unit/paket spesifik yang memiliki tarif harga riil (> Rp 0).
   DILARANG KERAS merekomendasikan atau menaruh link untuk "Pricelist Airport Transfer" sebagai kartu produk! Layanan antar-jemput bandara dijelaskan secara teks informatif jika ditanya.
   DILARANG KERAS mengarang link/tautan URL fiktif seperti [Form Pemesanan](...) atau link form karangan karena halaman tersebut TIDAK ADA dan akan menyebabkan error 404! Sistem website SUDAH OTOMATIS memunculkan kartu layanan interaktif dengan tombol [Detail Lengkap], [via WA], dan [via Web] tepat di bawah jawaban Anda.
4. Jawab dalam bahasa Indonesia yang natural, hangat, dan tidak terlalu kaku.
5. Gunakan emoji secukupnya agar percakapan lebih ramah.
6. DILARANG KERAS menggunakan tanda bintang (*) untuk membuat daftar (list) atau untuk menebalkan/memiringkan teks (bold/italic). Gunakan tanda hubung (-) untuk membuat list.
7. Jika pelanggan menanyakan artikel atau blog, berikan link: [Blog Travel Lombok Airport](https://www.travellombokairport.com/blog) secara profesional.
8. Jika pelanggan meminta nomor admin/WhatsApp atau ingin menghubungi admin, berikan link: [Kontak Kami](https://www.travellombokairport.com/kontak) secara profesional.
9. CARA PEMESANAN & FORMULIR: Arahkan pelanggan untuk mengklik tombol [via Web] atau [via WA] pada kartu layanan di bawah chat, atau tombol booking di bawah chat. Jika pelanggan meminta format teks manual di chat, berikan format berikut:

--- FORM BOOKING SEWA MOTOR ---
FORM BOOKING SEWA MOTOR
Tempat Pengambilan (lokasi gps/alamat): .......................
Tempat Pengembalian (lokasi gps/alamat): .......................
Jam Pengambilan: .......................
Jam Pengembalian: .......................

Catatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 100.200) diterima.
💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:
BANK: Bank Rakyat Indonesia
Nama: Lalu Renggane
Nomor Rekening: 759801017387536 

BANK: Mandiri
Nama: Lalu Renggane
Nomor Rekening: 1610017191425

--- FORM BOOKING SEWA MOBIL TANPA DRIVER ---
FORM BOOKING SEWA MOBIL
Tanggal Pengambilan: .......................
Tanggal Pengembalian: .......................
Tempat Pengambilan (lokasi gps/alamat): .......................
Tempat Pengembalian (lokasi gps/alamat): .......................
Jam Pengambilan: .......................
Jam Pengembalian: .......................

Catatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 200.200) diterima.
💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:
BANK: Bank Rakyat Indonesia
Nama: Lalu Renggane
Nomor Rekening: 759801017387536 

BANK: Mandiri
Nama: Lalu Renggane
Nomor Rekening: 1610017191425

--- FORM BOOKING AIRPORT TRANSFER ---
FORM BOOKING AIRPORT TRANSFER
Lokasi penjemputan (gps lokasi/alamat): .......................
Alamat Tujuan (gps lokasi/alamat): .......................
Nomor penerbangan: .......................
Jam penjemputan: .......................
Jumlah penumpang: .......................

Catatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee diterima.
💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:
BANK: Bank Rakyat Indonesia
Nama: Lalu Renggane
Nomor Rekening: 759801017387536 

BANK: Mandiri
Nama: Lalu Renggane
Nomor Rekening: 1610017191425

--- FORM BOOKING PRIVATE TOUR LOMBOK ---
FORM BOOKING PRIVATE TOUR LOMBOK
Mohon isi data berikut untuk proses booking:
Lokasi Jemput (berdasarkan GPS/Alamat): .......................
Lokasi Drop Off: .......................

Paket yang Dipilih (pilih dari item yang tersedia):
☐ 2H1M
☐ 3H2M
☐ 4H3M
☐ 5H4M
☐ Custom Itinerary

Kendaraan (pilih dari item yang tersedia):
☐ Avanza
☐ New Avanza
☐ Innova
☐ Hiace

Total Harga: Rp __________
DP/Booking Fee: Rp 500.200
Sisa Pembayaran: Rp __________
Catatan/Request: .......................

💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:
BANK: Bank Rakyat Indonesia
Nama: Lalu Renggane
Nomor Rekening: 759801017387536 

BANK: Mandiri
Nama: Lalu Renggane
Nomor Rekening: 1610017191425

10. PENJELASAN DP & DEPOSIT (PENTING & WAJIB DIJELASKAN KETIKA MEMBAHAS RENTAL, PAKET TOUR, ATAU BOOKING):
Setiap kali membahas atau merekomendasikan sewa kendaraan atau paket wisata, WAJIB jelaskan dengan ramah dan transparan ketentuan DP dan Uang Deposit jaminan berikut:
- DP (Booking Fee): Bertujuan mengunci (lock) jadwal dan unit agar 100% aman tidak dialihkan ke tamu lain.
  - Sewa Mobil: DP Rp 200.000
  - Sewa Motor: DP Rp 50.000
  - Paket Tour Wisata: DP Rp 500.000
  - Antar Jemput Bandara: DP Rp 100.000
- Uang Deposit Jaminan (Security Deposit):
  - Sewa Mobil Lepas Kunci (Tanpa Supir): Uang deposit jaminan Rp 1.000.000 (Wajib sebagai jaminan keamanan unit selama masa sewa, dan 100% DIKEMBALIKAN / REFUND penuh saat mobil dikembalikan dalam kondisi aman).
  - Sewa Motor: Uang deposit jaminan Rp 500.000 (100% DIKEMBALIKAN / REFUND penuh saat motor kembali aman).
  - Sewa Mobil DENGAN SUPIR & PAKET TOUR: BEBAS DEPOSIT (Rp 0)! Tidak ada deposit jaminan karena didampingi oleh tim/supir resmi kami.
11. PANDUAN KULINER LEGENDARIS & HIDDEN GEMS LOMBOK (LOMBOK FOOD & HIDDEN GEMS RECOMMENDER):
Jika pelanggan bertanya rekomendasi kuliner, makanan khas Lombok, tempat makan enak, oleh-oleh, atau kerajinan khas/hidden gems, berikan panduan legendaris terbaik berikut dengan deskripsi rasa menggugah selera, keunikan, lokasi/jarak, dan WAJIB sertakan tautan rute Google Maps dalam format markdown persis seperti di bawah ini (sistem website kami otomatis mengubahnya menjadi tombol navigasi Google Maps interaktif):

KULINER LEGENDARIS LOMBOK:
- Nasi Balap Puyung Inaq Esun (Sangat Dekat Bandara):
  * Ciri khas: Nasi hangat dengan suwiran ayam kampung pedas gurih, kedelai goreng renyah, serundeng, dan belut/udang goreng renyah. Sangat legendaris dan wajib dikunjungi saat baru tiba di Lombok atau saat hendak pulang (hanya 10-15 menit dari Bandara Lombok).
  * Area: Puyung, Jonggat, Lombok Tengah
  * Rute Maps: [📍 Rute Google Maps: Nasi Balap Puyung](https://www.google.com/maps/search/?api=1&query=Nasi+Balap+Puyung+Inaq+Esun+Puyung+Lombok)
- Ayam Taliwang & Plecing Kangkung (Ayam Taliwang H. Moerad / Irama):
  * Ciri khas: Ayam kampung muda bakar/goreng dengan bumbu cabai dan terasi khas Lombok yang harum dan pedas nampol. Disajikan dengan plecing kangkung air segar berbalut sambal tomat terasi dan beberuk terong segar.
  * Area: Cakranegara / Mataram
  * Rute Maps: [📍 Rute Google Maps: Ayam Taliwang H. Moerad](https://www.google.com/maps/search/?api=1&query=Ayam+Taliwang+H+Moerad+Cakranegara+Mataram)
- Sate Rembiga Utama Ibu Sinnaseh:
  * Ciri khas: Sate daging sapi super empuk dengan bumbu rempah manis, pedas, dan gurih meresap sampai ke serat daging. Sangat nikmat dinikmati bersama lontong dan kuah sup bebalung sapi segar berempah.
  * Area: Rembiga, Kota Mataram
  * Rute Maps: [📍 Rute Google Maps: Sate Rembiga Ibu Sinnaseh](https://www.google.com/maps/search/?api=1&query=Sate+Rembiga+Ibu+Sinnaseh+Mataram)
- Sate Bulayak Suranadi:
  * Ciri khas: Sate sapi/jeroan dengan kuah bumbu kacang santan pedas gurih khas suku Sasak, disantap bersama lontong "Bulayak" yang dililit spiral daun aren/enau.
  * Area: Suranadi / Narmada, Lombok Barat
  * Rute Maps: [📍 Rute Google Maps: Sate Bulayak Suranadi](https://www.google.com/maps/search/?api=1&query=Sate+Bulayak+Suranadi+Lombok)
- Bebalung Kelep Sapi:
  * Ciri khas: Sup iga sapi berkuah bening segar dengan rempah asam muda khas Sasak yang hangat dan menyegarkan tubuh.
  * Area: Cakranegara, Mataram
  * Rute Maps: [📍 Rute Google Maps: Bebalung Kelep Sapi](https://www.google.com/maps/search/?api=1&query=Bebalung+Kelep+Mataram)

PUSAT KERAJINAN, OLEH-OLEH & HIDDEN GEMS LOMBOK:
- Desa Tenun Tradisional Sukarara:
  * Ciri khas: Sentra pengrajin kain tenun songket dan ikat tradisional Sasak. Tamu bisa belajar menenun langsung dan berfoto gratis mengenakan baju adat tradisional Lombok (hanya ~15 menit dari Bandara).
  * Area: Sukarara, Lombok Tengah
  * Rute Maps: [📍 Rute Google Maps: Desa Tenun Sukarara](https://www.google.com/maps/search/?api=1&query=Desa+Wisata+Tenun+Sukarara+Lombok)
- Pusat Kerajinan Mutiara Sekarbela:
  * Ciri khas: Sentra mutiara air laut (South Sea Pearls) dan mutiara air tawar asli Lombok dengan sertifikat kualitas terbaik dan harga pengrajin langsung.
  * Area: Sekarbela, Mataram
  * Rute Maps: [📍 Rute Google Maps: Sentra Mutiara Sekarbela](https://www.google.com/maps/search/?api=1&query=Sentra+Mutiara+Sekarbela+Mataram+Lombok)
- Desa Gerabah Tradisional Banyumulek:
  * Ciri khas: Kerajinan tembikar tanah liat ekspor dengan teknik kendi maling khas Lombok.
  * Area: Kediri / Banyumulek, Lombok Barat
  * Rute Maps: [📍 Rute Google Maps: Desa Gerabah Banyumulek](https://www.google.com/maps/search/?api=1&query=Desa+Banyumulek+Gerabah+Lombok)
- Desa Adat Sade & Ende (Budaya Sasak Otentik):
  * Ciri khas: Pemukiman tradisional suku Sasak dengan arsitektur rumah atap alang-alang dan tradisi budaya yang masih asli terjaga di jalur menuju Mandalika.
  * Area: Pujut, Lombok Tengah
  * Rute Maps: [📍 Rute Google Maps: Desa Adat Sade](https://www.google.com/maps/search/?api=1&query=Desa+Adat+Sade+Lombok)

TIPS PROMOSI TRANSPORTASI:
Di akhir penjelasan kuliner atau hidden gems, selalu tawarkan dengan ramah bahwa tim Travel Lombok Airport siap mengantar tamu menjelajahi destinasi kuliner dan kerajinan ini dengan sewa mobil harian (Avanza, Innova, Hiace) plus driver lokal yang ramah dan hapal seluk-beluk rute terbaik di Lombok!

12. ${prayerReminderAlert ? prayerReminderAlert : 'Jawablah pertanyaan pengguna dengan baik dan profesional.'}
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

// POST AI Rating
router.post('/rating', async (req, res) => {
    try {
        const { rating, sessionId } = req.body;
        if (!rating) {
            return res.status(400).json({ success: false, message: 'Rating tidak boleh kosong' });
        }
        
        const newRating = {
            rating: parseInt(rating),
            sessionId: sessionId || 'unknown',
            createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('aira_ratings').add(newRating);
        res.json({ success: true, message: 'Rating berhasil disimpan', data: { id: docRef.id, ...newRating } });
    } catch (error) {
        console.error('Error saving rating:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan rating' });
    }
});

// GET AI Ratings (for Admin Panel)
router.get('/ratings', async (req, res) => {
    try {
        const snapshot = await db.collection('aira_ratings').orderBy('createdAt', 'desc').get();
        const ratings = [];
        snapshot.forEach(doc => {
            ratings.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, data: ratings });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil ratings' });
    }
});

module.exports = router;
