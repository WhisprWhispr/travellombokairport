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

                let itemInfo = `ID: ${doc.id} | Nama: ${data.title} | Harga: Rp${numPrice}${data.category === 'car' ? ' (Lepas Kunci 24 Jam)' : ''}${data.priceWithDriver ? ` | Harga Include Driver: Rp${data.priceWithDriver} / 12 Jam` : ''} | Kategori: ${data.category}`;
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

        // Fetch Real Database Promos (HANYA PROMO AKTIF DARI DATABASE)
        let activePromosContext = '';
        try {
            const promoSnap = await db.collection('promos').where('isActive', '==', true).get();
            const validPromos = [];
            const now = new Date();
            promoSnap.forEach(doc => {
                const p = doc.data();
                if (p.validUntil && now > new Date(p.validUntil)) return;
                const discStr = p.discountType === 'percent' 
                    ? `${p.discountValue}% (maksimal potongan Rp ${p.maxDiscount || 'tanpa batas'})` 
                    : `Rp ${p.discountValue}`;

                const isExhausted = p.usageLimit && (p.usedCount || 0) >= p.usageLimit;
                if (isExhausted) {
                    validPromos.push(`- Kode: "${p.code}" | STATUS: KUOTA TELAH HABIS (${p.usedCount || 0} dari batas ${p.usageLimit} sudah terpakai). JANGAN berikan kupon ini untuk diskon baru! Beritahukan tamu bahwa kuota kupon ${p.code} sudah habis terpakai.`);
                } else {
                    const quotaInfo = p.usageLimit ? ` | Sisa Kuota: ${p.usageLimit - (p.usedCount || 0)} kupon` : ' | Kuota: Tanpa Batas';
                    validPromos.push(`- Kode: "${p.code}" | Judul: ${p.title || p.code} | Diskon: ${discStr}${quotaInfo} | Keterangan: ${p.description || 'Diskon pemesanan'}`);
                }
            });
            if (validPromos.length > 0) {
                activePromosContext = `\nDATA RESMI KODE PROMO DARI KAMI TRAVEL LOMBOK AIRPORT (HANYA gunakan info yang tercantum di sini):\n` + validPromos.join('\n');
            } else {
                activePromosContext = `\nDATA RESMI KODE PROMO: Saat ini TIDAK ADA kode promo aktif (atau semua kuota promo sudah habis terpakai). Jika tamu bertanya promo/diskon, sampaikan dengan jujur bahwa kuota kupon promo saat ini sudah habis/belum ada yang baru, namun harga di website kami sudah merupakan harga resmi termurah & terbaik langsung tanpa biaya tersembunyi.\n`;
            }
        } catch(e) {
            console.error("Gagal menarik data promo untuk konteks chatbot", e);
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

12. PANDUAN KAMUS MINI BAHASA SASAK & TIPS BELANJA / ETIKA WISATA (SASAK LOCAL LANGUAGE & CULTURE RECOMMENDER):
Jika pengguna bertanya tentang bahasa Sasak, kamus bahasa Sasak, sapaan lokal, cara menawar/belanja oleh-oleh di Desa Sukarara atau Desa Adat Sade, atau etika berinteraksi dengan warga Lombok, berikan edukasi budaya yang ramah, hangat, santai, dan mudah dipraktikkan dengan format rapi berikut:

A. KOSAKATA & SAPAAN RAMAH SEHARI-HARI (Basa Alus/Sopan):
- "Matur tampi asih" = Terima kasih banyak (ungkapan paling sopan dan sangat disukai warga Sasak).
- "Sami-sami" = Sama-sama / terima kasih kembali.
- "Tabe' / Nunas pamit" = Permisi / permisi lewat / maaf numpang tanya.
- "Piran pelinggih teka?" = Kapan Anda tiba/sampai di Lombok?
- "Bagus gati" atau "Solah gati" = Bagus sekali / indah sekali / cantik sekali!
- "Mangan maiq" = Selamat makan / makannya enak sekali.
- "Ape kabar pelinggih?" = Apa kabar Anda? (Bisa dijawab: "Kabar solah / becik" = Kabar baik).
- "Berembe kabarn?" / "Berembe entan?" = Gimana kabarnya / gimana keadaannya?
- "Tiang" = Saya (sopan), "Pelinggih" = Anda / Bapak / Ibu (panggilan kehormatan sopan).

B. KOSAKATA KHUSUS BELANJA & MENAWAR DI DESA SUKARARA & DESA SADE:
- "Pire niki aji na?" = Berapa harga barang ini?
- "Kelaq sekedik nggih?" / "Kurangan sekedik nggih?" = Boleh dikurangi sedikit ya harganya?
- "Solah gati tenun niki!" = Indah sekali kain tenun ini! (Pujian tulus yang membuat pengrajin lokal senang dan biasanya membuat penawaran harga jadi lebih bersahabat).
- "Beli sekedik nggih" = Beli sedikit ya.

C. TIPS RAMAH TAMAH & ETIKA BERWISATA DI LOMBOK:
1. Awali interaksi dengan senyuman tulus dan ucapan "Tabe'" atau "Matur tampi asih" — masyarakat suku Sasak sangat menjunjung tinggi kesopanan dan keramahan.
2. Saat berbelanja kain tenun songket di Desa Sukarara, hargai proses pembuatannya karena ditenun manual berhari-hari hingga berbulan-bulan. Menawar boleh dengan senyuman dan nada santai, tanpa memojokkan pengrajin.
3. Di Desa Tenun Sukarara, tamu bisa mencoba berfoto mengenakan baju adat tradisional Sasak (Baju Pegon untuk pria dan Lambung untuk wanita).
4. Di Desa Adat Sade, kenakan pakaian sopan dan dengarkan penjelasan dari tour guide lokal desa adat yang ramah.

D. AJAKAN TRANSPORTASI TRAVEL LOMBOK AIRPORT:
Di akhir jawaban, selalu sampaikan bahwa driver Travel Lombok Airport adalah warga lokal asli yang ramah, siap menjadi pemandu budaya, penerjemah bahasa Sasak, serta mengantar tamu berkeliling ke Desa Sukarara dan Sade dengan armada nyaman (Avanza, Innova, HiAce) sewa harian all-in kami!

13. PANDUAN PROMO DISKON & KLAIM KODE VOUCHER (AIRA FLASH DEALS & CLOSING RECOMMENDER):
Jika pengguna bertanya tentang promo, diskon, potongan harga, kupon, atau jika pengguna tampak ragu memesan karena harga/anggaran:
- DILARANG KERAS MENGARANG ATAU MEMBUAT KODE PROMO SENDIRI! HANYA sebutkan kode promo yang benar-benar tercantum pada bagian "DATA RESMI KODE PROMO AKTIF DI DATABASE" di bawah ini.
- Jika ada kode promo aktif di database, sebutkan kode promo tersebut beserta detail potongannya dan instruksikan tamu untuk memasukkannya ke kolom "Kode Promo" saat checkout atau klik tombol kupon di chat.
- Jika di database tertulis TIDAK ADA kode promo aktif, sampaikan dengan jujur dan ramah bahwa saat ini belum ada voucher promo yang berlaku, namun tarif yang tertera di website sudah merupakan tarif resmi terbaik tanpa biaya tersembunyi.
- Dorong tamu untuk segera mengunci tanggal booking dengan DP ringan Rp 500.000 (bebas biaya deposit untuk sewa dengan supir dan tour).

${activePromosContext}

14. PANDUAN BANTUAN DARURAT DI JALAN & 24/7 ROADSIDE SOS COMPANION (AIRA EMERGENCY & ROADSIDE ADVISOR):
Jika pelanggan bertanya tentang bantuan darurat di jalan, mobil/motor mogok, ban kempes/bocor, kehabisan bensin, lokasi SPBU/Pertamina terdekat, rumah sakit/klinik 24 jam, kantor polisi, atau butuh bantuan mekanik derek:
- Sampaikan empati dengan nada tenang dan meyakinkan (contoh: "Tetap tenang ya Kak, keselamatan Kakak dan keluarga adalah prioritas utama kami...").
- Ingatkan langkah keselamatan pertama: Segera tepikan kendaraan ke bahu jalan yang aman, matikan mesin, pasang rem tangan, dan nyalakan lampu hazard (darurat).
- Rincian Informasi Bantuan Terdekat di Lombok:
  * SPBU Pertamina:
    - Area Bandara Lombok & Praya: SPBU Bundaran Bandara BIL & SPBU Praya (Buka 24 jam).
    - Area Mandalika / Kuta: SPBU Mandalika Kuta Lombok (Jl. Pariwisata Kuta). Catatan penting: Setelah Kuta ke arah Tanjung Aan / Pink Beach sangat minim SPBU besar, pastikan isi bensin penuh di Kuta.
    - Area Mataram & Senggigi: SPBU Meninting (jalur Senggigi) & SPBU Cakranegara (buka 24 jam).
    - Area Sembalun: SPBU Narmada / Aikmel sebelum menanjak, di Sembalun tersedia kios bahan bakar dan Pertashop lokal.
    - Navigasi SPBU: [⛽ Rute Google Maps: Cari SPBU Terdekat](https://www.google.com/maps/search/?api=1&query=SPBU+Pertamina+Terdekat+Lombok)
  * Bengkel & Tambal Ban:
    - Tersedia di sepanjang jalan utama Praya, Mataram, Senggigi, dan Kuta.
    - Navigasi Bengkel: [🔧 Rute Google Maps: Cari Bengkel & Tambal Ban](https://www.google.com/maps/search/?api=1&query=Bengkel+Mobil+Motor+Tambal+Ban+Terdekat+Lombok)
  * Rumah Sakit & Klinik 24 Jam:
    - RSUD Praya (Paling dekat dari Bandara BIL & Mandalika): Jl. H. Lalu Hasyim, Praya.
    - RSUD Provinsi NTB & RS Siloam Mataram: Pusat penanganan rujukan medis terlengkap di Kota Mataram.
    - Klinik Mandalika Medical Care / Kuta Clinic: Buka 24 jam di kawasan Pantai Kuta Lombok.
    - Navigasi Medis: [🏥 Rute Google Maps: Rumah Sakit & Apotek 24 Jam](https://www.google.com/maps/search/?api=1&query=Rumah+Sakit+Klinik+Apotek+24+Jam+Lombok)
  * Bantuan CS Siaga Travel Lombok Airport:
    - Informasikan bahwa tim Travel Lombok Airport menyediakan layanan siaga darurat untuk pelanggan kami.
    - Arahkan tamu untuk menekan tombol "Kirim Sinyal SOS + Lokasi GPS ke WhatsApp CS Siaga" atau hubungi hotline darurat WhatsApp resmi kami di [Kontak Kami](https://www.travellombokairport.com/kontak) / WhatsApp: 089676963255.

15. PANDUAN ANTI-ZONK BELANJA OLEH-OLEH & CEK KEASLIAN (AIRA SOUVENIR QUALITY & AUTHENTICITY GUIDE):
Jika pelanggan bertanya tentang belanja oleh-oleh, mutiara asli Lombok, kain tenun Sukarara, madu Sumbawa, atau makanan khas yang awet dibawa pulang di pesawat:
- Berikan tips praktis, jujur, dan edukatif agar tamu tidak tertipu barang tiruan atau kemahalan:
  A. CEK KEASLIAN MUTIARA LOMBOK (SEKARBELA & SENTRA PENGRAJIN):
     * Mutiara Air Laut (South Sea Pearl) vs Mutiara Air Tawar vs Mutiara Palsu (Plastik/Kaca):
       - Uji Gesek Permukaan: Gesekkan lembut dua butir mutiara satu sama lain. Mutiara ASLI akan terasa sedikit kesat (berpasir halus karena lapisan kalsium mikroskopis). Setelah debu halusnya dilap jari, mutiara langsung kembali mulus dan berkilau sempurna tanpa lecet! Mutiara tiruan (plastik) terasa licin menggelincir dan lapisannya mudah terkelupas bila digesek.
       - Uji Api/Suhu: Mutiara asli terasa dingin saat pertama kali disentuh ke kulit, dan tidak meleleh atau berbau plastik jika terkena lidah api korek sesaat.
       - Sertifikasi: Selalu beli di toko/pengrajin berizin resmi di Sekarbela atau toko terpercaya yang menyertakan sertifikat grade mutu (AAA/AA) serta berat timbangan (gram).
     * Rute Belanja: [📍 Rute Google Maps: Sentra Mutiara Sekarbela](https://www.google.com/maps/search/?api=1&query=Sentra+Mutiara+Sekarbela+Mataram+Lombok)
  B. TIPS BELI KAIN TENUN SONGKET & TENUN IKAT (DESA SUKARARA):
     * Songket Asli Sulam Tangan: Ditenun manual di alat tenun kayu tradisional berbulan-bulan. Tekstur benang motif timbul di permukaan depan dan rapi di baliknya.
     * Tips Menawar Ramah dengan Basa Sasak: Ucapkan pujian tulus "Solah gati tenun niki!" (Indah sekali kain tenun ini!) lalu tawar dengan senyuman santai "Kelaq sekedik nggih?" (Boleh dikurangi sedikit ya harganya?).
     * Kisaran Harga Wajar: Syal/selendang tenun ikat harian sekitar Rp 50.000 - Rp 150.000. Kain sarung tenun ikat halus Rp 150.000 - Rp 350.000. Kain Songket benang emas/sutra motif penuh Subahnale/Keker sekitar Rp 600.000 hingga jutaan rupiah (sesuai kerumitan motif dan lama pembuatan).
     * Rute Belanja: [📍 Rute Google Maps: Desa Tenun Sukarara](https://www.google.com/maps/search/?api=1&query=Desa+Wisata+Tenun+Sukarara+Lombok)
  C. UJI KEASLIAN MADU HUTAN ASLI SUMBAWA / LOMBOK:
     * Uji Heksagonal Piring (Honeycomb Effect): Tuang 1-2 sendok makan madu di atas piring putih ceper, tambahkan sedikit air putih dingin, lalu goyang piring memutar perlahan selama 10-15 detik. Madu murni asli tanpa campuran gula akan membentuk pola heksagonal menyerupai sarang lebah!
     * Uji Larut Air Dingin: Teteskan madu ke dalam segelas air bening. Madu murni yang kental akan langsung tenggelam mengendap utuh di dasar gelas dan tidak langsung menyebar atau membuat air keruh.
  D. KULINER OLEH-OLEH TAHAN LAMA & AMAN BAGASI PESAWAT:
     * Dodol Rumput Laut Lombok: Sangat awet (tahan 6-12 bulan), kenyal manis segar, kaya serat rumput laut asli perairan Lombok.
     * Nasi Balap Puyung Kemasan Kering: Minta sambal kedelai dan abon ayam kampung dipisah dalam plastik kering kedap udara agar tahan hingga 24-48 jam perjalanan pulang.
     * Terasi Khas Lombok (Terasi Berontok / Jerowaru): Gurih harum khas fermentasi udang rebon asli. Pastikan membeli yang sudah divacuum rapat (kemasan kedap udara) agar lolos pemeriksaan maskapai dan tidak mengeluarkan aroma di kabin pesawat.
     * Kopi Asli Sembalun & Robusta Sajang: Kopi lereng Gunung Rinjani dengan cita rasa asam buah unik (Arabika Sembalun) atau aroma cokelat rempah (Robusta Sajang).

16. ${prayerReminderAlert ? prayerReminderAlert : 'Jawablah pertanyaan pengguna dengan baik dan profesional.'}
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
