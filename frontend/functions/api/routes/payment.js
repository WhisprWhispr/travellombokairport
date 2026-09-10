import { Hono } from 'hono';
import { getDb } from '../config/firebase.js';

const paymentRoutes = new Hono();

// ==========================================
// Config
// Docs: https://borderpay.id/docs
// ==========================================
const BORDERPAY_BASE_URL = 'https://borderpay.id/api/v1';

// Helper: render QR dari qr_string (QRIS mentah) menggunakan QR code library via URL
function buildQrHtml(qrString) {
    if (!qrString) return '<p style="color:red">Data QR tidak tersedia</p>';
    // Gunakan QR server publik untuk render qr_string menjadi gambar QR
    const encoded = encodeURIComponent(qrString);
    return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}" alt="QRIS" style="width:220px;height:220px;border-radius:8px;" />`;
}

// ==========================================
// 1. Buat Pembayaran QRIS
// POST /api/v1/payments
// ==========================================
paymentRoutes.post('/qris', async (c) => {
    try {
        const { amount, customer_name, reference_id } = await c.req.json();
        const BORDERPAY_API_KEY = c.env?.BORDERPAY_API_KEY || '';

        if (!BORDERPAY_API_KEY) {
            return c.json({ error: 'API Key Borderpay belum dikonfigurasi' }, 500);
        }

        // Payload sesuai docs Borderpay
        const payload = {
            amount: parseInt(amount),
            method: 'qris',  // harus huruf kecil sesuai docs
            reference_id: reference_id || `ORD-${Date.now()}`
            // customer_name bukan field Borderpay, tidak perlu dikirim
        };

        const response = await fetch(`${BORDERPAY_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BORDERPAY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Borderpay error response:', JSON.stringify(data));
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        // Format jumlah ke Rupiah
        const formattedAmount = new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(parseInt(amount));

        // Format expires_at (sesuai docs Borderpay, field namanya expires_at, format ISO 8601)
        const expiredRaw = data.expires_at;
        let expiredFormatted = '-';
        if (expiredRaw) {
            try {
                expiredFormatted = new Date(expiredRaw).toLocaleString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long',
                    day: 'numeric', hour: '2-digit', minute: '2-digit',
                    timeZone: 'Asia/Makassar'
                });
            } catch(e) { expiredFormatted = expiredRaw; }
        }

        // qr_string adalah string QRIS mentah (sesuai docs Borderpay)
        const qrCodeSvg = buildQrHtml(data.qr_string);

        // reference_id digunakan sebagai transactionId di Borderpay
        const transactionId = data.reference_id;

        return c.json({
            success: true,
            data: {
                qrCodeSvg,
                transactionId,
                totalFormatted: formattedAmount,
                expiredAt: expiredFormatted,
                payUrl: data.pay_url,  // bonus: URL checkout Borderpay
                raw: data  // untuk debugging
            }
        });

    } catch (error) {
        console.error('Borderpay QRIS Error:', error.message);
        return c.json({ error: 'Gagal membuat pembayaran QRIS via Borderpay', details: error.message }, 500);
    }
});

// ==========================================
// 2. Cek Status Pembayaran
// GET /api/v1/payments/{reference_id}
// ==========================================
paymentRoutes.get('/status/:transactionId', async (c) => {
    try {
        const transactionId = c.req.param('transactionId');
        const BORDERPAY_API_KEY = c.env?.BORDERPAY_API_KEY || '';

        const response = await fetch(`${BORDERPAY_BASE_URL}/payments/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${BORDERPAY_API_KEY}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        // Normalisasi response ke format yang dipakai frontend
        // Docs: status bisa "pending", "paid", "expired", "failed"
        return c.json({
            success: true,
            data: {
                status: (data.status || '').toUpperCase(),
                reference_id: data.reference_id,
                amount: data.amount,
                paid_at: data.paid_at,
                raw: data
            }
        });

    } catch (error) {
        console.error('Borderpay Status Error:', error.message);
        return c.json({ error: 'Gagal mengecek status pembayaran' }, 500);
    }
});

// ==========================================
// 3. Webhook dari Borderpay
// Docs: header x-borderpay-token & x-borderpay-event
// Payload: { event, mode, data: { reference_id, status, amount, ... } }
// ==========================================
paymentRoutes.post('/webhook', async (c) => {
    try {
        const body = await c.req.json();
        console.log('Borderpay Webhook received:', JSON.stringify(body));

        // Verifikasi token dari header (sesuai docs Borderpay)
        const BORDERPAY_WEBHOOK_TOKEN = c.env?.BORDERPAY_WEBHOOK_TOKEN || '';
        const incomingToken = c.req.header('x-borderpay-token');

        if (BORDERPAY_WEBHOOK_TOKEN && (!incomingToken || incomingToken !== BORDERPAY_WEBHOOK_TOKEN)) {
            console.error('Invalid Borderpay webhook token');
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Event dan data sesuai docs Borderpay
        // body.event: "payment.paid" / "payment.expired" / "payment.failed"
        // body.data: { reference_id, status, amount, ... }
        const event = body.event || '';
        const paymentData = body.data || {};
        const transactionId = paymentData.reference_id || paymentData.order_id;
        const status = (paymentData.status || '').toLowerCase();
        const isPaid = event === 'payment.paid' || status === 'paid';

        console.log(`Webhook event: ${event}, reference_id: ${transactionId}, status: ${status}`);

        if (isPaid && transactionId) {
            const db = getDb(c);

            // Cari di berbagai kemungkinan ID format
            const txIdsToSearch = [transactionId];
            if (!transactionId.startsWith('ORD-')) txIdsToSearch.push('ORD-' + transactionId);
            if (!transactionId.startsWith('BKG-')) txIdsToSearch.push('BKG-' + transactionId);

            // Update bookings
            const bookingSnap = await db.collection('bookings')
                .where('transactionId', 'in', txIdsToSearch)
                .limit(1).get();

            if (!bookingSnap.empty) {
                await bookingSnap.docs[0].ref.update({
                    paymentStatus: 'Lunas',
                    status: 'confirmed',
                    paidAt: paymentData.paid_at || new Date().toISOString(),
                    webhookData: body
                });
                console.log(`✅ Booking updated to Lunas: ${transactionId}`);
            }

            // Update orderan
            const orderSnap = await db.collection('orderan')
                .where('transactionId', 'in', txIdsToSearch)
                .limit(1).get();

            if (!orderSnap.empty) {
                await orderSnap.docs[0].ref.update({
                    paymentStatus: 'Lunas',
                    status: 'confirmed',
                    paidAt: paymentData.paid_at || new Date().toISOString(),
                    webhookData: body
                });
                console.log(`✅ Orderan updated to Lunas: ${transactionId}`);
            }
        }

        return c.json({ received: true, status: isPaid ? 'processed' : 'ignored' });

    } catch (error) {
        console.error('Webhook Error:', error.message);
        return c.json({ error: 'Webhook processing failed' }, 500);
    }
});

export default paymentRoutes;
