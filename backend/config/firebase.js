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
    console.warn("WARN: serviceAccountKey.json not found! Using Local Mock DB.");
    const dbPath = path.join(__dirname, '..', 'local_db.json');
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ items: [] }));
    
    const getDb = () => JSON.parse(fs.readFileSync(dbPath));
    const saveDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    const generateId = () => Math.random().toString(36).substring(2, 15);

    db = {
        collection: (colName) => ({
            orderBy: () => ({
                get: async () => {
                    const data = getDb()[colName] || [];
                    return { forEach: (cb) => data.forEach(item => cb({ id: item.id, data: () => item })) };
                }
            }),
            where: (field, op, val) => ({
                get: async () => {
                    const data = (getDb()[colName] || []).filter(item => item[field] === val);
                    return { forEach: (cb) => data.forEach(item => cb({ id: item.id, data: () => item })) };
                }
            }),
            get: async () => {
                const data = getDb()[colName] || [];
                return { forEach: (cb) => data.forEach(item => cb({ id: item.id, data: () => item })) };
            },
            add: async (item) => {
                const data = getDb();
                if (!data[colName]) data[colName] = [];
                const id = generateId();
                data[colName].push({ id, ...item });
                saveDb(data);
                return { id };
            },
            doc: (id) => ({
                get: async () => {
                    const data = getDb()[colName] || [];
                    const item = data.find(i => i.id === id);
                    return { exists: !!item, id, data: () => item };
                },
                update: async (item) => {
                    const data = getDb();
                    const index = (data[colName] || []).findIndex(i => i.id === id);
                    if (index > -1) {
                        data[colName][index] = { ...data[colName][index], ...item };
                        saveDb(data);
                    }
                },
                delete: async () => {
                    const data = getDb();
                    data[colName] = (data[colName] || []).filter(i => i.id !== id);
                    saveDb(data);
                }
            })
        })
    };
}

module.exports = { admin, db };
