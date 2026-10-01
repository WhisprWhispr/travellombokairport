import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import Routes
import apiRoutes from './functions/api/routes/api.js';
import bookingsRoutes from './functions/api/routes/bookings.js';
import paymentRoutes from './functions/api/routes/payment.js';
import authRoutes from './functions/api/routes/auth.js';
import driversRoutes from './functions/api/routes/drivers.js';
import aiRoutes from './functions/api/routes/ai.js';
import promosRoutes from './functions/api/routes/promos.js';
import blogsRoutes from './functions/api/routes/blogs.js';
import analyticsRoutes from './functions/api/routes/analytics.js';
import reportsRoutes from './functions/api/routes/reports.js';
import { getDbFromEnv } from './functions/api/config/firebase.js';

const app = new Hono().basePath('/api');

// Global Middleware
app.use('*', cors());

// Base Route
app.get('/', (c) => c.text('Travel Lombok Airport API is running (Cloudflare Worker)'));

// Mount Routes
app.route('/items', apiRoutes);
app.route('/stats', apiRoutes); 
app.route('/gallery', apiRoutes);
app.route('/withdrawals', apiRoutes);

// For cleanly mounting the rest
app.route('/bookings', bookingsRoutes);
app.route('/payment', paymentRoutes);
app.route('/auth', authRoutes);
app.route('/drivers', driversRoutes);
app.route('/ai', aiRoutes);
app.route('/promos', promosRoutes);
app.route('/blogs', blogsRoutes);
app.route('/analytics', analyticsRoutes);
app.route('/reports', reportsRoutes);

app.post('/upload', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        const cloudName = 'mvhjuh83';
        const apiKey = '636819913243949';
        const apiSecret = 'Klov4BCszxgMpPmr_PUD9GFvgJw';
        
        const timestamp = Math.round((new Date).getTime() / 1000);
        const strToSign = `timestamp=${timestamp}${apiSecret}`;

        const encoder = new TextEncoder();
        const data = encoder.encode(strToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('api_key', apiKey);
        cloudinaryFormData.append('timestamp', timestamp);
        cloudinaryFormData.append('signature', signature);
        
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: cloudinaryFormData
        });

        if (!cloudinaryRes.ok) {
            const errResult = await cloudinaryRes.text();
            return c.json({ error: 'Failed to upload to Cloudinary', details: errResult }, 500);
        }

        const result = await cloudinaryRes.json();
        
        return c.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        return c.json({ error: 'Internal Server Error', message: error.message }, 500);
    }
});

// For fallback in api.js
app.route('/', apiRoutes);

// --- CLOUDFLARE CRON: Auto-expire VA payments after 24 hours ---
async function runAutoExpireCron(env) {
    try {
        const db = getDbFromEnv(env);
        const now = Date.now();
        const limit24h = 24 * 60 * 60 * 1000;
        let expiredCount = 0;

        const cols = ['bookings', 'orderan', 'orders'];
        for (const col of cols) {
            const snap = await db.collection(col).where('status', '==', 'PENDING').get();
            const docs = [];
            snap.forEach(d => docs.push({ id: d.id, ...d.data() }));

            for (const doc of docs) {
                const method = (doc.paymentMethod || '').toLowerCase();
                if (method !== 'va') continue;

                const expStr = doc.expiredAtISO || doc.expiredAt;
                let shouldExpire = false;
                if (expStr) {
                    const expTime = new Date(expStr).getTime();
                    if (!isNaN(expTime) && now > expTime) shouldExpire = true;
                } else {
                    const created = doc.createdAt ? new Date(doc.createdAt).getTime() : 0;
                    if (created > 0 && (now - created) > limit24h) shouldExpire = true;
                }

                if (shouldExpire) {
                    await db.collection(col).doc(doc.id).update({ status: 'KADALUARSA' });
                    expiredCount++;
                }
            }
        }

        console.log(`[CRON] Auto-expire: ${expiredCount} pesanan VA diubah ke KADALUARSA.`);
    } catch (err) {
        console.error('[CRON] Error auto-expire:', err.message);
    }
}

export default {
    fetch: app.fetch.bind(app),
    async scheduled(event, env, ctx) {
        ctx.waitUntil(runAutoExpireCron(env));
    }
};
