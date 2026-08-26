const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Middleware for admin auth
const verifyAdminToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        if (!admin.auth) return next();
        const decodedToken = await admin.auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
};

// GET /api/promos - Admin get all promos
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('promos').orderBy('createdAt', 'desc').get();
        let promos = [];
        snapshot.forEach(doc => promos.push({ id: doc.id, ...doc.data() }));
        res.json(promos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/promos/verify/:code - Public verify a promo code
router.get('/verify/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { itemId } = req.query; // get itemId from query
        const snapshot = await db.collection('promos').where('code', '==', code.toUpperCase()).where('isActive', '==', true).get();
        if (snapshot.empty) {
            return res.status(404).json({ valid: false, message: 'Kode promo tidak ditemukan atau tidak aktif' });
        }
        
        let promo = null;
        snapshot.forEach(doc => { promo = { id: doc.id, ...doc.data() }; });
        
        // If promo is specific to an item, verify it
        if (promo.itemId && promo.itemId !== itemId) {
            return res.status(400).json({ valid: false, message: 'Kode promo tidak berlaku untuk paket/item ini' });
        }
        
        // Check date validity
        const now = new Date();
        if (promo.validUntil) {
            const validDate = new Date(promo.validUntil);
            if (now > validDate) {
                return res.status(400).json({ valid: false, message: 'Kode promo sudah kedaluwarsa' });
            }
        }
        
        res.json({ valid: true, discountType: promo.discountType, discountValue: promo.discountValue, maxDiscount: promo.maxDiscount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/promos - Admin create promo
router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { code, discountType, discountValue, maxDiscount, validUntil, isActive, itemId } = req.body;
        const newPromo = {
            code: code.toUpperCase(),
            discountType, // 'percent' or 'nominal'
            discountValue: Number(discountValue),
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            validUntil: validUntil || null,
            isActive: isActive !== undefined ? isActive : true,
            itemId: itemId || null, // null means applies to all
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('promos').add(newPromo);
        res.status(201).json({ id: docRef.id, ...newPromo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/promos/:id - Admin update promo
router.put('/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date().toISOString() };
        if (updateData.code) updateData.code = updateData.code.toUpperCase();
        
        await db.collection('promos').doc(id).set(updateData, { merge: true });
        res.json({ message: 'Promo updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/promos/:id - Admin delete promo
router.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('promos').doc(req.params.id).delete();
        res.json({ message: 'Promo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
