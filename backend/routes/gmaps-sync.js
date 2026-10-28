const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Config ────────────────────────────────────────────────────────────────
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const PLACE_ID              = process.env.GOOGLE_PLACE_ID       || '';
const GEMINI_API_KEY        = process.env.GEMINI_API_KEY        || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ─── Middleware Auth ────────────────────────────────────────────────────────
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        if (!admin.auth) return next();
        const decoded = await admin.auth.verifyIdToken(token);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// ─── Helper: ambil review dari Google Places API ────────────────────────────
async function fetchGoogleReviews() {
    if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
        throw new Error('GOOGLE_PLACES_API_KEY atau GOOGLE_PLACE_ID belum diset di .env');
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews&language=id&key=${GOOGLE_PLACES_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || ''}`);
    }

    return {
        placeName    : data.result.name,
        overallRating: data.result.rating,
        totalRatings : data.result.user_ratings_total,
        reviews      : data.result.reviews || []
    };
}

// ─── Helper: pakai Gemini untuk bersihkan / terjemahkan ulasan ──────────────
async function enhanceReviewWithAI(review) {
    if (!GEMINI_API_KEY || !review.text) return review.text || '';

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Kamu adalah asisten penyunting ulasan wisata. 
Ulasan asli (dari Google Maps): "${review.text}"
Bahasa ulasan mungkin campuran (Indonesia/Inggris).

Tugasmu:
1. Jika ulasan sudah dalam Bahasa Indonesia yang baik, kembalikan APA ADANYA tanpa perubahan.
2. Jika ulasan dalam Bahasa Inggris, terjemahkan ke Bahasa Indonesia yang natural.
3. Jika teks kosong atau tidak bermakna, kembalikan string kosong.
4. Jangan tambahkan komentar, penjelasan, atau tanda kutip. Langsung teks ulasannya saja.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch {
        return review.text || '';
    }
}

// ─── Helper: simpan review baru ke Firestore ────────────────────────────────
async function saveNewReviews(googleReviews) {
    const existingSnap = await db.collection('reviews')
        .where('source', '==', 'google_maps')
        .get();

    const existingKeys = new Set();
    existingSnap.forEach(doc => {
        const d = doc.data();
        existingKeys.add(`${d.authorName}_${d.publishTime}`);
    });

    let addedCount = 0;
    const addedReviews = [];

    for (const review of googleReviews) {
        const key = `${review.author_name}_${review.time}`;
        if (existingKeys.has(key)) continue;

        // Terjemahkan / bersihkan teks ulasan via Gemini
        const cleanedText = await enhanceReviewWithAI(review);

        const newDoc = {
            name        : review.author_name,
            rating      : review.rating,
            comment     : cleanedText,
            photoUrl    : review.profile_photo_url || null,
            createdAt   : new Date(review.time * 1000).toISOString(),
            publishTime : review.time,
            authorName  : review.author_name,
            relativeTime: review.relative_time_description || '',
            source      : 'google_maps',
            status      : 'approved',
            itemId      : null,
            userId      : null
        };

        const docRef = await db.collection('reviews').add(newDoc);
        addedReviews.push({ id: docRef.id, ...newDoc });
        addedCount++;
    }

    return { addedCount, addedReviews };
}

// ─── POST /api/gmaps-sync/run  →  manual trigger dari admin ─────────────────
router.post('/run', verifyToken, async (req, res) => {
    try {
        const { reviews, overallRating, totalRatings, placeName } = await fetchGoogleReviews();
        const { addedCount, addedReviews } = await saveNewReviews(reviews);

        await db.collection('settings').doc('gmaps_sync').set({
            lastSync     : new Date().toISOString(),
            lastStatus   : 'success',
            lastAdded    : addedCount,
            overallRating,
            totalRatings,
            placeName
        }, { merge: true });

        res.json({
            success      : true,
            message      : addedCount > 0
                ? `✅ ${addedCount} ulasan baru dari Google Maps berhasil ditambahkan!`
                : '✅ Sinkronisasi selesai. Tidak ada ulasan baru.',
            addedCount,
            overallRating,
            totalRatings,
            placeName,
            addedReviews
        });
    } catch (err) {
        console.error('[GMaps Sync] Error:', err.message);
        try {
            await db.collection('settings').doc('gmaps_sync').set({
                lastSync  : new Date().toISOString(),
                lastStatus: 'error',
                lastError : err.message
            }, { merge: true });
        } catch {}
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET /api/gmaps-sync/status  →  baca status sync terakhir ───────────────
router.get('/status', verifyToken, async (req, res) => {
    try {
        const doc = await db.collection('settings').doc('gmaps_sync').get();
        if (!doc.exists) {
            return res.json({
                configured   : !!(GOOGLE_PLACES_API_KEY && PLACE_ID),
                lastSync     : null,
                lastStatus   : null,
                lastAdded    : 0,
                overallRating: null,
                totalRatings : 0,
                placeName    : null
            });
        }
        res.json({ configured: !!(GOOGLE_PLACES_API_KEY && PLACE_ID), ...doc.data() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET /api/gmaps-sync/preview  →  preview review dari Google (tanpa save) ─
router.get('/preview', verifyToken, async (req, res) => {
    try {
        const data = await fetchGoogleReviews();
        res.json({ success: true, ...data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
