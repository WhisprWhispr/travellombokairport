import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { getDb } from '../config/firebase.js';

const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
    try {
        const db = getDb(c);
        const { email, password } = await c.req.json();
        
        if (!email || !password) {
            return c.json({ error: 'Email dan password wajib diisi.' }, 400);
        }

        const apiKey = c.env.FIREBASE_API_KEY;
        if (!apiKey) {
            return c.json({ 
                error: 'Sistem belum siap. FIREBASE_API_KEY tidak ditemukan di Cloudflare Secrets (Variables and Secrets). Silakan tambahkan Web API Key Anda di dashboard Cloudflare.' 
            }, 500);
        }

        let firebaseUser;
        try {
            // Verifikasi password ke Firebase Authentication menggunakan REST API
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                let errorMessage = 'Email atau password salah.';
                if (data.error && data.error.message) {
                    const fbErr = data.error.message;
                    if (fbErr === 'EMAIL_NOT_FOUND' || fbErr === 'INVALID_LOGIN_CREDENTIALS') {
                        errorMessage = 'Email atau password salah!';
                    } else if (fbErr === 'INVALID_PASSWORD') {
                        errorMessage = 'Password salah!';
                    } else {
                        errorMessage = `Firebase Error: ${fbErr}`;
                    }
                }
                return c.json({ error: errorMessage }, 401);
            }
            
            firebaseUser = data;
        } catch (fetchError) {
            return c.json({ error: 'Gagal terhubung ke Firebase Auth server.' }, 502);
        }

        // Generate Hono JWT token
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const payload = {
            id: firebaseUser.localId,
            email: firebaseUser.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
        };
        
        const token = await sign(payload, secret);
        
        return c.json({
            success: true,
            token,
            admin: { id: firebaseUser.localId, email: firebaseUser.email }
        });

    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST /api/auth/reset-password
authRoutes.post('/reset-password', async (c) => {
    try {
        const { email } = await c.req.json();
        
        if (!email) {
            return c.json({ error: 'Email wajib diisi.' }, 400);
        }

        const apiKey = c.env.FIREBASE_API_KEY;
        if (!apiKey) {
            return c.json({ 
                error: 'Sistem belum siap. FIREBASE_API_KEY tidak ditemukan di Cloudflare Secrets (Variables and Secrets).' 
            }, 500);
        }

        try {
            // Meminta Firebase untuk mengirim email reset sandi
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestType: 'PASSWORD_RESET',
                    email: email
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                let errorMessage = 'Gagal mengirim email reset sandi.';
                if (data.error && data.error.message) {
                    const fbErr = data.error.message;
                    if (fbErr === 'EMAIL_NOT_FOUND') {
                        errorMessage = 'Email tidak terdaftar di sistem kami.';
                    } else {
                        errorMessage = `Firebase Error: ${fbErr}`;
                    }
                }
                return c.json({ error: errorMessage }, 400);
            }
            
            return c.json({
                success: true,
                message: 'Link reset sandi telah dikirim ke email Anda.'
            });
            
        } catch (fetchError) {
            return c.json({ error: 'Gagal terhubung ke Firebase Auth server.' }, 502);
        }
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default authRoutes;
