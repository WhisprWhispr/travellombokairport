import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb, admin } from '../config/firebase.js';

const apiRoutes = new Hono();

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
        console.error('Token verification error:', error);
        return c.json({ message: 'Unauthorized: Invalid token' }, 403);
    }
};

// GET all items (public)
apiRoutes.get('/items', async (c) => {
    try {
        const db = getDb(c);
        const category = c.req.query('category');
        let query = db.collection('items').orderBy('createdAt', 'desc');
        
        if (category) {
            query = db.collection('items').where('category', '==', category);
        }
        
        const snapshot = await query.get();
        let items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort items by price ascending (cheapest first), then by newest
        items.sort((a, b) => {
            const priceA = parseInt(a.price) || 0;
            const priceB = parseInt(b.price) || 0;
            if (priceA !== priceB) {
                return priceA - priceB;
            }
            // Same price: sort by newest
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        return c.json(items);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET settings (public)
apiRoutes.get('/settings', async (c) => {
    try {
        const db = getDb(c);
        const doc = await db.collection('settings').doc('global').get();
        if (!doc.exists) {
            return c.json({ droneAvailable: 'available' });
        }
        return c.json(doc.data());
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT settings (protected)
apiRoutes.put('/settings', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const updatedSettings = await c.req.json();
        const user = c.get('user');

        // Jika ada attempt mengubah maintenanceMode
        if (updatedSettings.maintenanceMode !== undefined) {
            const isMainAdmin = user && user.email === 'ridhosandhika18022022@gmail.com';
            if (!isMainAdmin) {
                // Jangan izinkan mengubah maintenanceMode, hapus dari payload
                delete updatedSettings.maintenanceMode;
            }
        }

        await db.collection('settings').doc('global').set(updatedSettings, { merge: true });
        return c.json(updatedSettings);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET single item (public)
apiRoutes.get('/items/:id', async (c) => {
    try {
        const db = getDb(c);
        const doc = await db.collection('items').doc(c.req.param('id')).get();
        if (!doc.exists) {
            return c.json({ message: 'Item not found' }, 404);
        }
        return c.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST new item (protected)
apiRoutes.post('/items', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const body = await c.req.json();
        const newItem = {
            ...body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('items').add(newItem);
        return c.json({ id: docRef.id, ...newItem }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update item (protected)
apiRoutes.put('/items/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const updatedItem = await c.req.json();
        await db.collection('items').doc(id).update(updatedItem);
        return c.json({ id, ...updatedItem });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE item (protected)
apiRoutes.delete('/items/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('items').doc(id).delete();
        return c.json({ message: 'Item deleted successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET stats (public)
apiRoutes.get('/stats', async (c) => {
    try {
        const db = getDb(c);
        const doc = await db.collection('settings').doc('stats').get();
        if (!doc.exists) {
            return c.json({ customers: '500+', fleet: '20+', trips: '100+', support: '24/7' });
        }
        return c.json(doc.data());
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET rates (public)
let cachedRatesWorker = null;
let lastRatesFetchWorker = 0;
apiRoutes.get('/rates', async (c) => {
    try {
        const now = Date.now();
        // Cache for 12 hours
        if (cachedRatesWorker && now - lastRatesFetchWorker < 12 * 60 * 60 * 1000) {
            return c.json(cachedRatesWorker);
        }

        // Fetch from free API
        const response = await fetch('https://open.er-api.com/v6/latest/IDR');
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        if (data.rates) {
            cachedRatesWorker = data.rates;
            lastRatesFetchWorker = now;
            return c.json(cachedRatesWorker);
        } else {
            throw new Error('Invalid rates data');
        }
    } catch (error) {
        console.error('Rates fetch error:', error);
        return c.json({ error: 'Gagal mengambil kurs mata uang' }, 500);
    }
});

// POST stats (protected)
apiRoutes.post('/stats', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const stats = await c.req.json();
        await db.collection('settings').doc('stats').set(stats);
        return c.json({ message: 'Stats updated', stats });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET gallery items (public)
apiRoutes.get('/gallery', async (c) => {
    try {
        const db = getDb(c);
        const snapshot = await db.collection('gallery').orderBy('createdAt', 'desc').get();
        let gallery = [];
        snapshot.forEach(doc => {
            gallery.push({ id: doc.id, ...doc.data() });
        });
        return c.json(gallery);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST gallery item (protected)
apiRoutes.post('/gallery', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const galleryData = await c.req.json();
        const newDoc = await db.collection('gallery').add({
            ...galleryData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return c.json({ id: newDoc.id, ...galleryData }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE gallery item (protected)
apiRoutes.delete('/gallery/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('gallery').doc(id).delete();
        return c.json({ message: 'Gallery item deleted' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET all withdrawals (protected)
apiRoutes.get('/withdrawals', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const user = c.get('user'); // Get user from verifyToken middleware
        const isMainAdmin = user && user.email === 'ridhosandhika18022022@gmail.com';
        
        let query = db.collection('withdrawals').orderBy('createdAt', 'desc');
        
        // If not main admin, only show their own withdrawals
        if (!isMainAdmin) {
            query = query.where('adminEmail', '==', user?.email);
        }
        
        const snapshot = await query.get();
        let withdrawals = [];
        snapshot.forEach(doc => {
            withdrawals.push({ id: doc.id, ...doc.data() });
        });
        return c.json(withdrawals);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST a new withdrawal (protected)
apiRoutes.post('/withdrawals', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const withdrawalData = await c.req.json();
        const user = c.get('user');
        if (withdrawalData.amount < 100000) {
            return c.json({ error: 'Minimal penarikan adalah Rp 100.000' }, 400);
        }
        
        const newDoc = await db.collection('withdrawals').add({
            ...withdrawalData,
            status: 'PENDING',
            adminEmail: user?.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return c.json({ id: newDoc.id, ...withdrawalData, status: 'PENDING', adminEmail: user?.email }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update withdrawal status (Main Admin Only)
apiRoutes.put('/withdrawals/:id/status', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const user = c.get('user');
        const isMainAdmin = user && user.email === 'ridhosandhika18022022@gmail.com';
        
        if (!isMainAdmin) {
            return c.json({ error: 'Hanya Admin Pusat yang dapat mengubah status penarikan' }, 403);
        }
        
        const id = c.req.param('id');
        const { status } = await c.req.json(); // 'COMPLETED' or 'REJECTED'
        
        if (!['COMPLETED', 'REJECTED'].includes(status)) {
            return c.json({ error: 'Status tidak valid' }, 400);
        }
        
        await db.collection('withdrawals').doc(id).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return c.json({ success: true, message: 'Status berhasil diubah' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET all reviews (public)
apiRoutes.get('/reviews', async (c) => {
    try {
        const db = getDb(c);
        const itemId = c.req.query('itemId');
        
        let snapshot;
        if (itemId) {
            snapshot = await db.collection('reviews').where('itemId', '==', itemId).get();
        } else {
            // Main page reviews are those without an itemId (or we could just return all, but usually main page only shows general reviews)
            snapshot = await db.collection('reviews').get();
        }
        
        let reviews = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            reviews.push({ id: doc.id, ...data });
        });
        
        // Sort in memory descending by createdAt
        reviews.sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const db_ = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return db_ - da;
        });
        return c.json(reviews);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST a new review (public)
apiRoutes.post('/reviews', async (c) => {
    try {
        const db = getDb(c);
        const { name, rating, comment, itemId } = await c.req.json();
        if (!name || !rating || !comment) {
            return c.json({ error: 'Name, rating, and comment are required' }, 400);
        }
        const newReview = {
            name,
            rating: Number(rating),
            comment,
            itemId: itemId || null,
            createdAt: new Date().toISOString(),
            status: 'approved'
        };
        const docRef = await db.collection('reviews').add(newReview);
        return c.json({ id: docRef.id, ...newReview }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE a review (protected)
apiRoutes.delete('/reviews/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('reviews').doc(id).delete();
        return c.json({ message: 'Review deleted successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET all user accounts (protected)
apiRoutes.get('/users', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const snapshot = await db.collection('user_accounts').orderBy('createdAt', 'desc').get();
        let users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return c.json(users);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE a user account (protected)
apiRoutes.delete('/users/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('user_accounts').doc(id).delete();
        return c.json({ message: 'User account deleted successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default apiRoutes;
