const { db } = require('./backend/config/firebase');

async function checkOrds() {
    try {
        const snapshot = await db.collection('bookings').get();
        const ords = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.transactionId && data.transactionId.startsWith('ORD-')) {
                ords.push(data);
            }
        });
        console.log(JSON.stringify(ords, null, 2));
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
checkOrds();
