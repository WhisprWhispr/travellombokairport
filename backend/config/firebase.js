const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let admin = {};
let db;

if (fs.existsSync(serviceAccountPath)) {
    const { initializeApp, cert } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const { getAuth } = require('firebase-admin/auth');
    const serviceAccount = require(serviceAccountPath);
    const app = initializeApp({ credential: cert(serviceAccount) });
    db = getFirestore();
    admin.auth = getAuth(app);
    console.log("Firebase initialized successfully.");
} else {
    console.error("ERROR: serviceAccountKey.json not found!");
    console.error("Please download your Firebase Admin SDK service account key and save it as backend/config/serviceAccountKey.json");
    console.error("All data MUST be saved to Firebase according to user request, so local mock DB is disabled.");
    
    // Create dummy db that throws error when used
    db = {
        collection: (colName) => {
            throw new Error(`Data cannot be saved to ${colName} because Firebase is not configured (missing serviceAccountKey.json)`);
        }
    };
    
    // We do NOT exit process here so that frontend can still be served, but API calls will fail loudly.
}

module.exports = { admin, db };
