import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb } from '../config/firebase.js';

const blogsRoutes = new Hono();

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

// Helper function to create slug
const createSlug = (title) => {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

// GET all blogs
blogsRoutes.get('/', async (c) => {
    try {
        const db = getDb(c);
        const listOnly = c.req.query('list') === 'true'; // If true, exclude full content to save bandwidth
        const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 50;
        
        let query = db.collection('blogs').orderBy('createdAt', 'desc');
        const snapshot = await query.get();
        
        let blogs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (listOnly) {
                delete data.content; // Exclude full content for list views
            }
            blogs.push({ id: doc.id, ...data });
        });
        
        if (blogs.length > limit) {
            blogs = blogs.slice(0, limit);
        }
        
        return c.json(blogs);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET single blog by id or slug
blogsRoutes.get('/:idOrSlug', async (c) => {
    try {
        const db = getDb(c);
        const param = c.req.param('idOrSlug');
        
        let docRef = db.collection('blogs').doc(param);
        let docSnapshot = await docRef.get();
        
        if (!docSnapshot.exists) {
            // Try searching by slug
            const slugSnapshot = await db.collection('blogs').where('slug', '==', param).get();
            if (slugSnapshot.empty) {
                return c.json({ message: 'Blog tidak ditemukan' }, 404);
            }
            let data = null;
            slugSnapshot.forEach(d => data = { id: d.id, ...d.data() });
            return c.json(data);
        }
        
        return c.json({ id: docSnapshot.id, ...docSnapshot.data() });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST create blog (Admin)
blogsRoutes.post('/', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const body = await c.req.json();
        const { title, summary, content, coverImage, tags } = body;
        
        const user = c.get('user');
        
        const newBlog = {
            title,
            slug: createSlug(title),
            summary: summary || '',
            content,
            coverImage: coverImage || '',
            tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
            author: user?.name || 'Admin',
            authorId: user?.uid || 'admin',
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('blogs').add(newBlog);
        return c.json({ id: docRef.id, ...newBlog }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update blog (Admin)
blogsRoutes.put('/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const body = await c.req.json();
        
        const updateData = { ...body, updatedAt: new Date().toISOString() };
        
        if (updateData.title && !updateData.slug) {
            updateData.slug = createSlug(updateData.title);
        }
        if (typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(t => t);
        }
        
        await db.collection('blogs').doc(id).set(updateData, { merge: true });
        return c.json({ message: 'Blog updated successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE blog (Admin)
blogsRoutes.delete('/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('blogs').doc(id).delete();
        return c.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default blogsRoutes;
