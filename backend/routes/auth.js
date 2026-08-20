const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

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

        // Check against Firestore 'admins' collection
        let admin = null;
        try {
            const snapshot = await db.collection('admins')
                .where('email', '==', email)
                .where('password', '==', password)
                .get();

            snapshot.forEach(doc => {
                admin = { id: doc.id, ...doc.data() };
            });
        } catch (dbError) {
            console.warn('DB query failed, trying fallback:', dbError.message);
        }

        // Fallback: hardcoded admin (for local dev / first-time setup)
        if (!admin) {
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'travellombokairport@gmail.com';
            const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
            
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                admin = { id: 'admin-1', email: ADMIN_EMAIL };
            }
        }

        if (!admin) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Generate token
        const token = generateToken({ id: admin.id, email: admin.email });

        res.json({
            success: true,
            token,
            admin: { id: admin.id, email: admin.email }
        });

    } catch (error) {
        console.error('Auth login error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
