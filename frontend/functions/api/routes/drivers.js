import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb, admin } from '../config/firebase.js';

const driversRoutes = new Hono();

// Admin Middleware
const verifyAdminToken = async (c, next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Unauthorized' }, 401);
    }
    try {
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const decodedToken = await verify(authHeader.split('Bearer ')[1], secret);
        c.set('user', decodedToken);
        await next();
    } catch (e) {
        return c.json({ message: 'Invalid token' }, 403);
    }
};

// Driver Login Endpoint
driversRoutes.post('/login', async (c) => {
    try {
        const db = getDb(c);
        const { phone, pin } = await c.req.json();
        
        // Search driver by phone and pin
        const snapshot = await db.collection('drivers')
            .where('phone', '==', phone)
            .where('pin', '==', pin)
            .get();
            
        if (snapshot.empty) {
            return c.json({ error: 'Nomor HP atau PIN salah.' }, 401);
        }
        
        const driverDoc = snapshot.docs[0];
        const driverData = driverDoc.data();
        
        return c.json({
            success: true,
            driverId: driverDoc.id,
            name: driverData.name
        });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET all drivers (Admin Only)
driversRoutes.get('/', verifyAdminToken, async (c) => {
    try {
        const db = getDb(c);
        const snapshot = await db.collection('drivers').orderBy('createdAt', 'desc').get();
        let drivers = [];
        snapshot.forEach(doc => {
            drivers.push({ id: doc.id, ...doc.data() });
        });
        return c.json(drivers);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// CREATE a driver (Admin Only)
driversRoutes.post('/', verifyAdminToken, async (c) => {
    try {
        const db = getDb(c);
        const data = await c.req.json();
        const newDoc = await db.collection('drivers').add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return c.json({ id: newDoc.id, ...data }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE a driver (Admin Only)
driversRoutes.delete('/:id', verifyAdminToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('drivers').doc(id).delete();
        return c.json({ message: 'Supir berhasil dihapus' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET Driver's Assigned Bookings (Driver Only)
driversRoutes.get('/my-bookings', async (c) => {
    try {
        const db = getDb(c);
        const driverId = c.req.header('x-driver-id');
        if (!driverId) return c.json({ error: 'Akses ditolak.' }, 401);
        
        const snapshot = await db.collection('bookings')
            .where('driverId', '==', driverId)
            .get();
            
        let bookings = [];
        snapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort in memory to avoid requiring complex compound Firestore indexes
        bookings.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });
        
        return c.json(bookings);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default driversRoutes;
