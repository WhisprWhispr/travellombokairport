const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const axios = require('axios'); // Tambahkan axios untuk request REST API
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// Rate limiter: maksimal 5 kali percobaan dalam 15 menit
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // limit setiap IP maksimal 5 request per windowMs
    message: { error: 'Terlalu banyak percobaan, silakan coba lagi setelah 15 menit.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Simple JWT-like token generation (for local dev)
const generateToken = (payload) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    })).toString('base64url');
    const signature = Buffer.from('local-dev-signature').toString('base64url');
    return `${header}.${body}.${signature}`;
};

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi.' });
        }

        const apiKey = process.env.FIREBASE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'Sistem belum siap. FIREBASE_API_KEY tidak ditemukan di backend/.env. Silakan masukkan Web API Key dari Firebase Console ke file .env.' 
            });
        }

        try {
            // Verifikasi password ke Firebase Authentication menggunakan REST API
            const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                email: email,
                password: password,
                returnSecureToken: true
            });

            // Jika berhasil, Firebase akan mengembalikan idToken dan localId
            const firebaseUser = response.data;
            
            // Gunakan token asli dari Firebase agar bisa diverifikasi oleh admin.auth.verifyIdToken
            const token = firebaseUser.idToken;

            return res.json({
                success: true,
                token,
                admin: { id: firebaseUser.localId, email: firebaseUser.email }
            });

        } catch (firebaseError) {
            // Jika login gagal dari sisi Firebase (salah password, email tidak terdaftar, dll)
            let errorMessage = 'Email atau password salah.';
            if (firebaseError.response && firebaseError.response.data && firebaseError.response.data.error) {
                const fbErr = firebaseError.response.data.error.message;
                if (fbErr === 'EMAIL_NOT_FOUND' || fbErr === 'INVALID_LOGIN_CREDENTIALS') {
                    errorMessage = 'Email atau password salah!';
                } else if (fbErr === 'INVALID_PASSWORD') {
                    errorMessage = 'Password salah!';
                } else {
                    errorMessage = `Firebase Error: ${fbErr}`;
                }
            }
            return res.status(401).json({ error: errorMessage });
        }

    } catch (error) {
        console.error('Auth login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email wajib diisi.' });
        }

        const apiKey = process.env.FIREBASE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'Sistem belum siap. FIREBASE_API_KEY tidak ditemukan di .env.' 
            });
        }

        try {
            // Meminta Firebase untuk mengirim email reset sandi
            await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
                requestType: 'PASSWORD_RESET',
                email: email
            });

            return res.json({
                success: true,
                message: 'Link reset sandi telah dikirim ke email Anda.'
            });

        } catch (firebaseError) {
            let errorMessage = 'Gagal mengirim email reset sandi.';
            if (firebaseError.response && firebaseError.response.data && firebaseError.response.data.error) {
                const fbErr = firebaseError.response.data.error.message;
                if (fbErr === 'EMAIL_NOT_FOUND') {
                    errorMessage = 'Email tidak terdaftar di sistem kami.';
                } else {
                    errorMessage = `Firebase Error: ${fbErr}`;
                }
            }
            return res.status(400).json({ error: errorMessage });
        }

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/upload-avatar
router.post('/upload-avatar', async (req, res) => {
    try {
        const { imageBase64, imageUrl, idToken } = req.body;
        if ((!imageBase64 && !imageUrl) || !idToken) {
            return res.status(400).json({ error: 'Image dan token wajib diisi.' });
        }

        let finalImageUrl = imageUrl;

        // 1. Upload to Cloudinary jika ada base64
        if (imageBase64) {
            const cloudName = 'mvhjuh83';
            const apiKey = '636819913243949';
            const apiSecret = 'Klov4BCszxgMpPmr_PUD9GFvgJw';
            
            const timestamp = Math.round((new Date).getTime() / 1000);
            const strToSign = `timestamp=${timestamp}${apiSecret}`;
            const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

            const cloudinaryRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                file: imageBase64,
                api_key: apiKey,
                timestamp: timestamp,
                signature: signature
            });

            finalImageUrl = cloudinaryRes.data.secure_url;
        }

        // 2. Update Firebase Auth Profile
        const firebaseApiKey = process.env.FIREBASE_API_KEY;
        await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseApiKey}`, {
            idToken: idToken,
            photoUrl: finalImageUrl,
            returnSecureToken: true
        });

        res.json({ success: true, url: finalImageUrl });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: error.message || 'Gagal mengunggah foto profil' });
    }
});

module.exports = router;
