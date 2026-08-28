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

export default app;
