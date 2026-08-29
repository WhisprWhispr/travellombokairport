import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb } from '../config/firebase.js';

const aiRoutes = new Hono();

// Middleware for auth
const verifyToken = async (c, next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Unauthorized: No token provided' }, 401);
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        await verify(token, secret, 'HS256');
    } catch (error) {
        console.error('Token verification error:', error);
        return c.json({ message: 'Unauthorized: Invalid token', error: error.message }, 403);
    }
    
    await next();
};

aiRoutes.post('/scan-image', verifyToken, async (c) => {
    let responseText = '';
    try {
        const body = await c.req.json();
        const { imageBase64 } = body;
        
        if (!imageBase64) {
            return c.json({ success: false, message: 'Gambar tidak ditemukan' }, 400);
        }

        const apiKey = c.env.GEMINI_API_KEY;
        if (!apiKey) {
            return c.json({ success: false, message: 'Server belum dikonfigurasi dengan GEMINI_API_KEY' }, 500);
        }

        // Strip data URI prefix to get raw base64
        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/, '');

        // Detect mime type from original data URI
        const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        const prompt = `Anda adalah asisten AI untuk website travel & rental di Lombok, Indonesia.
Tugas Anda: baca gambar brosur promosi ini dan ekstrak SEMUA informasi yang ada ke dalam format JSON.

Keluarkan HANYA JSON murni (TANPA markdown, TANPA backtick, TANPA penjelasan) dengan struktur berikut:
{
  "title": "Nama layanan/kendaraan/tour (singkat dan jelas)",
  "price": 500000,
  "category": "Sewa Mobil",
  "description": "Deskripsi singkat tentang layanan ini",
  "duration": "hari",
  "transmission": "Matic",
  "driverOptions": "Include Driver",
  "seats": 7,
  "packageType": "PAKET - A",
  "itinerary": "DAY 1: Sasak Tour\\n- Desa Sade\\n- Pantai Kuta\\n\\nDAY 2: Gili Trawangan\\n- Snorkeling",
  "include": "Transportasi Private Full AC\\nDriver profesional\\nBBM\\nAir mineral",
  "exclude": "Tiket pesawat\\nHotel/Penginapan\\nMakan & minum",
  "terms": "1. DP minimal 30%\\n2. Pelunasan saat penjemputan",
  "transferMatrix": [
    {"area": "Kuta Lombok / Bandara", "prices": {"Avanza Grand/FL": 150000, "Innova Reborn": 250000, "Hiace Komuter": 400000}},
    {"area": "Senggigi", "prices": {"Avanza Grand/FL": 250000, "Innova Reborn": 350000, "Hiace Komuter": 500000}}
  ]
}

ATURAN PENTING:
- "category": HARUS salah satu dari: "Sewa Mobil", "Sewa Motor", "Tour", "Jasa Antar Jemput", atau "Dokumentasi Drone"
- "price": angka murni tanpa titik/koma/huruf (contoh: 500000). Jika tidak ada, set 0
- "duration": satuan waktu seperti "hari", "12 Jam", "3H 2M", "24 Jam". Jika tidak ada, set ""
- "transmission": "Manual", "Matic", atau "Matic / Manual". Hanya untuk kendaraan. Jika tidak relevan, set ""
- "driverOptions": "Include Driver" atau "Tidak Include Driver". Hanya untuk mobil. Jika tidak relevan, set ""
- "seats": jumlah kursi/kapasitas (angka). Jika tidak ada, set 0
- "packageType": tipe paket tour seperti "PAKET - A", "PAKET - B". Jika tidak relevan, set ""
- "itinerary": jadwal perjalanan tour. Pisahkan hari dengan \\n\\n dan item dengan \\n-. Jika tidak ada, set ""
- "include": fasilitas yang TERMASUK dalam harga, satu per baris dipisah \\n. Jika tidak ada, set ""
- "exclude": yang TIDAK termasuk dalam harga, satu per baris dipisah \\n. Jika tidak ada, set ""
- "terms": syarat dan ketentuan booking/sewa yang tercantum di brosur, pisahkan dengan \\n. Jika tidak ada, set ""
- "description": deskripsi umum layanan. Jika tidak ada info khusus, buat ringkasan dari gambar
- "transferMatrix": WAJIB diisi jika category adalah "Jasa Antar Jemput". Ini adalah tabel harga antar-jemput airport berdasarkan area tujuan dan jenis kendaraan. Format: array of objects [{area: "nama area", prices: {"Nama Kendaraan": harga_angka}}]. Ekstrak SEMUA baris area dan SEMUA kolom kendaraan yang terlihat di gambar/brosur. Jika bukan kategori antar jemput atau tidak ada tabel harga, set []

Baca SEMUA teks yang terlihat di gambar dan masukkan ke field yang sesuai.
Pastikan HANYA mengembalikan JSON yang valid. Jangan tambahkan apapun selain JSON.`;

        // Models to try (fallback if primary is overloaded)
        const models = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
        const requestBody = JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192
            }
        });

        let geminiResponse = null;
        let lastError = '';

        // Try each model with retry
        for (const model of models) {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            for (let attempt = 1; attempt <= 2; attempt++) {
                geminiResponse = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: requestBody
                });

                if (geminiResponse.ok) break;
                
                lastError = `${model} attempt ${attempt}: status ${geminiResponse.status}`;
                console.error(lastError);

                // If 503 (overloaded) or 429 (quota), wait briefly and retry once, then try next model
                if ((geminiResponse.status === 503 || geminiResponse.status === 429) && attempt < 2) {
                    await new Promise(r => setTimeout(r, 2500));
                    continue;
                }
                break; // Try next model
            }
            if (geminiResponse && geminiResponse.ok) break;
        }

        if (!geminiResponse || !geminiResponse.ok) {
            const errBody = geminiResponse ? await geminiResponse.text() : 'No response';
            console.error('All Gemini models failed:', lastError, errBody);
            return c.json({ success: false, message: 'Server AI sedang sibuk, coba lagi dalam beberapa detik.', detail: lastError }, 503);
        }

        const geminiResult = await geminiResponse.json();

        // Extract the text from Gemini response
        responseText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            console.error('No text in Gemini response:', JSON.stringify(geminiResult));
            return c.json({ success: false, message: 'AI tidak mengembalikan teks', detail: JSON.stringify(geminiResult).substring(0, 500) }, 500);
        }

        // === ROBUST JSON PARSER ===
        // Step 1: Strip markdown code fences
        let text = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        // Step 2: Find the JSON object boundaries
        const firstBrace = text.indexOf('{');
        if (firstBrace === -1) {
            return c.json({ success: false, message: 'AI tidak mengembalikan format JSON', rawPreview: responseText.substring(0, 300) }, 500);
        }

        // Find matching closing brace by counting
        let depth = 0;
        let lastBrace = -1;
        for (let i = firstBrace; i < text.length; i++) {
            const ch = text[i];
            if (ch === '"') {
                // Skip over string content
                i++;
                while (i < text.length && text[i] !== '"') {
                    if (text[i] === '\\') i++; // skip escaped char
                    i++;
                }
                continue;
            }
            if (ch === '{') depth++;
            if (ch === '}') {
                depth--;
                if (depth === 0) { lastBrace = i; break; }
            }
        }

        // If no matching closing brace found (truncated response), add closing brackets
        let jsonStr;
        if (lastBrace === -1) {
            jsonStr = text.substring(firstBrace);
            // Count open brackets and close them
            let openCurly = 0, openSquare = 0;
            let inStr = false;
            for (let i = 0; i < jsonStr.length; i++) {
                if (jsonStr[i] === '"' && (i === 0 || jsonStr[i-1] !== '\\')) inStr = !inStr;
                if (inStr) continue;
                if (jsonStr[i] === '{') openCurly++;
                if (jsonStr[i] === '}') openCurly--;
                if (jsonStr[i] === '[') openSquare++;
                if (jsonStr[i] === ']') openSquare--;
            }
            // Remove trailing comma if any
            jsonStr = jsonStr.replace(/,\s*$/, '');
            jsonStr += ']'.repeat(Math.max(0, openSquare)) + '}'.repeat(Math.max(0, openCurly));
        } else {
            jsonStr = text.substring(firstBrace, lastBrace + 1);
        }

        // Step 3: Apply fixes
        // Fix trailing commas
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
        // Fix missing commas between objects
        jsonStr = jsonStr.replace(/\}\s*\{/g, '},{');
        // Fix single quotes to double quotes (but be careful with apostrophes in text)
        // Only fix quotes that look like JSON delimiters
        jsonStr = jsonStr.replace(/:\s*'([^']*)'/g, ': "$1"');
        jsonStr = jsonStr.replace(/,\s*'([^']*)'\s*:/g, ', "$1":');

        // Step 4: Try to parse
        const tryParse = (s) => { try { return JSON.parse(s); } catch(e) { return null; } };
        
        let data = tryParse(jsonStr);
        
        if (!data) {
            // More aggressive: replace ALL single quotes with double quotes
            let aggressive = jsonStr.replace(/'/g, '"');
            aggressive = aggressive.replace(/,\s*([\]}])/g, '$1');
            data = tryParse(aggressive);
        }

        if (!data) {
            // Nuclear option: try to fix raw newlines inside strings
            let nuclear = jsonStr.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, (match) => {
                return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            });
            nuclear = nuclear.replace(/,\s*([\]}])/g, '$1');
            data = tryParse(nuclear);
        }

        if (!data) {
            return c.json({ 
                success: false, 
                message: 'AI berhasil membaca gambar tapi format JSON-nya rusak. Silakan coba scan ulang.', 
                rawPreview: responseText.substring(0, 500) 
            }, 500);
        }

        return c.json({ success: true, data });
    } catch (error) {
        console.error('Error scanning image:', error);
        let debugText = responseText ? responseText.substring(0, 300) + '...' : 'empty';
        return c.json({ success: false, message: 'Gagal menganalisis gambar: ' + (error.message || 'Unknown error') + ' | RAW: ' + debugText }, 500);
    }
});

aiRoutes.post('/chat', async (c) => {
    try {
        const body = await c.req.json();
        const { message, history, sessionId, userTimeZone, prayerData } = body;
        
        if (!message) {
            return c.json({ success: false, message: 'Pesan kosong' }, 400);
        }

        const apiKey = c.env.GEMINI_API_KEY;
        if (!apiKey) {
            return c.json({ success: false, message: 'Server belum dikonfigurasi dengan GEMINI_API_KEY' }, 500);
        }

        // Fetch data context
        let contextData = '';
        try {
            const db = getDb(c);
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

        // Fetch Knowledge Base
        let knowledgeBaseContext = '';
        try {
            const db = getDb(c);
            const snapshot = await db.collection('ai_knowledge_base').where('isActive', '==', true).get();
            const rules = [];
            snapshot.forEach(doc => rules.push(doc.data().rule));
            if (rules.length > 0) {
                knowledgeBaseContext = `\nINSTRUKSI KHUSUS DARI ADMIN (KNOWLEDGE BASE):\n` + rules.map((r, i) => `${i+1}. ${r}`).join('\n');
            }
        } catch (e) {
            console.error("Gagal menarik data knowledge base", e);
        }

        // Fetch Recent Chats for Context
        let recentChatsContext = '';
        try {
            const db = getDb(c);
            const recentChatsSnapshot = await db.collection('chat_sessions').orderBy('lastUpdate', 'desc').limit(10).get();
            const recentQuestions = [];
            recentChatsSnapshot.forEach(doc => {
                const sessionHistory = doc.data().history || [];
                sessionHistory.forEach(msg => {
                    if (msg.role === 'user') {
                        recentQuestions.push(msg.parts[0].text);
                    }
                });
            });
            
            if (recentQuestions.length > 0) {
                const uniqueQuestions = [...new Set(recentQuestions)].slice(0, 10);
                recentChatsContext = `\nKONTEKS TREN PERTANYAAN (10 Pertanyaan terakhir dari pengguna lain, gunakan hanya jika relevan):\n` + uniqueQuestions.map(q => `- "${q}"`).join('\n');
            }
        } catch (e) {
            console.error("Gagal menarik data riwayat obrolan terbaru", e);
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

        // Combine history and new message
        const contents = [
            {
                role: "user",
                parts: [{ text: systemPrompt }]
            },
            {
                role: "model",
                parts: [{ text: "Siap! Saya mengerti instruksi tersebut dan siap membantu pelanggan dengan ramah berdasarkan data layanan yang ada." }]
            },
            ...(history || []),
            {
                role: "user",
                parts: [{ text: message }]
            }
        ];

        const requestBody = JSON.stringify({
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096
            }
        });

        const models = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
        let geminiResponse = null;
        let lastError = '';

        for (const model of models) {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            geminiResponse = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody
            });

            if (geminiResponse.ok) break;

            const errBody = await geminiResponse.text();
            lastError = errBody;
            console.error(`Gemini error for model ${model}:`, errBody);

            if (geminiResponse.status === 429 || geminiResponse.status === 503) {
                await new Promise(resolve => setTimeout(resolve, 2500));
            }
        }

        if (!geminiResponse || !geminiResponse.ok) {
            return c.json({ success: false, message: 'Kuota API habis atau server sibuk. Silakan coba lagi nanti.', detail: lastError }, 503);
        }

        const geminiResult = await geminiResponse.json();
        const replyText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa merespons saat ini.";

        // Save to Firebase chat_sessions
        try {
            const db = getDb(c);
            const currentSessionId = sessionId || 'guest_' + Date.now();
            const docRef = db.collection('chat_sessions').doc(currentSessionId);
            
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

        return c.json({ success: true, reply: replyText });

    } catch (error) {
        console.error('Error in AI chat:', error);
        return c.json({ success: false, message: 'Gagal merespons obrolan', error: error.message }, 500);
    }
});

aiRoutes.get('/sessions', async (c) => {
    try {
        // Accept either a valid JWT OR an admin_key header for backwards compat
        const authHeader = c.req.header('authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;
        
        if (!token) {
            return c.json({ message: 'Unauthorized: No token provided' }, 401);
        }

        // Try to verify JWT (accept both Cloudflare and legacy tokens by trying verify)
        try {
            const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
            await verify(token, secret, 'HS256');
        } catch (e) {
            // Also accept legacy secret
            try {
                await verify(token, 'your_jwt_secret', 'HS256');
            } catch (e2) {
                return c.json({ message: 'Unauthorized: Invalid token', error: e.message }, 403);
            }
        }

        const db = getDb(c);
        const snapshot = await db.collection('chat_sessions').get();
        const sessions = [];
        snapshot.forEach(doc => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        
        sessions.sort((a, b) => new Date(b.lastUpdate || 0) - new Date(a.lastUpdate || 0));
        
        return c.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        return c.json({ success: false, message: 'Gagal mengambil riwayat obrolan', error: error.message }, 500);
    }
});

// GET Knowledge Base
aiRoutes.get('/knowledge-base', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const snapshot = await db.collection('ai_knowledge_base').orderBy('createdAt', 'desc').get();
        const rules = [];
        snapshot.forEach(doc => {
            rules.push({ id: doc.id, ...doc.data() });
        });
        return c.json({ success: true, data: rules });
    } catch (error) {
        console.error('Error fetching knowledge base:', error);
        return c.json({ success: false, message: 'Gagal mengambil knowledge base' }, 500);
    }
});

// POST Knowledge Base
aiRoutes.post('/knowledge-base', verifyToken, async (c) => {
    try {
        const { rule } = await c.req.json();
        if (!rule) {
            return c.json({ success: false, message: 'Aturan tidak boleh kosong' }, 400);
        }
        
        const newRule = {
            rule,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        const db = getDb(c);
        const docRef = await db.collection('ai_knowledge_base').add(newRule);
        return c.json({ success: true, message: 'Aturan berhasil ditambahkan', data: { id: docRef.id, ...newRule } });
    } catch (error) {
        console.error('Error adding knowledge base:', error);
        return c.json({ success: false, message: 'Gagal menambahkan aturan' }, 500);
    }
});

// DELETE Knowledge Base
aiRoutes.delete('/knowledge-base/:id', verifyToken, async (c) => {
    try {
        const id = c.req.param('id');
        const db = getDb(c);
        await db.collection('ai_knowledge_base').doc(id).delete();
        return c.json({ success: true, message: 'Aturan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting knowledge base:', error);
        return c.json({ success: false, message: 'Gagal menghapus aturan' }, 500);
    }
});

export default aiRoutes;
