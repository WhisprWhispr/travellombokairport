import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { getDb } from '../config/firebase.js';

const authRoutes = new Hono();

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const checkRateLimit = (ip) => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 menit
    const max = 5; // maksimal 5 kali

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    
    let timestamps = rateLimitMap.get(ip);
    // Hapus timestamp yang sudah lebih dari 15 menit
    timestamps = timestamps.filter(t => now - t < windowMs);
    
    if (timestamps.length >= max) {
        return false;
    }
    
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);
    
    // Basic cleanup agar map tidak bocor memorinya terlalu besar
    if (rateLimitMap.size > 10000) {
        rateLimitMap.clear();
    }
    
    return true;
};

authRoutes.post('/login', async (c) => {
    try {
        const ip = c.req.header('cf-connecting-ip') || 'unknown';
        if (!checkRateLimit(ip)) {
            return c.json({ error: 'Terlalu banyak percobaan, silakan coba lagi setelah 15 menit.' }, 429);
        }

        const db = getDb(c);
        const { email, password, turnstileToken } = await c.req.json();
        
        if (!email || !password) {
            return c.json({ error: 'Email dan password wajib diisi.' }, 400);
        }

        if (!turnstileToken) {
            return c.json({ error: 'Verifikasi keamanan (Turnstile) diperlukan.' }, 400);
        }

        // Verifikasi Turnstile
        const tsSecret = c.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
        const tsResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${tsSecret}&response=${turnstileToken}`
        });
        const tsData = await tsResponse.json();
        if (!tsData.success) {
            return c.json({ error: 'Verifikasi keamanan gagal, harap muat ulang halaman.' }, 400);
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

            // Cek apakah email sudah diverifikasi
            const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: firebaseUser.idToken })
            });
            const lookupData = await lookupRes.json();
            
            if (lookupData.users && lookupData.users[0]) {
                if (!lookupData.users[0].emailVerified) {
                    // Send Email Verification again
                    try {
                        const continueUrl = 'https://www.travellombokairport.com/verify.html';
                        await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                requestType: 'VERIFY_EMAIL',
                                idToken: firebaseUser.idToken,
                                continueUrl: continueUrl
                            })
                        });
                    } catch (e) {
                        console.error("Gagal mengirim ulang email verifikasi saat login", e);
                    }

                    return c.json({ 
                        error: 'Akun Anda belum diverifikasi. Link verifikasi baru telah dikirim ulang ke email Anda. Silakan cek kotak masuk (atau folder spam).',
                        unverified: true 
                    }, 403);
                }
            }

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
        
        try {
            const userAgent = c.req.header('user-agent') || 'Unknown';
            await db.collection('login_logs').add({
                email: firebaseUser.email,
                ip: ip,
                userAgent: userAgent,
                type: 'login',
                timestamp: new Date().toISOString()
            });
        } catch (logErr) {
            console.error('Failed to save login log:', logErr);
        }
        
        return c.json({
            success: true,
            token,
            admin: { id: firebaseUser.localId, email: firebaseUser.email }
        });

    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST /api/auth/google
authRoutes.post('/google', async (c) => {
    try {
        const { idToken } = await c.req.json();
        
        if (!idToken) {
            return c.json({ error: 'Token Google tidak valid.' }, 400);
        }

        const apiKey = c.env.FIREBASE_API_KEY;
        if (!apiKey) {
            return c.json({ error: 'System error: API Key missing' }, 500);
        }

        let firebaseUser;
        try {
            // Verifikasi Firebase ID Token (didapat dari Google Auth) via Firebase REST API
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            });

            const data = await response.json();
            
            if (!response.ok || !data.users || data.users.length === 0) {
                return c.json({ error: 'Token otentikasi tidak valid atau telah kadaluarsa.' }, 401);
            }
            
            firebaseUser = data.users[0];
            
            // Simpan akun ke Firestore jika belum ada (opsional)
            try {
                const db = getDb(c);
                const doc = await db.collection('user_accounts').doc(firebaseUser.localId).get();
                if (!doc.exists) {
                    await db.collection('user_accounts').doc(firebaseUser.localId).set({
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || '',
                        authProvider: 'google',
                        createdAt: new Date().toISOString()
                    });
                }
                
                const ip = c.req.header('cf-connecting-ip') || 'unknown';
                const userAgent = c.req.header('user-agent') || 'Unknown';
                await db.collection('login_logs').add({
                    email: firebaseUser.email,
                    ip: ip,
                    userAgent: userAgent,
                    type: 'login_google',
                    timestamp: new Date().toISOString()
                });
            } catch (dbError) {
                console.error("Firestore logging error for google auth:", dbError);
            }

        } catch (fetchError) {
            return c.json({ error: 'Gagal memverifikasi token ke server.' }, 502);
        }

        // Generate Hono JWT token lokal
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const payload = {
            id: firebaseUser.localId,
            email: firebaseUser.email,
            name: firebaseUser.displayName || '',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
        };
        
        const token = await sign(payload, secret);
        
        return c.json({
            success: true,
            token,
            user: { id: firebaseUser.localId, email: firebaseUser.email, name: firebaseUser.displayName || '' }
        });

    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST /api/auth/register
authRoutes.post('/register', async (c) => {
    try {
        const ip = c.req.header('cf-connecting-ip') || 'unknown';
        if (!checkRateLimit(ip)) {
            return c.json({ error: 'Terlalu banyak percobaan, silakan coba lagi setelah 15 menit.' }, 429);
        }

        const { email, password, name, turnstileToken } = await c.req.json();
        
        if (!email || !password) {
            return c.json({ error: 'Email dan password wajib diisi.' }, 400);
        }

        if (!turnstileToken) {
            return c.json({ error: 'Verifikasi keamanan (Turnstile) diperlukan.' }, 400);
        }

        // Verifikasi Turnstile
        const tsSecret = c.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
        const tsResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${tsSecret}&response=${turnstileToken}`
        });
        const tsData = await tsResponse.json();
        if (!tsData.success) {
            return c.json({ error: 'Verifikasi keamanan gagal, harap muat ulang halaman.' }, 400);
        }

        if (password.length < 6) {
            return c.json({ error: 'Password minimal 6 karakter.' }, 400);
        }

        const apiKey = c.env.FIREBASE_API_KEY;
        if (!apiKey) {
            return c.json({ error: 'System error: API Key missing' }, 500);
        }

        let firebaseUser;
        try {
            // Mendaftar ke Firebase Authentication
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
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
                let errorMessage = 'Gagal mendaftar.';
                if (data.error && data.error.message) {
                    if (data.error.message === 'EMAIL_EXISTS') {
                        errorMessage = 'Email sudah terdaftar. Silakan login.';
                    } else {
                        errorMessage = `Firebase Error: ${data.error.message}`;
                    }
                }
                return c.json({ error: errorMessage }, 400);
            }
            
            firebaseUser = data;

            // Optional: Update profil dengan nama
            if (name) {
                await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idToken: firebaseUser.idToken,
                        displayName: name,
                        returnSecureToken: false
                    })
                });
            }

            // Send Email Verification dengan continueUrl ke halaman verify kita
            const continueUrl = 'https://www.travellombokairport.com/verify.html';
            await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestType: 'VERIFY_EMAIL',
                    idToken: firebaseUser.idToken,
                    continueUrl: continueUrl
                })
            });

            // Save to Firestore for admin panel
            try {
                const db = getDb(c);
                await db.collection('user_accounts').doc(firebaseUser.localId).set({
                    email: email,
                    password: password,
                    name: name || '',
                    createdAt: new Date().toISOString()
                });
            } catch (dbError) {
                console.error("Gagal menyimpan akun ke Firestore:", dbError);
            }

        } catch (fetchError) {
            return c.json({ error: 'Gagal terhubung ke Firebase Auth server.' }, 502);
        }

        // Generate Hono JWT token
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const payload = {
            id: firebaseUser.localId,
            email: firebaseUser.email,
            name: name || '',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
        };
        
        const token = await sign(payload, secret);

        return c.json({
            success: true,
            requiresVerification: true,
            pollingToken: firebaseUser.idToken,
            token: token,
            user: { id: firebaseUser.localId, email: firebaseUser.email, name: name || '' },
            message: 'Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi akun.'
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

// POST /api/auth/confirm-reset-password
authRoutes.post('/confirm-reset-password', async (c) => {
    try {
        const { oobCode, newPassword } = await c.req.json();
        
        if (!oobCode || !newPassword) {
            return c.json({ error: 'Kode dan sandi baru wajib diisi.' }, 400);
        }

        const apiKey = c.env.FIREBASE_API_KEY;
        if (!apiKey) {
            return c.json({ error: 'System error: API Key missing' }, 500);
        }

        let resetData;
        try {
            // 1. Submit the new password to Firebase
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oobCode: oobCode,
                    newPassword: newPassword
                })
            });

            resetData = await response.json();
            
            if (!response.ok) {
                let errorMessage = 'Gagal mereset sandi.';
                if (resetData.error && resetData.error.message) {
                    if (resetData.error.message === 'INVALID_OOB_CODE') {
                        errorMessage = 'Kode reset sandi tidak valid atau sudah kadaluarsa.';
                    } else if (resetData.error.message === 'WEAK_PASSWORD') {
                        errorMessage = 'Kata sandi terlalu lemah.';
                    } else {
                        errorMessage = `Firebase Error: ${resetData.error.message}`;
                    }
                }
                return c.json({ error: errorMessage }, 400);
            }
            
            // 2. Jika berhasil, kita simpan kata sandi baru ke Firestore untuk Admin Panel
            if (resetData.email) {
                try {
                    const db = getDb(c);
                    const snapshot = await db.collection('user_accounts').where('email', '==', resetData.email).get();
                    if (!snapshot.empty) {
                        snapshot.forEach(async (doc) => {
                            await db.collection('user_accounts').doc(doc.id).update({ 
                                password: newPassword,
                                updatedAt: new Date().toISOString()
                            });
                        });
                    } else {
                        // Jika tidak ada di user_accounts (akun lama), kita buat dokumen baru
                        await db.collection('user_accounts').add({
                            email: resetData.email,
                            password: newPassword,
                            name: 'Migrated User', // tidak tahu nama aslinya
                            updatedAt: new Date().toISOString()
                        });
                    }
                } catch (dbError) {
                    console.error("Gagal menyimpan sandi baru ke Firestore:", dbError);
                }
            }

            return c.json({
                success: true,
                message: 'Kata sandi berhasil diubah.'
            });
            
        } catch (fetchError) {
            return c.json({ error: 'Gagal terhubung ke Firebase Auth server.' }, 502);
        }
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST /api/auth/check-email-status
authRoutes.post('/check-email-status', async (c) => {
    try {
        const { idToken } = await c.req.json();
        if (!idToken) return c.json({ verified: false }, 400);

        const apiKey = c.env.FIREBASE_API_KEY;
        const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });
        const lookupData = await lookupRes.json();
        
        if (lookupData.users && lookupData.users[0]) {
            return c.json({ verified: lookupData.users[0].emailVerified });
        }
        return c.json({ verified: false });
    } catch (e) {
        return c.json({ verified: false, error: e.message }, 500);
    }
});

// POST /api/auth/verify-email
authRoutes.post('/verify-email', async (c) => {
    try {
        const { oobCode } = await c.req.json();
        if (!oobCode) return c.json({ error: 'oobCode diperlukan.' }, 400);

        const apiKey = c.env.FIREBASE_API_KEY;
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oobCode })
        });
        const data = await res.json();

        if (!res.ok) {
            const msg = data.error?.message || 'Verifikasi gagal.';
            return c.json({ error: msg }, 400);
        }

        return c.json({ success: true, email: data.email });
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// POST /api/auth/check-verified — polling dengan fresh signIn
authRoutes.post('/check-verified', async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password) return c.json({ verified: false }, 400);

        const apiKey = c.env.FIREBASE_API_KEY;

        // SignIn untuk mendapatkan fresh idToken
        const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const signInData = await signInRes.json();

        if (!signInRes.ok) return c.json({ verified: false });

        // Lookup untuk mendapatkan emailVerified status terbaru
        const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: signInData.idToken })
        });
        const lookupData = await lookupRes.json();

        const user = lookupData.users?.[0];
        if (!user || !user.emailVerified) return c.json({ verified: false });

        // Buat JWT token baru
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const jwtToken = await sign({
            id: user.localId,
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
        }, secret);

        return c.json({
            verified: true,
            token: jwtToken,
            user: { id: user.localId, email: user.email, name: user.displayName || '' }
        });

    } catch (e) {
        return c.json({ verified: false, error: e.message }, 500);
    }
});

export default authRoutes;
