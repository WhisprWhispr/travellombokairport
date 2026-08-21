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
  "exclude": "Tiket pesawat\\nHotel/Penginapan\\nMakan & minum"
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
- "description": deskripsi umum layanan. Jika tidak ada info khusus, buat ringkasan dari gambar

Baca SEMUA teks yang terlihat di gambar dan masukkan ke field yang sesuai.
Pastikan HANYA mengembalikan JSON yang valid. Jangan tambahkan apapun selain JSON.`;

        // Call Gemini REST API directly (no SDK needed - works perfectly in Cloudflare Workers)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
                    maxOutputTokens: 1024
                }
            })
        });

        if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            console.error('Gemini API error:', geminiResponse.status, errBody);
            return c.json({ success: false, message: `Gemini API error: ${geminiResponse.status}`, detail: errBody }, 500);
        }

        const geminiResult = await geminiResponse.json();

        // Extract the text from Gemini response
        const responseText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            console.error('No text in Gemini response:', JSON.stringify(geminiResult));
            return c.json({ success: false, message: 'AI tidak mengembalikan teks', detail: JSON.stringify(geminiResult).substring(0, 500) }, 500);
        }

        // Clean up and parse JSON
        let cleanJson = responseText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        const data = JSON.parse(cleanJson);

        return c.json({ success: true, data });
    } catch (error) {
        console.error('Error scanning image:', error);
        return c.json({ success: false, message: 'Gagal menganalisis gambar: ' + (error.message || 'Unknown error') }, 500);
    }
});

export default aiRoutes;
