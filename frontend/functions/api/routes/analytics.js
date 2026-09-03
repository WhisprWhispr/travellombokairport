import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb, admin } from '../config/firebase.js';

const analyticsRoutes = new Hono();

// Middleware for auth
const verifyToken = async (c, next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Unauthorized: No token provided' }, 401);
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const decodedToken = await verify(token, secret, 'HS256');
        c.set('user', decodedToken);
        await next();
    } catch (error) {
        console.error('Token verification error:', error);
        return c.json({ message: 'Unauthorized: Invalid token' }, 403);
    }
};

// POST track visitor (public)
analyticsRoutes.post('/track', async (c) => {
    try {
        const db = getDb(c);
        const { path, userAgent, ipHash, screenWidth } = await c.req.json();
        
        // Simpan ke koleksi visitor_logs
        await db.collection('visitor_logs').add({
            path: path || '/',
            userAgent: userAgent || 'Unknown',
            ipHash: ipHash || 'Unknown',
            screenWidth: screenWidth || 0,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return c.json({ success: true });
    } catch (error) {
        console.error('Analytics track error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// GET visitor stats (protected)
analyticsRoutes.get('/stats', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        // Untuk saat ini, kita ambil 1000 log terakhir untuk diolah di client
        const snapshot = await db.collection('visitor_logs')
            .orderBy('timestamp', 'desc')
            .limit(1000) 
            .get();
            
        let logs = [];
        snapshot.forEach(doc => {
            let data = doc.data();
            logs.push({
                id: doc.id,
                path: data.path,
                userAgent: data.userAgent,
                ipHash: data.ipHash,
                screenWidth: data.screenWidth,
                timestamp: (data.timestamp && typeof data.timestamp.toDate === 'function') ? data.timestamp.toDate() : new Date(data.timestamp || Date.now())
            });
        });
        
        return c.json({ success: true, logs });
    } catch (error) {
        console.error('Analytics stats error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// POST gallery ping - catat sesi pengunjung aktif di halaman galeri (public)
analyticsRoutes.post('/gallery-ping', async (c) => {
    try {
        const db = getDb(c);
        const { sessionId } = await c.req.json().catch(() => ({}));
        if (!sessionId) return c.json({ error: 'sessionId required' }, 400);

        const ipHash = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
        const now = new Date().toISOString();

        // Upsert: set/update dokumen berdasarkan sessionId
        await db.collection('gallery_sessions').doc(sessionId).set({
            sessionId,
            lastSeen: now,
            ipHash
        });

        return c.json({ success: true });
    } catch (error) {
        console.error('Gallery ping error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// DELETE gallery ping - hapus sesi saat user meninggalkan halaman (public)
analyticsRoutes.delete('/gallery-ping', async (c) => {
    try {
        const db = getDb(c);
        const { sessionId } = await c.req.json().catch(() => ({}));
        if (!sessionId) return c.json({ error: 'sessionId required' }, 400);

        await db.collection('gallery_sessions').doc(sessionId).delete();
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET gallery visitors - hitung pengunjung aktif (lastSeen < 35 detik) (public)
analyticsRoutes.get('/gallery-visitors', async (c) => {
    try {
        const db = getDb(c);
        const cutoff = new Date(Date.now() - 35 * 1000).toISOString();

        // Gunakan query where (hanya butuh single-field index yang otomatis ada)
        const snapshot = await db.collection('gallery_sessions')
            .where('lastSeen', '>=', cutoff)
            .get();

        const count = snapshot.docs ? snapshot.docs.length : 0;
        
        // Mencegah Cloudflare CDN cache
        c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        c.header('Pragma', 'no-cache');
        c.header('Expires', '0');
        
        return c.json({ count });
    } catch (error) {
        console.error('Gallery visitors error:', error);
        return c.json({ error: error.message }, 500);
    }
});

export default analyticsRoutes;
