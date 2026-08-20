import { Hono } from 'hono';

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

export default paymentRoutes;
