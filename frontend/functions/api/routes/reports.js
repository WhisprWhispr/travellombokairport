import { Hono } from 'hono';
import { getDb } from '../config/firebase.js';

const reportsRoutes = new Hono();

// GET all reports
reportsRoutes.get('/', async (c) => {
    try {
        const db = getDb(c);
        const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').get();
        const reports = [];
        snapshot.forEach(doc => {
            reports.push({ id: doc.id, ...doc.data() });
        });
        return c.json({ success: true, reports });
    } catch (error) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// POST a new report
reportsRoutes.post('/', async (c) => {
    try {
        const db = getDb(c);
        const body = await c.req.json();
        
        const newReport = {
            category: body.category || 'Masalah Lainnya',
            detail: body.detail || '',
            sessionId: body.sessionId || 'anonymous',
            userInfo: body.userInfo || {},
            status: 'NEW',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('reports').add(newReport);
        return c.json({ success: true, id: docRef.id });
    } catch (error) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

export default reportsRoutes;
