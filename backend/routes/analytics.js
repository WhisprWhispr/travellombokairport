const express = require('express');
const router = express.Router();
const crypto = require('crypto');
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

// Helper: Hash IP for privacy
const hashIp = (ip) => {
    return crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
};

// POST /api/analytics/track - Track page view
router.post('/track', async (req, res) => {
    try {
        const { path, userAgent, screenWidth } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ipHash = hashIp(ip);
        
        const logData = {
            path: path || '/',
            userAgent: userAgent || 'Unknown',
            screenWidth: screenWidth || 0,
            ipHash,
            timestamp: new Date().toISOString(),
        };

        await db.collection('analytics').add(logData);

        res.json({ success: true });
    } catch (error) {
        console.error("Error tracking analytics:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/analytics/stats - Get stats for admin
router.get('/stats', verifyAdminToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffString = cutoffDate.toISOString();

        const snapshot = await db.collection('analytics')
            .where('timestamp', '>=', cutoffString)
            .orderBy('timestamp', 'desc')
            .get();

        const logs = [];
        snapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });

        res.json({ success: true, logs });
    } catch (error) {
        console.error("Error fetching analytics stats:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
