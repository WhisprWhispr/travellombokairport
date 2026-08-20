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

        // Fallback: hardcoded admin
        if (!admin) {
            const ADMIN_EMAIL = c.env.ADMIN_EMAIL || 'travellombokairport@gmail.com';
            const ADMIN_PASSWORD = c.env.ADMIN_PASSWORD || 'admin123';
            
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                admin = { id: 'admin-1', email: ADMIN_EMAIL };
            }
        }

        if (!admin) {
            return c.json({ error: 'Email atau password salah.' }, 401);
        }

        // Generate Hono JWT token
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const payload = {
            id: admin.id,
            email: admin.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
        };
        
        const token = await sign(payload, secret);
        
        return c.json({
            success: true,
            token,
            admin: { id: admin.id, email: admin.email }
        });

    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default authRoutes;
