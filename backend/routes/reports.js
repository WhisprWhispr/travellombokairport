const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET all reports
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').get();
        const reports = [];
        snapshot.forEach(doc => {
            reports.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST a new report
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        
        const newReport = {
            category: body.category || 'Masalah Lainnya',
            detail: body.detail || '',
            sessionId: body.sessionId || 'anonymous',
            userInfo: body.userInfo || {},
            status: 'NEW',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('reports').add(newReport);
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
