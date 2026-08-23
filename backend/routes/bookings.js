const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Middleware for auth (optional for POST if public booking, required for GET if admin)
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
        if (!admin.auth) {
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

// GET all bookings (public for fetching booked dates, but we should probably just return dates and itemIds for public, and full details for admin)
router.get('/', async (req, res) => {
    try {
        const { itemId, public: isPublic } = req.query;
        let query = db.collection('bookings');
        
        if (itemId) {
            query = query.where('itemId', '==', itemId);
        }
        
        const snapshot = await query.get();
        let bookings = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (isPublic === 'true') {
                // Only return non-sensitive info if public request
                bookings.push({
                    id: doc.id,
                    itemId: data.itemId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: data.status
                });
            } else {
                bookings.push({ id: doc.id, ...data });
            }
        });
        
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new booking
router.post('/', async (req, res) => {
    try {
        const newBooking = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('bookings').add(newBooking);
        res.status(201).json({ id: docRef.id, ...newBooking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE booking
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('bookings').doc(id).delete();
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET specific booking for check status (public)
router.get('/check/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const isORD = transactionId.toUpperCase().startsWith('ORD-');
        const collectionName = isORD ? 'orders' : 'bookings';
        
        const snapshot = await db.collection(collectionName).where('transactionId', '==', transactionId.toUpperCase()).get();
        
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan. Pastikan ID yang Anda masukkan benar.' });
        }
        
        // Return only safe details
        const data = snapshot.docs[0].data();
        res.json({
            transactionId: data.transactionId || transactionId,
            itemName: data.itemName || data.packageName || data.serviceName || '-',
            customerName: data.customerName || '-',
            customerEmail: data.customerEmail || data.email || '-',
            phone: data.phone || data.wa || '-',
            category: data.category || '',
            startDate: data.startDate || data.travelDate || null,
            endDate: data.endDate || null,
            createdAt: data.createdAt || null,
            status: data.status || 'PENDING',
            itemPrice: data.price || data.totalPrice || data.itemPrice || 0,
            type: isORD ? 'order' : 'booking'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update booking status by transactionId (for QRIS payment callback - no auth required)
router.put('/by-txid/:transactionId/status', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });
        const snapshot = await db.collection('bookings').where('transactionId', '==', transactionId).get();
        if (snapshot.empty) return res.status(404).json({ message: 'Booking not found' });
        const docId = snapshot.docs[0].id;
        await db.collection('bookings').doc(docId).update({ status });
        res.json({ message: 'Booking status updated', transactionId, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT update booking status
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        await db.collection('bookings').doc(id).update({ status });
        res.json({ message: 'Booking status updated successfully', status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT assign driver to booking
router.put('/:id/driver', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId, driverName } = req.body;
        
        await db.collection('bookings').doc(id).update({ 
            driverId: driverId || null,
            driverName: driverName || ''
        });
        res.json({ message: 'Driver assigned successfully', driverId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT driver complete trip (Driver Only)
router.put('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.headers['x-driver-id'];
        
        if (!driverId) {
            return res.status(401).json({ message: 'Unauthorized driver' });
        }
        
        // Verify this booking belongs to the driver
        const doc = await db.collection('bookings').doc(id).get();
        if (!doc.exists || doc.data().driverId !== driverId) {
            return res.status(403).json({ message: 'Forbidden: Not your booking' });
        }
        
        await db.collection('bookings').doc(id).update({ status: 'COMPLETED' });
        res.json({ message: 'Trip completed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
