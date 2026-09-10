import { Hono } from 'hono';
import { getDb } from '../config/firebase.js';

const paymentRoutes = new Hono();

// ==========================================
// Config — Docs: https://borderpay.id/docs
// ==========================================
const BORDERPAY_BASE_URL = 'https://borderpay.id/api/v1';

// Helper: render QR dari qr_string (QRIS mentah) ke gambar
function buildQrHtml(qrString) {
    if (!qrString) return '<p style="color:red">Data QR tidak tersedia</p>';
    const encoded = encodeURIComponent(qrString);
    return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}" alt="QRIS" style="width:220px;height:220px;border-radius:8px;" />`;
}

// Helper: format tanggal ke lokal Indonesia
function formatDate(isoString, timezone = 'Asia/Makassar') {
    if (!isoString) return '-';
    try {
        return new Date(isoString).toLocaleString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric', hour: '2-digit', minute: '2-digit',
            timeZone: timezone
        });
    } catch(e) { return isoString; }
}

// Helper: format Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(parseInt(amount));
}

// ==========================================
// 1. QRIS Payment — expires 1 jam
// POST /api/v1/payments  (method: "qris")
// ==========================================
paymentRoutes.post('/qris', async (c) => {
    try {
        const { amount, customer_name, reference_id } = await c.req.json();
        const BORDERPAY_API_KEY = c.env?.BORDERPAY_API_KEY || '';

        if (!BORDERPAY_API_KEY) {
            return c.json({ error: 'API Key Borderpay belum dikonfigurasi' }, 500);
        }

        const payload = {
            amount: parseInt(amount),
            method: 'qris',
            reference_id: reference_id || `ORD-${Date.now()}`
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
            console.error('Borderpay QRIS error:', JSON.stringify(data));
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        return c.json({
            success: true,
            data: {
                qrCodeSvg: buildQrHtml(data.qr_string),
                transactionId: data.reference_id,
                totalFormatted: formatRupiah(amount),
                expiredAt: formatDate(data.expires_at),
                payUrl: data.pay_url,
                raw: data
            }
        });

    } catch (error) {
        console.error('Borderpay QRIS Error:', error.message);
        return c.json({ error: 'Gagal membuat pembayaran QRIS via Borderpay', details: error.message }, 500);
    }
});

// ==========================================
// 2. Virtual Account Payment — expires 24 jam
// POST /api/v1/payments  (method: "va")
// bank_code: "BNI" | "BRI" | "MANDIRI" | "PERMATA" | "BCA"
// ==========================================
paymentRoutes.post('/va', async (c) => {
    try {
        const { amount, bank_code, reference_id } = await c.req.json();
        const BORDERPAY_API_KEY = c.env?.BORDERPAY_API_KEY || '';

        if (!BORDERPAY_API_KEY) {
            return c.json({ error: 'API Key Borderpay belum dikonfigurasi' }, 500);
        }

        if (!bank_code) {
            return c.json({ error: 'bank_code wajib diisi (BNI, BRI, MANDIRI, PERMATA, BCA)' }, 400);
        }

        if (parseInt(amount) < 10000) {
            return c.json({ error: 'Minimum pembayaran VA adalah Rp 10.000' }, 422);
        }

        const payload = {
            amount: parseInt(amount),
            method: 'va',
            bank_code: bank_code.toUpperCase(),
            reference_id: reference_id || `ORD-${Date.now()}`
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
            console.error('Borderpay VA error:', JSON.stringify(data));
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        return c.json({
            success: true,
            data: {
                vaNumber: data.va_number,
                vaBank: data.va_bank || bank_code.toUpperCase(),
                transactionId: data.reference_id,
                totalFormatted: formatRupiah(data.customer_pays || amount),
                amountFormatted: formatRupiah(data.amount || amount),
                expiredAt: formatDate(data.expires_at),
                payUrl: data.pay_url,
                raw: data
            }
        });

    } catch (error) {
        console.error('Borderpay VA Error:', error.message);
        return c.json({ error: 'Gagal membuat pembayaran Virtual Account', details: error.message }, 500);
    }
});

// ==========================================
// 3. Cek Status Pembayaran (QRIS & VA)
// GET /api/v1/payments/{reference_id}
// ==========================================
paymentRoutes.get('/status/:transactionId', async (c) => {
    try {
        const transactionId = c.req.param('transactionId');
        const BORDERPAY_API_KEY = c.env?.BORDERPAY_API_KEY || '';

        const response = await fetch(`${BORDERPAY_BASE_URL}/payments/${transactionId}`, {
            headers: { 'Authorization': `Bearer ${BORDERPAY_API_KEY}` }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        return c.json({
            success: true,
            data: {
                status: (data.status || '').toUpperCase(),
                reference_id: data.reference_id,
                amount: data.amount,
                paid_at: data.paid_at,
                method: data.method,
                raw: data
            }
        });

    } catch (error) {
        console.error('Borderpay Status Error:', error.message);
        return c.json({ error: 'Gagal mengecek status pembayaran' }, 500);
    }
});

// ==========================================
// 4. Webhook dari Borderpay
// Headers: x-borderpay-token, x-borderpay-event, x-borderpay-mode
// Payload: { event, mode, data: { reference_id, status, amount, method, ... } }
// ==========================================
paymentRoutes.post('/webhook', async (c) => {
    try {
        const body = await c.req.json();
        console.log('Borderpay Webhook received:', JSON.stringify(body));

        const BORDERPAY_WEBHOOK_TOKEN = c.env?.BORDERPAY_WEBHOOK_TOKEN || '';
        const incomingToken = c.req.header('x-borderpay-token');

        // Verifikasi token (jika token sudah dikonfigurasi)
        if (BORDERPAY_WEBHOOK_TOKEN && (!incomingToken || incomingToken !== BORDERPAY_WEBHOOK_TOKEN)) {
            console.error('Invalid Borderpay webhook token');
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Sesuai docs: event ada di body.event, data ada di body.data
        const event = body.event || '';
        const paymentData = body.data || {};
        const transactionId = paymentData.reference_id || paymentData.order_id;
        const status = (paymentData.status || '').toLowerCase();
        const isPaid = event === 'payment.paid' || status === 'paid';

        console.log(`Webhook: event=${event}, ref=${transactionId}, status=${status}`);

        if (isPaid && transactionId) {
            const db = getDb(c);

            // Cari dengan berbagai kemungkinan format ID
            const txIdsToSearch = [transactionId];
            if (!transactionId.startsWith('ORD-')) txIdsToSearch.push('ORD-' + transactionId);
            if (!transactionId.startsWith('BKG-')) txIdsToSearch.push('BKG-' + transactionId);

            const updatePayload = {
                paymentStatus: 'Lunas',
                status: 'confirmed',
                paidAt: paymentData.paid_at || new Date().toISOString(),
                paymentMethod: paymentData.method || 'unknown',
                webhookData: body
            };

            // Update bookings
            const bookingSnap = await db.collection('bookings')
                .where('transactionId', 'in', txIdsToSearch)
                .limit(1).get();
            if (!bookingSnap.empty) {
                await bookingSnap.docs[0].ref.update(updatePayload);
                console.log(`✅ Booking Lunas: ${transactionId}`);
            }

            // Update orderan
            const orderSnap = await db.collection('orderan')
                .where('transactionId', 'in', txIdsToSearch)
                .limit(1).get();
            if (!orderSnap.empty) {
                await orderSnap.docs[0].ref.update(updatePayload);
                console.log(`✅ Orderan Lunas: ${transactionId}`);
            }
        }

        return c.json({ received: true, status: isPaid ? 'processed' : 'ignored' });

    } catch (error) {
        console.error('Webhook Error:', error.message);
        return c.json({ error: 'Webhook processing failed' }, 500);
    }
});

export default paymentRoutes;
