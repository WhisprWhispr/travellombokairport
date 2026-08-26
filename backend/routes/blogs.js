const express = require('express');
const router = express.Router();
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

// GET /api/blogs - Get all blogs
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('blogs').orderBy('createdAt', 'desc').get();
        let blogs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Don't send full content in list view to save bandwidth
            if (req.query.list === 'true') {
                delete data.content;
            }
            blogs.push({ id: doc.id, ...data });
        });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/blogs/:id - Get a specific blog
router.get('/:id', async (req, res) => {
    try {
        const docRef = db.collection('blogs').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        
        const data = doc.data();
        const newViews = (data.views || 0) + 1;
        
        // Fire and forget view update
        docRef.update({ views: newViews }).catch(err => console.error("Failed to update views", err));
        
        res.json({ id: doc.id, ...data, views: newViews });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/blogs - Create blog (Admin only)
router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { title, summary, content, coverImage, author, tags } = req.body;
        const newBlog = {
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            summary,
            content,
            coverImage: coverImage || '',
            author: author || 'Admin',
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0
        };
        const docRef = await db.collection('blogs').add(newBlog);
        res.status(201).json({ id: docRef.id, ...newBlog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/blogs/:id - Update blog (Admin only)
router.put('/:id', verifyAdminToken, async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date().toISOString() };
        if (updateData.title && !updateData.slug) {
            updateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim());
        }
        await db.collection('blogs').doc(req.params.id).set(updateData, { merge: true });
        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/blogs/:id - Delete blog (Admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('blogs').doc(req.params.id).delete();
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
