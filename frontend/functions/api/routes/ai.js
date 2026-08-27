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
        await next();
    } catch (error) {
        return c.json({ message: 'Unauthorized: Invalid token' }, 403);
    }
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
        const { message, history } = body;
        
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

        return c.json({ success: true, reply: replyText });

    } catch (error) {
        console.error('Error in AI chat:', error);
        return c.json({ success: false, message: 'Gagal merespons obrolan', error: error.message }, 500);
    }
});

export default aiRoutes;
