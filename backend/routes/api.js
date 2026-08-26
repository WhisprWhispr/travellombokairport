const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Middleware for auth
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
        if (!admin.auth) {
            // Fallback for Local DB mode where admin auth isn't initialized
            return next();
        }
        const decodedToken = await admin.auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
};

// Utility function to map collections
const getCollectionData = async (collectionName) => {
    const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();
    let data = [];
    snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
};

// GET all items (public)
router.get('/items', async (req, res) => {
    try {
        const { category } = req.query;
        let query = db.collection('items').orderBy('createdAt', 'desc');
        
        if (category) {
            query = db.collection('items').where('category', '==', category);
        }
        
        const snapshot = await query.get();
        let items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET settings
router.get('/settings', async (req, res) => {
    try {
        const doc = await db.collection('settings').doc('global').get();
        if (!doc.exists) {
            return res.json({ droneAvailable: 'available' });
        }
        res.json(doc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT settings
router.put('/settings', verifyToken, async (req, res) => {
    try {
        const updatedSettings = req.body;
        
        // Jika ada attempt mengubah maintenanceMode
        if (updatedSettings.maintenanceMode !== undefined) {
            const isMainAdmin = req.user && req.user.email === 'ridhosandhika18022022@gmail.com';
            if (!isMainAdmin) {
                // Jangan izinkan mengubah maintenanceMode, hapus dari payload
                delete updatedSettings.maintenanceMode;
            }
        }

        await db.collection('settings').doc('global').set(updatedSettings, { merge: true });
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single item (public)
router.get('/items/:id', async (req, res) => {
    try {
        const doc = await db.collection('items').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new item (protected)
router.post('/items', verifyToken, async (req, res) => {
    try {
        const newItem = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('items').add(newItem);
        res.status(201).json({ id: docRef.id, ...newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update item (protected)
router.put('/items/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = req.body;
        await db.collection('items').doc(id).update(updatedItem);
        res.json({ id, ...updatedItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE item (protected)
router.delete('/items/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('items').doc(id).delete();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET stats (public)
router.get('/stats', async (req, res) => {
    try {
        const doc = await db.collection('settings').doc('stats').get();
        if (!doc.exists) {
            return res.json({ customers: '500+', fleet: '20+', trips: '100+', support: '24/7' });
        }
        res.json(doc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST stats (protected)
router.post('/stats', verifyToken, async (req, res) => {
    try {
        const stats = req.body;
        await db.collection('settings').doc('stats').set(stats);
        res.json({ message: 'Stats updated', stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET gallery items (public)
router.get('/gallery', async (req, res) => {
    try {
        const snapshot = await db.collection('gallery').orderBy('createdAt', 'desc').get();
        let gallery = [];
        snapshot.forEach(doc => {
            gallery.push({ id: doc.id, ...doc.data() });
        });
        res.json(gallery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST gallery item (protected)
router.post('/gallery', verifyToken, async (req, res) => {
    try {
        const galleryData = req.body;
        const newDoc = await db.collection('gallery').add({
            ...galleryData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({ id: newDoc.id, ...galleryData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE gallery item (protected)
router.delete('/gallery/:id', verifyToken, async (req, res) => {
    try {
        await db.collection('gallery').doc(req.params.id).delete();
        res.json({ message: 'Gallery item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all withdrawals (protected)
router.get('/withdrawals', verifyToken, async (req, res) => {
    try {
        const snapshot = await db.collection('withdrawals').orderBy('createdAt', 'desc').get();
        let withdrawals = [];
        snapshot.forEach(doc => {
            withdrawals.push({ id: doc.id, ...doc.data() });
        });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new withdrawal (protected)
router.post('/withdrawals', verifyToken, async (req, res) => {
    try {
        const withdrawalData = req.body;
        // Basic validation
        if (withdrawalData.amount < 100000) {
            return res.status(400).json({ error: 'Minimal penarikan adalah Rp 100.000' });
        }
        
        const newDoc = await db.collection('withdrawals').add({
            ...withdrawalData,
            status: 'PENDING',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({ id: newDoc.id, ...withdrawalData, status: 'PENDING' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all reviews
router.get('/reviews', async (req, res) => {
    try {
        const { itemId } = req.query;
        let query = db.collection('reviews');
        if (itemId) {
            query = query.where('itemId', '==', itemId);
        }
        const snapshot = await query.get();
        let reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort in memory by createdAt descending
        reviews.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });
        
        res.json(reviews);
    } catch (error) {
        console.error("GET /reviews error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST a new review (public)
router.post('/reviews', async (req, res) => {
    try {
        const { name, rating, comment, itemId } = req.body;
        if (!name || !rating || !comment) {
            return res.status(400).json({ error: 'Name, rating, and comment are required' });
        }
        
        const newReview = {
            name,
            rating: Number(rating),
            comment,
            createdAt: new Date().toISOString(),
            status: 'approved',
            itemId: itemId || null
        };
        
        const docRef = await db.collection('reviews').add(newReview);
        res.status(201).json({ id: docRef.id, ...newReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a review (protected)
router.delete('/reviews/:id', verifyToken, async (req, res) => {
    try {
        await db.collection('reviews').doc(req.params.id).delete();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
