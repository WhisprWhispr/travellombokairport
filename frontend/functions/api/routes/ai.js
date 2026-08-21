import { Hono } from 'hono';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const prompt = `Anda adalah asisten AI untuk website travel & rental.
Tugas Anda adalah membaca gambar brosur promosi ini (Sewa Mobil, Motor, Tour, dll) dan merangkum informasinya.
Tolong keluarkan HANYA JSON murni (tanpa tag \`\`\`json) dengan struktur berikut:
{
  "title": "Nama Layanan/Kendaraan/Tour (Singkat)",
  "price": 500000, 
  "category": "Sewa Mobil" atau "Sewa Motor" atau "Tour" atau "Lainnya",
  "description": "Fasilitas yang termasuk (include) atau deskripsi singkat.\\nFormat menggunakan bullet points (•) untuk setiap fasilitas."
}
Pastikan 'price' adalah angka murni tanpa titik atau huruf (contoh: 500000). Jika harga tidak ditemukan, set ke 0.
Pastikan HANYA mengembalikan text JSON yang bisa di-parse.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        return c.json({ success: true, data });
    } catch (error) {
        console.error('Error scanning image:', error);
        return c.json({ success: false, message: 'Gagal menganalisis gambar', error: error.message }, 500);
    }
});

export default aiRoutes;
