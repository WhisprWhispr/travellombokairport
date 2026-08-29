require('dotenv').config();
const { db } = require('./config/firebase');

async function insertDummyKnowledgeBase() {
    console.log("Memulai proses penambahan 100 data knowledge base...");
    const batch = db.batch();
    
    for (let i = 1; i <= 100; i++) {
        const docRef = db.collection('ai_knowledge_base').doc();
        batch.set(docRef, {
            rule: `Ini adalah aturan dummy (testing) ke-${i}. Aturan ini dibuat secara otomatis untuk menguji batas konteks sistem AI Lombok. Jika pengguna bertanya tentang aturan ke-${i}, beritahu mereka bahwa ini berfungsi.`,
            isActive: true,
            createdAt: new Date().toISOString()
        });
    }

    try {
        await batch.commit();
        console.log("Berhasil menambahkan 100 data aturan (knowledge base) ke Firebase!");
    } catch (error) {
        console.error("Gagal menambahkan data:", error);
    }
}

insertDummyKnowledgeBase().then(() => process.exit(0));
