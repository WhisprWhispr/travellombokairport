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
        const decodedToken = await verify(token, secret);
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

// GET specific booking for check status (public)
bookingsRoutes.get('/check/:transactionId', async (c) => {
    try {
        const db = getDb(c);
        const transactionId = c.req.param('transactionId');
        const snapshot = await db.collection('bookings').where('transactionId', '==', transactionId).get();
        
        if (snapshot.empty) {
            return c.json({ message: 'Booking tidak ditemukan' }, 404);
        }
        
        const doc = snapshot.docs[0];
        const data = doc.data();
        return c.json({
            transactionId: data.transactionId,
            itemName: data.itemName,
            customerName: data.customerName,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status
        });
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
