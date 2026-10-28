require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
const apiRoutes = require('./routes/api');
const paymentRoutes = require('./routes/payment');
const bookingsRoutes = require('./routes/bookings');
const driversRoutes = require('./routes/drivers');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const promosRoutes = require('./routes/promos');
const blogsRoutes = require('./routes/blogs');
const analyticsRoutes = require('./routes/analytics');
const reportsRoutes = require('./routes/reports');
const gmapsSyncRoutes = require('./routes/gmaps-sync');
app.use('/api', apiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/promos', promosRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/gmaps-sync', gmapsSyncRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Travel Lombok Airport API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Setup H-1 Reminder Cron Job (Runs every day at 08:00 AM)
const cron = require('node-cron');
const { db } = require('./config/firebase');
const { sendReminderEmail } = require('./services/mailer');

cron.schedule('0 8 * * *', async () => {
    console.log('Running daily H-1 reminder check...');
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Format YYYY-MM-DD
        const tomorrowString = tomorrow.toISOString().split('T')[0]; 

        // Query bookings that are paid or confirmed
        const snapshot = await db.collection('bookings').where('status', 'in', ['PAID', 'CONFIRMED']).get();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            // Assuming startDate is stored as ISO string or YYYY-MM-DD
            if (data.startDate && data.startDate.startsWith(tomorrowString)) {
                sendReminderEmail({ id: doc.id, ...data });
            }
        });
    } catch (error) {
        console.error('Error running cron job for reminders:', error);
    }
});

// ─── Cron Job: Sync Google Maps Reviews setiap 6 jam ───────────────────────
const { GoogleGenerativeAI } = require('@google/generative-ai');
cron.schedule('0 */6 * * *', async () => {
    console.log('[GMaps Sync] Running scheduled Google Maps review sync...');
    try {
        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
        const PLACE_ID = process.env.GOOGLE_PLACE_ID || '';
        if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
            console.log('[GMaps Sync] Skipped: GOOGLE_PLACES_API_KEY atau GOOGLE_PLACE_ID belum diset.');
            return;
        }

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews&language=id&key=${GOOGLE_PLACES_API_KEY}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.status !== 'OK') {
            throw new Error(`Google Places API: ${data.status}`);
        }

        const googleReviews = data.result.reviews || [];
        const existingSnap = await db.collection('reviews').where('source', '==', 'google_maps').get();
        const existingKeys = new Set();
        existingSnap.forEach(doc => {
            const d = doc.data();
            existingKeys.add(`${d.authorName}_${d.publishTime}`);
        });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        let addedCount = 0;
        for (const review of googleReviews) {
            const key = `${review.author_name}_${review.time}`;
            if (existingKeys.has(key)) continue;

            let cleanedText = review.text || '';
            if (cleanedText && process.env.GEMINI_API_KEY) {
                try {
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                    const prompt = `Terjemahkan ulasan ini ke Bahasa Indonesia jika bukan Bahasa Indonesia, atau kembalikan apa adanya jika sudah Bahasa Indonesia. Jangan tambahkan komentar apapun: "${cleanedText}"`;
                    const result = await model.generateContent(prompt);
                    cleanedText = result.response.text().trim();
                } catch {}
            }

            await db.collection('reviews').add({
                name: review.author_name,
                rating: review.rating,
                comment: cleanedText,
                photoUrl: review.profile_photo_url || null,
                createdAt: new Date(review.time * 1000).toISOString(),
                publishTime: review.time,
                authorName: review.author_name,
                relativeTime: review.relative_time_description || '',
                source: 'google_maps',
                status: 'approved',
                itemId: null,
                userId: null
            });
            addedCount++;
        }

        await db.collection('settings').doc('gmaps_sync').set({
            lastSync: new Date().toISOString(),
            lastStatus: 'success',
            lastAdded: addedCount,
            overallRating: data.result.rating,
            totalRatings: data.result.user_ratings_total,
            placeName: data.result.name
        }, { merge: true });

        console.log(`[GMaps Sync] Done. ${addedCount} ulasan baru ditambahkan.`);
    } catch (error) {
        console.error('[GMaps Sync] Error:', error.message);
        try {
            await db.collection('settings').doc('gmaps_sync').set({
                lastSync: new Date().toISOString(),
                lastStatus: 'error',
                lastError: error.message
            }, { merge: true });
        } catch {}
    }
});
