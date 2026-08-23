import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb } from '../config/firebase.js';

const bookingsRoutes = new Hono();

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
        return c.json({ message: 'Unauthorized: Invalid token' }, 403);
    }
};

// GET all bookings (public/admin)
bookingsRoutes.get('/', async (c) => {
    try {
        const db = getDb(c);
        const itemId = c.req.query('itemId');
        const isPublic = c.req.query('public');
        
        let query = db.collection('bookings');
        
        if (itemId) {
            query = query.where('itemId', '==', itemId);
        }
        
        const snapshot = await query.get();
        let bookings = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (isPublic === 'true') {
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
        
        return c.json(bookings);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST new booking
bookingsRoutes.post('/', async (c) => {
    try {
        const db = getDb(c);
        const body = await c.req.json();
        const newBooking = {
            ...body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('bookings').add(newBooking);
        return c.json({ id: docRef.id, ...newBooking }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE booking
bookingsRoutes.delete('/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('bookings').doc(id).delete();
        return c.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET riwayat transaksi milik user (butuh JWT)
bookingsRoutes.get('/my-history', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const user = c.get('user');
        const userEmail = user.email;

        if (!userEmail) {
            return c.json({ error: 'Email tidak ditemukan di token.' }, 400);
        }

        // Ambil bookings (BKG- / rental & transfer)
        const bkgSnap = await db.collection('bookings')
            .where('customerEmail', '==', userEmail)
            .get();

        // Ambil orders (ORD- / paket tour via QRIS)
        const ordSnap = await db.collection('orders')
            .where('customerEmail', '==', userEmail)
            .get();

        const bookings = [];
        bkgSnap.forEach(doc => {
            const d = doc.data();
            bookings.push({
                id: doc.id,
                type: 'booking',
                transactionId: d.transactionId || doc.id,
                itemName: d.itemName || d.serviceName || '-',
                customerName: d.customerName || '-',
                customerEmail: d.customerEmail || d.email || '-',
                phone: d.phone || d.wa || '-',
                startDate: d.startDate || null,
                endDate: d.endDate || null,
                status: d.status || 'PENDING',
                itemPrice: d.itemPrice || d.price || 0,
                createdAt: d.createdAt || null,
            });
        });

        const orders = [];
        ordSnap.forEach(doc => {
            const d = doc.data();
            orders.push({
                id: doc.id,
                type: 'order',
                transactionId: d.transactionId || doc.id,
                itemName: d.itemName || d.packageName || '-',
                customerName: d.customerName || '-',
                customerEmail: d.customerEmail || d.email || '-',
                phone: d.phone || d.wa || '-',
                startDate: d.travelDate || d.startDate || null,
                endDate: d.endDate || null,
                status: d.status || 'PENDING',
                itemPrice: d.totalPrice || d.price || 0,
                createdAt: d.createdAt || null,
            });
        });

        // Gabung & sort by createdAt terbaru
        const all = [...bookings, ...orders].sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const db2 = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return db2 - da;
        });

        return c.json(all);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET specific booking/order for check status (public)
// BKG- → hanya cari di collection 'bookings'
// ORD- → hanya cari di collection 'orders'
bookingsRoutes.get('/check/:transactionId', async (c) => {
    try {
        const db = getDb(c);
        const transactionId = c.req.param('transactionId').trim().toUpperCase();

        // Deteksi tipe berdasarkan prefix ID
        const isBKG = transactionId.startsWith('BKG-');
        const isORD = transactionId.startsWith('ORD-');

        if (!isBKG && !isORD) {
            return c.json({ message: 'Format ID tidak valid. Gunakan BKG-... untuk Booking atau ORD-... untuk Order.' }, 400);
        }

        if (isBKG) {
            // Cari HANYA di collection 'bookings'
            const snap = await db.collection('bookings').where('transactionId', '==', transactionId).get();
            if (snap.empty) {
                return c.json({ message: 'Booking tidak ditemukan. Pastikan ID Booking (BKG-...) yang Anda masukkan benar.' }, 404);
            }
            const data = snap.docs[0].data();
            return c.json({
                transactionId: data.transactionId,
                itemName: data.itemName || data.serviceName || '-',
                customerName: data.customerName || '-',
                customerEmail: data.customerEmail || data.email || '-',
                phone: data.phone || data.wa || '-',
                startDate: data.startDate || data.travelDate || null,
                endDate: data.endDate || null,
                status: data.status || 'PENDING',
                itemPrice: data.price || data.totalPrice || data.itemPrice || 0,
                isDp: data.isDp || false,
                fullPrice: data.fullPrice || data.price || 0,
                createdAt: data.createdAt || null,
                type: 'booking'
            });
        }

        if (isORD) {
            // Cari HANYA di collection 'orders'
            const snap = await db.collection('orders').where('transactionId', '==', transactionId).get();
            if (snap.empty) {
                return c.json({ message: 'Order tidak ditemukan. Pastikan ID Order (ORD-...) yang Anda masukkan benar.' }, 404);
            }
            const data = snap.docs[0].data();
            return c.json({
                transactionId: data.transactionId,
                itemName: data.itemName || data.packageName || '-',
                customerName: data.customerName || '-',
                customerEmail: data.customerEmail || data.email || '-',
                phone: data.phone || data.wa || '-',
                startDate: data.travelDate || data.startDate || null,
                endDate: data.endDate || null,
                status: data.status || 'PENDING',
                itemPrice: data.totalPrice || data.price || data.itemPrice || 0,
                isDp: data.isDp || false,
                fullPrice: data.fullPrice || data.totalPrice || 0,
                createdAt: data.createdAt || null,
                type: 'order'
            });
        }
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update booking status by transactionId (for QRIS payment callback - no auth required)
bookingsRoutes.put('/by-txid/:transactionId/status', async (c) => {
    try {
        const db = getDb(c);
        const transactionId = c.req.param('transactionId');
        const { status } = await c.req.json();
        
        if (!status) {
            return c.json({ message: 'Status is required' }, 400);
        }
        
        const snapshot = await db.collection('bookings').where('transactionId', '==', transactionId).get();
        if (snapshot.empty) {
            return c.json({ message: 'Booking not found' }, 404);
        }
        
        const docId = snapshot.docs[0].id;
        await db.collection('bookings').doc(docId).update({ status });
        
        return c.json({ message: 'Booking status updated successfully', transactionId, status });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update booking status
bookingsRoutes.put('/:id/status', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const { status } = await c.req.json();
        
        if (!status) {
            return c.json({ message: 'Status is required' }, 400);
        }
        
        await db.collection('bookings').doc(id).update({ status });
        return c.json({ message: 'Booking status updated successfully', status });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT assign driver to booking
bookingsRoutes.put('/:id/driver', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const { driverId, driverName } = await c.req.json();
        
        await db.collection('bookings').doc(id).update({ 
            driverId: driverId || null,
            driverName: driverName || ''
        });
        return c.json({ message: 'Driver assigned successfully', driverId });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT driver complete trip (Driver Only)
bookingsRoutes.put('/:id/complete', async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const driverId = c.req.header('x-driver-id');
        
        if (!driverId) {
            return c.json({ message: 'Unauthorized driver' }, 401);
        }
        
        const doc = await db.collection('bookings').doc(id).get();
        if (!doc.exists || doc.data().driverId !== driverId) {
            return c.json({ message: 'Forbidden: Not your booking' }, 403);
        }
        
        await db.collection('bookings').doc(id).update({ status: 'COMPLETED' });
        return c.json({ message: 'Trip completed successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default bookingsRoutes;
