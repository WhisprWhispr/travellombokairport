const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { admin } = require('../config/firebase');

// Middleware for auth
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
        if (!admin.auth) {
            // Fallback for Local DB mode where admin auth isn't initialized
            return next();
        }
        const decodedToken = await admin.auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
};

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/', verifyToken, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Construct the URL. It will be served statically by Express at /uploads/...
        // Using relative path so it works regardless of domain.
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Error in upload route:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

module.exports = router;
