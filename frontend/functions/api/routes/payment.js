import { Hono } from 'hono';
import { getDb } from '../config/firebase.js';

const paymentRoutes = new Hono();

const INSTANPAY_API_KEY = 'sk_live_22sy38ydvpzhe5su';
const BASE_URL = 'https://instanpay.net/api/v1';

// QRIS Payment
paymentRoutes.post('/qris', async (c) => {
    try {
        const { amount, customer_name } = await c.req.json();
        
        const response = await fetch(`${BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'X-API-Key': INSTANPAY_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parseInt(amount),
                customer_name: customer_name || 'Travel Lombok Customer'
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create QRIS payment');
        }

        return c.json(data);
    } catch (error) {
        console.error('Instanpay QRIS Error:', error.message);
        return c.json({ error: 'Gagal membuat pembayaran QRIS' }, 500);
    }
});

// Check Status
paymentRoutes.get('/status/:transactionId', async (c) => {
    try {
        const transactionId = c.req.param('transactionId');
        const response = await fetch(`${BASE_URL}/status/${transactionId}`, {
            headers: {
                'X-API-Key': INSTANPAY_API_KEY
            }
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to check status');
        }

        return c.json(data);
    } catch (error) {
        console.error('Instanpay Status Error:', error.message);
        return c.json({ error: 'Gagal mengecek status pembayaran' }, 500);
    }
});

// Webhook dari InstanPay - dipanggil otomatis saat pembayaran berhasil
paymentRoutes.post('/webhook', async (c) => {
    try {
        const body = await c.req.json();
        console.log('Instanpay Webhook received:', JSON.stringify(body));

        // Verifikasi API Key dari header (keamanan)
        const apiKey = c.req.header('X-API-Key') || c.req.header('x-api-key');
        if (apiKey && apiKey !== INSTANPAY_API_KEY) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Status sukses dari InstanPay biasanya: "paid", "success", "settlement"
        const status = (body.status || '').toLowerCase();
        const transactionId = body.transaction_id || body.id || body.reference_id;
        const isPaid = ['paid', 'success', 'settlement', 'completed'].includes(status);

        if (isPaid && transactionId) {
            // Cari booking yang memiliki transactionId ini di Firestore
            const db = getDb(c);
            const txIdsToSearch = [transactionId, 'ORD-' + transactionId, 'BKG-' + transactionId];
            
            // Cek di koleksi bookings
            const bookingSnap = await db.collection('bookings')
                .where('transactionId', 'in', txIdsToSearch)
                .limit(1).get();

            if (!bookingSnap.empty) {
                await bookingSnap.docs[0].ref.update({
                    paymentStatus: 'Lunas',
                    status: 'confirmed',
                    paidAt: new Date().toISOString(),
                    webhookData: body
                });
                console.log(`Booking updated to Lunas for transactionId: ${transactionId}`);
            }

            // Cek juga di koleksi orderan
            const orderSnap = await db.collection('orderan')
                .where('transactionId', 'in', txIdsToSearch)
                .limit(1).get();

            if (!orderSnap.empty) {
                await orderSnap.docs[0].ref.update({
                    paymentStatus: 'Lunas',
                    status: 'confirmed',
                    paidAt: new Date().toISOString(),
                    webhookData: body
                });
                console.log(`Orderan updated to Lunas for transactionId: ${transactionId}`);
            }
        }

        return c.json({ received: true, status: isPaid ? 'processed' : 'ignored' });
    } catch (error) {
        console.error('Webhook Error:', error.message);
        return c.json({ error: 'Webhook processing failed' }, 500);
    }
});

export default paymentRoutes;
