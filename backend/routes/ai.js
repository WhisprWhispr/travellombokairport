const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

module.exports = router;
