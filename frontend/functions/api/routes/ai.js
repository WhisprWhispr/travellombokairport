import { Hono } from 'hono';
import { verify } from 'hono/jwt';

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
        const models = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
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
                maxOutputTokens: 2048
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

                // If 503 (overloaded), wait briefly and retry
                if (geminiResponse.status === 503 && attempt < 2) {
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                }
                break; // For non-503 errors, try next model
            }
            if (geminiResponse && geminiResponse.ok) break;
        }

        if (!geminiResponse || !geminiResponse.ok) {
            const errBody = geminiResponse ? await geminiResponse.text() : 'No response';
            console.error('All Gemini models failed:', lastError, errBody);
            return c.json({ success: false, message: 'Server AI sedang sibuk, coba lagi dalam beberapa detik.', detail: lastError }, 503);
        }

        const geminiResult = await geminiResponse.json();

        let responseText = '';
        // Extract the text from Gemini response
        responseText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            console.error('No text in Gemini response:', JSON.stringify(geminiResult));
            return c.json({ success: false, message: 'AI tidak mengembalikan teks', detail: JSON.stringify(geminiResult).substring(0, 500) }, 500);
        }

        // Clean up and parse JSON
        let cleanJson = responseText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        // Fix: Gemini sometimes puts raw newlines inside JSON string values
        cleanJson = cleanJson.replace(/("(?:[^"\\]|\\.)*")/gs, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        });

        // Fix: Remove trailing commas before } or ] (common Gemini mistake)
        cleanJson = cleanJson.replace(/,\s*([\]}])/g, '$1');

        // Fix: Missing commas between objects or arrays (common LLM generation error)
        cleanJson = cleanJson.replace(/\}\s*\{/g, '},{');
        cleanJson = cleanJson.replace(/\]\s*\[/g, '],[');

        // Helper to safely try parsing JSON
        const tryParseJSON = (str) => {
            try { return JSON.parse(str); } catch (e) { return null; }
        };

        let data = tryParseJSON(cleanJson);
        
        if (!data) {
            // Try fixing single quotes -> double quotes
            let fixedJson = cleanJson
                .replace(/'/g, '"')
                .replace(/,\s*([\]}])/g, '$1');
            data = tryParseJSON(fixedJson);
        }

        if (!data) {
            // Last resort: extract JSON object from surrounding text
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                let extracted = jsonMatch[0]
                    .replace(/("(?:[^"\\]|\\.)*")/gs, (m) => m.replace(/\n/g, '\\n').replace(/\r/g, '\\r'))
                    .replace(/,\s*([\]}])/g, '$1');
                data = tryParseJSON(extracted);
                if (!data) {
                    extracted = extracted.replace(/'/g, '"').replace(/,\s*([\]}])/g, '$1');
                    data = JSON.parse(extracted);
                }
            } else {
                throw new Error('Tidak dapat menemukan JSON dalam respons AI');
            }
        }

        return c.json({ success: true, data });
    } catch (error) {
        console.error('Error scanning image:', error);
        let debugText = typeof responseText !== 'undefined' ? responseText.substring(0, 150) + '...' : '';
        return c.json({ success: false, message: 'Gagal menganalisis gambar: ' + (error.message || 'Unknown error') + ' | RAW: ' + debugText }, 500);
    }
});

export default aiRoutes;
