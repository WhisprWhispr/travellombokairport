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

        if (parseInt(amount) < 1000) {
            return c.json({ error: 'Minimum pembayaran QRIS adalah Rp 1.000', details: `Amount: ${amount}` }, 422);
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
            const borderpayErr = data.message || data.error || data.errors || JSON.stringify(data);
            console.error('Borderpay QRIS error:', JSON.stringify(data));
            return c.json({
                error: `Borderpay error (HTTP ${response.status})`,
                details: typeof borderpayErr === 'string' ? borderpayErr : JSON.stringify(borderpayErr),
                raw: data
            }, response.status);
        }

        const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // Paksa 1 jam untuk QRIS
        
        return c.json({
            success: true,
            data: {
                qrCodeSvg: buildQrHtml(data.qr_string),
                transactionId: data.reference_id,
                totalFormatted: formatRupiah(amount),
                expiredAt: formatDate(expiryDate.toISOString()),
                expiredAtISO: expiryDate.toISOString(),
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

        // Paksa 24 jam untuk Virtual Account
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const expiredAt = formatDate(expiryDate.toISOString());

        console.log('Borderpay VA raw response:', JSON.stringify(data));

        return c.json({
            success: true,
            data: {
                vaNumber: data.va_number || data.virtual_account || data.account_number,
                vaBank: data.va_bank || data.bank || data.bank_code || bank_code.toUpperCase(),
                transactionId: data.reference_id || data.id,
                totalFormatted: formatRupiah(data.customer_pays || data.amount || amount),
                amountFormatted: formatRupiah(data.amount || amount),
                expiredAt,
                expiredAtISO: expiryDate.toISOString(),
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
                const oldData = bookingSnap.docs[0].data();
                await bookingSnap.docs[0].ref.update(updatePayload);
                console.log(`✅ Booking Lunas: ${transactionId}`);
                
                // --- Kirim Email ---
                if (oldData.status !== 'confirmed' && oldData.status !== 'PAID' && oldData.customerEmail) {
                    const resendApiKey = c.env.RESEND_API_KEY;
                    if (resendApiKey) {
                        const emailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                            <div style="background: linear-gradient(135deg, #16a34a, #2563eb); padding: 25px; text-align: center; color: white;">
                                <h2 style="margin: 0; font-size: 24px;">Travel Lombok Airport</h2>
                                <p style="margin: 5px 0 0; opacity: 0.9;">E-Ticket & Invoice Perjalanan (LUNAS)</p>
                            </div>
                            <div style="padding: 30px;">
                                <p>Halo <strong>${oldData.customerName || 'Pelanggan'}</strong>,</p>
                                <p>Terima kasih! Pembayaran Anda telah kami terima. Berikut adalah rincian pesanan Anda:</p>
                                
                                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #64748b; width: 40%;">ID Booking</td>
                                            <td style="padding: 8px 0; font-weight: bold;">${transactionId}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #64748b;">Layanan</td>
                                            <td style="padding: 8px 0; font-weight: bold;">${oldData.itemName || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #64748b;">Tanggal</td>
                                            <td style="padding: 8px 0; font-weight: bold;">${oldData.startDate || '-'} ${oldData.endDate ? 's.d ' + oldData.endDate : ''}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #e2e8f0;">
                                            <td style="padding: 12px 0 0; color: #64748b;">Status Pembayaran</td>
                                            <td style="padding: 12px 0 0; font-weight: bold; color: #16a34a;">Pembayaran Berhasil (LUNAS)</td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style="font-size: 14px; color: #64748b;">Tim kami akan segera menghubungi Anda melalui WhatsApp untuk kordinasi lebih lanjut terkait penjemputan/pengantaran. Jika Anda memiliki pertanyaan atau butuh bantuan, silakan hubungi kami via WhatsApp di +62 896-7696-3255.</p>
                                <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Hormat kami,<br><strong>Tim Travel Lombok Airport</strong></p>
                            </div>
                        </div>
                        `;

                        try {
                            await fetch('https://api.resend.com/emails', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${resendApiKey}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    from: 'Travel Lombok Airport <admin@travellombokairport.com>',
                                    to: oldData.customerEmail,
                                    bcc: ['lombokindah892@gmail.com', 'ridhosandhika78@gmail.com'],
                                    subject: `[LUNAS] E-Ticket: ${oldData.itemName || 'Layanan Travel'}`,
                                    html: emailHtml
                                })
                            });
                            console.log(`Email LUNAS (Webhook) sent to ${oldData.customerEmail} and BCC admins`);
                        } catch (err) {
                            console.error("Webhook LUNAS Email error:", err);
                        }
                    }
                }
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
