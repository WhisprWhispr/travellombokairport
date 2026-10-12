import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb } from '../config/firebase.js';

const promosRoutes = new Hono();

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

// GET all promos (Admin: all, Public: active only)
promosRoutes.get('/', async (c) => {
    try {
        const isPublic = c.req.query('public') === 'true';
        if (!isPublic) {
            // Check admin token if not public
            const authHeader = c.req.header('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json({ message: 'Unauthorized: No token provided' }, 401);
            }
            const token = authHeader.split('Bearer ')[1];
            try {
                const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
                const decodedToken = await verify(token, secret, 'HS256');
                c.set('user', decodedToken);
            } catch (err) {
                return c.json({ message: 'Unauthorized: Invalid token' }, 403);
            }
        }

        const db = getDb(c);
        let query = db.collection('promos');
        if (isPublic) {
            query = query.where('isActive', '==', true);
        }
        const snapshot = await query.get();
        let promos = [];
        const now = new Date();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (isPublic && data.validUntil) {
                const validDate = new Date(data.validUntil);
                if (now > validDate) return; // Skip expired in public
            }
            promos.push({ id: doc.id, ...data });
        });
        return c.json(promos);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET verify promo
promosRoutes.get('/verify/:code', async (c) => {
    try {
        const db = getDb(c);
        const code = c.req.param('code');
        const itemId = c.req.query('itemId');
        
        const snapshot = await db.collection('promos').where('code', '==', code.toUpperCase()).where('isActive', '==', true).get();
        if (snapshot.empty) {
            return c.json({ valid: false, message: 'Kode promo tidak ditemukan atau tidak aktif' }, 404);
        }
        
        let promo = null;
        snapshot.forEach(doc => { promo = { id: doc.id, ...doc.data() }; });
        
        // If promo is specific to an item, verify it
        if (promo.itemId && promo.itemId !== itemId) {
            return c.json({ valid: false, message: 'Kode promo tidak berlaku untuk paket/item ini' }, 400);
        }
        
        // Check usage limit
        if (promo.usageLimit && (promo.usedCount || 0) >= promo.usageLimit) {
            return c.json({ valid: false, message: 'Maaf, kuota kupon promo ini sudah habis digunakan' }, 400);
        }

        // Check date validity
        const now = new Date();
        if (promo.validUntil) {
            const validDate = new Date(promo.validUntil);
            if (now > validDate) {
                return c.json({ valid: false, message: 'Kode promo sudah kedaluwarsa' }, 400);
            }
        }
        
        return c.json({ valid: true, discountType: promo.discountType, discountValue: promo.discountValue, maxDiscount: promo.maxDiscount });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST create promo
promosRoutes.post('/', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const body = await c.req.json();
        const { code, discountType, discountValue, maxDiscount, validUntil, isActive, itemId, usageLimit } = body;
        
        const newPromo = {
            code: code.toUpperCase(),
            discountType, 
            discountValue: Number(discountValue),
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            validUntil: validUntil || null,
            isActive: isActive !== undefined ? isActive : true,
            itemId: itemId || null,
            usageLimit: usageLimit ? Number(usageLimit) : null,
            usedCount: 0,
            createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('promos').add(newPromo);
        return c.json({ id: docRef.id, ...newPromo }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update promo
promosRoutes.put('/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const body = await c.req.json();
        
        const updateData = { ...body, updatedAt: new Date().toISOString() };
        if (updateData.code) updateData.code = updateData.code.toUpperCase();
        
        await db.collection('promos').doc(id).set(updateData, { merge: true });
        return c.json({ message: 'Promo updated successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE promo
promosRoutes.delete('/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('promos').doc(id).delete();
        return c.json({ message: 'Promo deleted successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default promosRoutes;
