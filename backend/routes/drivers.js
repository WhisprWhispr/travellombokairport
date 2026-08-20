const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Admin Middleware (Reusable from api.js ideally, but defined here for independence if needed)
const verifyAdminToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    try {
        if (!admin.auth) return next();
        const decodedToken = await admin.auth.verifyIdToken(authHeader.split('Bearer ')[1]);
        req.user = decodedToken;
        next();
    } catch (e) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Driver Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { phone, pin } = req.body;
        // Search driver by phone and pin
        const snapshot = await db.collection('drivers')
            .where('phone', '==', phone)
            .where('pin', '==', pin)
            .limit(1).get();
            
        if (snapshot.empty) {
            return res.status(401).json({ error: 'Nomor HP atau PIN salah.' });
        }
        
        const driverDoc = snapshot.docs[0];
        const driverData = driverDoc.data();
        
        res.json({
            success: true,
            driverId: driverDoc.id,
            name: driverData.name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all drivers (Admin Only)
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('drivers').orderBy('createdAt', 'desc').get();
        let drivers = [];
        snapshot.forEach(doc => {
            drivers.push({ id: doc.id, ...doc.data() });
        });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE a driver (Admin Only)
router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const data = req.body;
        const newDoc = await db.collection('drivers').add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({ id: newDoc.id, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a driver (Admin Only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('drivers').doc(req.params.id).delete();
        res.json({ message: 'Supir berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Driver's Assigned Bookings (Driver Only)
// Uses custom header X-Driver-ID for simple validation
router.get('/my-bookings', async (req, res) => {
    try {
        const driverId = req.headers['x-driver-id'];
        if (!driverId) return res.status(401).json({ error: 'Akses ditolak.' });
        
        const snapshot = await db.collection('bookings')
            .where('driverId', '==', driverId)
            .orderBy('createdAt', 'desc')
            .get();
            
        let bookings = [];
        snapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
