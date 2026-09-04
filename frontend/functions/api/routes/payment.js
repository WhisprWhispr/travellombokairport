import { Hono } from 'hono';
import { getDb } from '../config/firebase.js';

const paymentRoutes = new Hono();

// ==========================================
// API Keys & Config
// ==========================================
const BORDERPAY_BASE_URL = 'https://borderpay.id/api/v1';

// 1. QRIS Payment
paymentRoutes.post('/qris', async (c) => {
    try {
        const { amount, customer_name, reference_id } = await c.req.json();
        const BORDERPAY_API_KEY = c.env?.BORDERPAY_API_KEY || 'bp_test_placeholder_key';
        
        const payload = {
            amount: parseInt(amount),
            method: 'QRIS',
            reference_id: reference_id || `TRX-${Date.now()}`,
            customer_name: customer_name || 'Travel Lombok Customer'
        };
        
        const response = await fetch(`${BORDERPAY_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BORDERPAY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create QRIS payment via Borderpay');
        }

        return c.json(data);
    } catch (error) {
        console.error('Borderpay QRIS Error:', error.message);
        return c.json({ error: 'Gagal membuat pembayaran QRIS via Borderpay' }, 500);
    }
});

// 2. Check Status
paymentRoutes.get('/status/:transactionId', async (c) => {
    try {
        const transactionId = c.req.param('transactionId');
        const BORDERPAY_API_KEY = c.env?.BORDERPAY_API_KEY || 'bp_test_placeholder_key';
        
        const response = await fetch(`${BORDERPAY_BASE_URL}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${BORDERPAY_API_KEY}`
            }
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to check status');
        }

        return c.json(data);
    } catch (error) {
        console.error('Borderpay Status Error:', error.message);
        return c.json({ error: 'Gagal mengecek status pembayaran' }, 500);
    }
});

// 3. Webhook dari Borderpay
paymentRoutes.post('/webhook', async (c) => {
    try {
        const body = await c.req.json();
        console.log('Borderpay Webhook received:', JSON.stringify(body));

        // Verifikasi menggunakan simple token header (metode resmi Borderpay)
        const BORDERPAY_WEBHOOK_TOKEN = c.env?.BORDERPAY_WEBHOOK_TOKEN || '';
        const incomingToken = c.req.header('x-borderpay-token');

        if (!incomingToken || incomingToken !== BORDERPAY_WEBHOOK_TOKEN) {
            console.error('Invalid Borderpay webhook token');
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const status = (body.status || '').toLowerCase();
        const transactionId = body.reference_id || body.transactionId || body.id;
        const isPaid = ['paid', 'success', 'settlement', 'completed'].includes(status);

        if (isPaid && transactionId) {
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
