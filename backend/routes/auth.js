const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const axios = require('axios'); // Tambahkan axios untuk request REST API

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
router.post('/login', async (req, res) => {
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
            
            // Generate token internal sistem
            const token = generateToken({ id: firebaseUser.localId, email: firebaseUser.email });

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

module.exports = router;
