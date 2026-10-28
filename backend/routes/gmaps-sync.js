const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GMAPS_URL = process.env.GOOGLE_MAPS_URL || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ message: 'Unauthorized' });
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

async function scrapeGoogleMapsReviews(mapsUrl) {
    if (!mapsUrl) throw new Error('URL Google Maps belum diset');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--lang=id-ID']
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'id-ID,id;q=0.9' });

        // Auto-resolve short URL (share.google, goo.gl, maps.app.goo.gl, dll)
        let finalUrl = mapsUrl;
        if (!mapsUrl.includes('google.com/maps')) {
            console.log('[GMaps Scraper] Resolve short URL:', mapsUrl);
            try {
                const resp = await fetch(mapsUrl, { method: 'HEAD', redirect: 'follow' });
                finalUrl = resp.url || mapsUrl;
                console.log('[GMaps Scraper] Resolved to:', finalUrl);
            } catch {
                // fallback: biarkan Puppeteer handle redirect sendiri
                finalUrl = mapsUrl;
            }
        }

        console.log('[GMaps Scraper] Membuka:', finalUrl);
        await page.goto(finalUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
        const placeInfo = await page.evaluate(() => {
            const nameEl = document.querySelector('h1.DUwDvf, h1[class*="fontHeadlineLarge"]');
            const ratingEl = document.querySelector('.F7nice span[aria-hidden="true"], .MW4etd');
            const totalEl = document.querySelector('.F7nice span[aria-label], .UY7F9');
            return {
                placeName: nameEl?.textContent?.trim() || '',
                overallRating: parseFloat(ratingEl?.textContent?.replace(',', '.')) || null,
                totalText: totalEl?.textContent?.trim() || ''
            };
        });
        const reviewTabSelectors = ['button[data-tab-index="1"]', 'button[aria-label*="Ulasan"]', 'button[aria-label*="Reviews"]'];
        for (const sel of reviewTabSelectors) {
            const btn = await page.$(sel);
            if (btn) { await btn.click(); break; }
        }
        await new Promise(r => setTimeout(r, 2500));
        const reviewsContainer = await page.$('.m6QErb[aria-label], .dS8AEf');
        if (reviewsContainer) {
            for (let i = 0; i < 3; i++) {
                await page.evaluate(el => el.scrollTop += 1500, reviewsContainer);
                await new Promise(r => setTimeout(r, 1200));
            }
        }
        const moreButtons = await page.$$('button.w8nwRe, button[aria-label*="Selengkapnya"], button[aria-label*="More"]');
        for (const btn of moreButtons) {
            await btn.click().catch(() => {});
            await new Promise(r => setTimeout(r, 300));
        }
        const reviews = await page.evaluate(() => {
            const cards = document.querySelectorAll('.jftiEf, [data-review-id]');
            const result = [];
            cards.forEach(card => {
                const nameEl = card.querySelector('.d4r55, .kvMYJc');
                const ratingEl = card.querySelector('[role="img"][aria-label]');
                const textEl = card.querySelector('.wiI7pd, .MyEned span');
                const timeEl = card.querySelector('.rsqaWe, .xRkPPb');
                const photoEl = card.querySelector('.NBa7we img, .lDY1rd img');
                const ratingMatch = (ratingEl?.getAttribute('aria-label') || '').match(/(\d)/);
                const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;
                if (!nameEl || !rating) return;
                result.push({
                    author_name: nameEl.textContent?.trim() || 'Anonim',
                    rating,
                    text: textEl?.textContent?.trim() || '',
                    relative_time_description: timeEl?.textContent?.trim() || '',
                    profile_photo_url: photoEl?.src || null
                });
            });
            return result;
        });
        const totalMatch = placeInfo.totalText.match(/[\d.,]+/);
        const totalRatings = totalMatch ? parseInt(totalMatch[0].replace(/\./g, '').replace(',', '')) : reviews.length;
        return { placeName: placeInfo.placeName, overallRating: placeInfo.overallRating, totalRatings, reviews };
    } finally {
        await browser.close();
    }
}

async function enhanceReviewWithAI(text) {
    if (!GEMINI_API_KEY || !text) return text || '';
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Kamu adalah asisten penyunting ulasan wisata.\nUlasan asli: "${text}"\n1. Jika sudah Bahasa Indonesia baik, kembalikan APA ADANYA.\n2. Jika Bahasa Inggris, terjemahkan ke Bahasa Indonesia natural.\n3. Jika kosong, kembalikan string kosong.\n4. Jangan tambahkan komentar. Langsung teks saja.`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch {
        return text;
    }
}

async function saveNewReviews(googleReviews) {
    const existingSnap = await db.collection('reviews').where('source', '==', 'google_maps').get();
    const existingKeys = new Set();
    existingSnap.forEach(doc => {
        const d = doc.data();
        existingKeys.add(`${d.authorName || d.name}_${(d.comment || '').substring(0, 50)}`);
    });
    let addedCount = 0;
    const addedReviews = [];
    for (const review of googleReviews) {
        const key = `${review.author_name}_${(review.text || '').substring(0, 50)}`;
        if (existingKeys.has(key)) continue;
        const cleanedText = await enhanceReviewWithAI(review.text);
        const newDoc = {
            name: review.author_name, rating: review.rating, comment: cleanedText,
            photoUrl: review.profile_photo_url || null, createdAt: new Date().toISOString(),
            publishTime: Math.floor(Date.now() / 1000), authorName: review.author_name,
            relativeTime: review.relative_time_description || '', source: 'google_maps',
            status: 'approved', itemId: null, userId: null
        };
        const docRef = await db.collection('reviews').add(newDoc);
        addedReviews.push({ id: docRef.id, ...newDoc });
        addedCount++;
    }
    return { addedCount, addedReviews };
}

router.get('/status', verifyToken, async (req, res) => {
    try {
        const doc = await db.collection('settings').doc('gmaps_sync').get();
        const mapsUrl = process.env.GOOGLE_MAPS_URL || '';
        const base = { configured: !!mapsUrl, lastSync: null, lastStatus: null, lastAdded: 0, overallRating: null, totalRatings: 0, placeName: null };
        res.json(doc.exists ? { configured: !!mapsUrl, ...doc.data() } : base);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/run', verifyToken, async (req, res) => {
    const mapsUrl = (req.body && req.body.mapsUrl) || GMAPS_URL;
    if (!mapsUrl) return res.status(400).json({ success: false, message: 'URL Google Maps belum diset di .env (GOOGLE_MAPS_URL)' });
    try {
        console.log('[GMaps Sync] Mulai scraping...');
        const { reviews, overallRating, totalRatings, placeName } = await scrapeGoogleMapsReviews(mapsUrl);
        console.log(`[GMaps Sync] Berhasil scrape ${reviews.length} ulasan`);
        const { addedCount, addedReviews } = await saveNewReviews(reviews);
        await db.collection('settings').doc('gmaps_sync').set({ lastSync: new Date().toISOString(), lastStatus: 'success', lastAdded: addedCount, overallRating, totalRatings, placeName, mapsUrl }, { merge: true });
        res.json({ success: true, message: addedCount > 0 ? `✅ ${addedCount} ulasan baru dari Google Maps berhasil ditambahkan!` : `✅ Selesai. Tidak ada ulasan baru (${reviews.length} ulasan sudah ada).`, addedCount, overallRating, totalRatings, placeName, totalScraped: reviews.length, addedReviews });
    } catch (err) {
        console.error('[GMaps Sync] Error:', err.message);
        try { await db.collection('settings').doc('gmaps_sync').set({ lastSync: new Date().toISOString(), lastStatus: 'error', lastError: err.message }, { merge: true }); } catch {}
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/preview', verifyToken, async (req, res) => {
    const mapsUrl = req.query.mapsUrl || GMAPS_URL;
    if (!mapsUrl) return res.status(400).json({ success: false, message: 'URL Google Maps belum diset' });
    try {
        const data = await scrapeGoogleMapsReviews(mapsUrl);
        res.json({ success: true, ...data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
