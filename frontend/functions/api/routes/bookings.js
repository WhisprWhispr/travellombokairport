import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getDb } from '../config/firebase.js';

const bookingsRoutes = new Hono();

const autoExpire = (db, col, id, data) => {
    if (data.status === 'PENDING') {
        const created = data.createdAt ? new Date(data.createdAt).getTime() : 0;
        if (created > 0 && (Date.now() - created) > 2 * 60 * 60 * 1000) {
            data.status = 'KADALUARSA';
            db.collection(col).doc(id).update({ status: 'KADALUARSA' }).catch(()=>{});
        }
    }
    return data;
};

// Middleware for auth
const verifyToken = async (c, next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Unauthorized: No token provided' }, 401);
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
        const secret = c.env.JWT_SECRET || 'rahasia-default-lokal-123';
        const decodedToken = await verify(token, secret, 'HS256');
        c.set('user', decodedToken);
        await next();
    } catch (error) {
        return c.json({ message: 'Unauthorized: Invalid token' }, 403);
    }
};

// GET all bookings (public/admin)
bookingsRoutes.get('/', async (c) => {
    try {
        const db = getDb(c);
        const itemId = c.req.query('itemId');
        const isPublic = c.req.query('public');
        
        let query = db.collection('bookings');
        
        if (itemId) {
            query = query.where('itemId', '==', itemId);
        }
        
        const snapshot = await query.get();
        let bookings = [];
        snapshot.forEach(doc => {
            let data = doc.data();
            data = autoExpire(db, 'bookings', doc.id, data);
            
            if (isPublic === 'true') {
                bookings.push({
                    id: doc.id,
                    itemId: data.itemId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: data.status
                });
            } else {
                bookings.push({ id: doc.id, ...data });
            }
        });
        
        return c.json(bookings);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// POST new booking
bookingsRoutes.post('/', async (c) => {
    try {
        const db = getDb(c);
        const body = await c.req.json();
        const newBooking = {
            ...body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('bookings').add(newBooking);
        const transactionId = body.transactionId || docRef.id;

        // --- Kirim Email Invoice Otomatis via Resend ---
        if (body.customerEmail) {
            const resendApiKey = c.env.RESEND_API_KEY;
            
            if (resendApiKey) {
                const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #16a34a, #2563eb); padding: 25px; text-align: center; color: white;">
                        <h2 style="margin: 0; font-size: 24px;">Travel Lombok Airport</h2>
                        <p style="margin: 5px 0 0; opacity: 0.9;">E-Ticket & Invoice Perjalanan</p>
                    </div>
                    <div style="padding: 30px;">
                        <p>Halo <strong>${body.customerName || 'Pelanggan'}</strong>,</p>
                        <p>Terima kasih telah memesan layanan di Travel Lombok Airport. Berikut adalah rincian pesanan Anda:</p>
                        
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; width: 40%;">ID Booking</td>
                                    <td style="padding: 8px 0; font-weight: bold;">${transactionId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b;">Layanan</td>
                                    <td style="padding: 8px 0; font-weight: bold;">${body.itemName || '-'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b;">Tanggal</td>
                                    <td style="padding: 8px 0; font-weight: bold;">${body.startDate || '-'} ${body.endDate ? 's.d ' + body.endDate : ''}</td>
                                </tr>
                                <tr style="border-top: 1px solid #e2e8f0;">
                                    <td style="padding: 12px 0 0; color: #64748b;">Status Pembayaran</td>
                                    <td style="padding: 12px 0 0; font-weight: bold; color: #f59e0b;">Menunggu Pembayaran (Pending)</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
                            <h4 style="margin: 0 0 10px; color: #1e3a8a;">Instruksi Pembayaran</h4>
                            <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5;">
                                Untuk mengkonfirmasi pesanan ini, silakan selesaikan pembayaran ke rekening berikut:<br><br>
                                <strong>BANK BRI</strong><br>
                                Nama: Lalu Renggane<br>
                                Nomor Rekening: 759801017387536<br><br>
                                <strong>BANK MANDIRI</strong><br>
                                Nama: Lalu Renggane<br>
                                Nomor Rekening: 1610017191425
                            </p>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748b;">Jika Anda memiliki pertanyaan atau butuh bantuan, silakan hubungi kami via WhatsApp di +62 896-7696-3255.</p>
                        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Hormat kami,<br><strong>Tim Travel Lombok Airport</strong></p>
                    </div>
                </div>
            `;

            try {
                // Dalam tahap testing tanpa domain verified di Resend, email pengirim HARUS onboarding@resend.dev
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Travel Lombok Airport <admin@travellombokairport.com>',
                        to: body.customerEmail,
                        subject: `Invoice & E-Ticket: ${body.itemName || 'Layanan Travel'}`,
                        html: emailHtml
                    })
                });
                console.log(`Email invoice sent successfully to ${body.customerEmail}`);
            } catch (emailErr) {
                console.error("Gagal mengirim email via Resend:", emailErr);
            }
            } // end if (resendApiKey)
        }
        // --- Akhir Kirim Email ---

        return c.json({ id: docRef.id, ...newBooking }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// DELETE booking
bookingsRoutes.delete('/:id', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        await db.collection('bookings').doc(id).delete();
        return c.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET riwayat transaksi milik user (butuh JWT)
bookingsRoutes.get('/my-history', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const user = c.get('user');
        const userEmail = user.email;

        if (!userEmail) {
            return c.json({ error: 'Email tidak ditemukan di token.' }, 400);
        }

        // Ambil bookings (BKG- / rental & transfer)
        const bkgSnap = await db.collection('bookings')
            .where('customerEmail', '==', userEmail)
            .get();

        // Ambil orders (ORD- / paket tour via QRIS)
        const ordSnap = await db.collection('orders')
            .where('customerEmail', '==', userEmail)
            .get();

        const bookings = [];
        bkgSnap.forEach(doc => {
            let d = doc.data();
            d = autoExpire(db, 'bookings', doc.id, d);
            
            bookings.push({
                id: doc.id,
                type: 'booking',
                transactionId: d.transactionId || doc.id,
                itemName: d.itemName || d.serviceName || '-',
                customerName: d.customerName || '-',
                customerEmail: d.customerEmail || d.email || '-',
                phone: d.phone || d.wa || '-',
                startDate: d.startDate || null,
                endDate: d.endDate || null,
                status: d.status || 'PENDING',
                itemPrice: d.itemPrice || d.price || 0,
                createdAt: d.createdAt || null,
            });
        });

        const orders = [];
        ordSnap.forEach(doc => {
            let d = doc.data();
            d = autoExpire(db, 'orders', doc.id, d);
            
            orders.push({
                id: doc.id,
                type: 'order',
                transactionId: d.transactionId || doc.id,
                itemName: d.itemName || d.packageName || '-',
                customerName: d.customerName || '-',
                customerEmail: d.customerEmail || d.email || '-',
                phone: d.phone || d.wa || '-',
                startDate: d.travelDate || d.startDate || null,
                endDate: d.endDate || null,
                status: d.status || 'PENDING',
                itemPrice: d.totalPrice || d.price || 0,
                createdAt: d.createdAt || null,
            });
        });

        // Gabung & sort by createdAt terbaru
        const all = [...bookings, ...orders].sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const db2 = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return db2 - da;
        });

        return c.json(all);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET specific booking/order for check status (public)
// BKG- → hanya cari di collection 'bookings'
// ORD- → hanya cari di collection 'orders'
bookingsRoutes.get('/check/:transactionId', async (c) => {
    try {
        const db = getDb(c);
        const transactionId = c.req.param('transactionId').trim().toUpperCase();

        // Deteksi tipe berdasarkan prefix ID
        const isBKG = transactionId.startsWith('BKG-');
        const isORD = transactionId.startsWith('ORD-');

        if (!isBKG && !isORD) {
            return c.json({ message: 'Format ID tidak valid. Gunakan BKG-... untuk Booking atau ORD-... untuk Order.' }, 400);
        }

        // Cari di collection 'bookings' terlebih dahulu (karena frontend POST /bookings untuk ORD- dan BKG-)
        let snap = await db.collection('bookings').where('transactionId', '==', transactionId).get();
        let collectionType = 'bookings';
        
        // Jika tidak ditemukan di 'bookings', coba cari di 'orders' atau 'orderan'
        if (snap.empty) {
            snap = await db.collection('orders').where('transactionId', '==', transactionId).get();
            collectionType = 'orders';
            
            if (snap.empty) {
                snap = await db.collection('orderan').where('transactionId', '==', transactionId).get();
                collectionType = 'orderan';
            }
        }

        if (snap.empty) {
            return c.json({ message: 'Transaksi tidak ditemukan. Pastikan ID (BKG-... atau ORD-...) yang Anda masukkan benar.' }, 404);
        }

        let data = snap.docs[0].data();
        data = autoExpire(db, collectionType, snap.docs[0].id, data);
        
        return c.json({
            transactionId: data.transactionId || transactionId,
            itemName: data.itemName || data.packageName || data.serviceName || '-',
            customerName: data.customerName || '-',
            customerEmail: data.customerEmail || data.email || '-',
            phone: data.phone || data.wa || '-',
            startDate: data.startDate || data.travelDate || null,
            endDate: data.endDate || null,
            status: data.status || 'PENDING',
            itemPrice: data.price || data.totalPrice || data.itemPrice || 0,
            isDp: data.isDp || false,
            fullPrice: data.fullPrice || data.price || data.totalPrice || 0,
            createdAt: data.createdAt || null,
            type: isORD ? 'order' : 'booking'
        });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update booking status by transactionId (for QRIS payment callback - no auth required)
bookingsRoutes.put('/by-txid/:transactionId/status', async (c) => {
    try {
        const db = getDb(c);
        const transactionId = c.req.param('transactionId');
        const { status } = await c.req.json();
        
        if (!status) {
            return c.json({ message: 'Status is required' }, 400);
        }
        
        const snapshot = await db.collection('bookings').where('transactionId', '==', transactionId).get();
        if (snapshot.empty) {
            return c.json({ message: 'Booking not found' }, 404);
        }
        
        const docId = snapshot.docs[0].id;
        await db.collection('bookings').doc(docId).update({ status });
        
        return c.json({ message: 'Booking status updated successfully', transactionId, status });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT update booking status
bookingsRoutes.put('/:id/status', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const { status } = await c.req.json();
        
        if (!status) {
            return c.json({ message: 'Status is required' }, 400);
        }
        
        await db.collection('bookings').doc(id).update({ status });
        return c.json({ message: 'Booking status updated successfully', status });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT assign driver to booking
bookingsRoutes.put('/:id/driver', verifyToken, async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const { driverId, driverName } = await c.req.json();
        
        await db.collection('bookings').doc(id).update({ 
            driverId: driverId || null,
            driverName: driverName || ''
        });
        return c.json({ message: 'Driver assigned successfully', driverId });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PUT driver complete trip (Driver Only)
bookingsRoutes.put('/:id/complete', async (c) => {
    try {
        const db = getDb(c);
        const id = c.req.param('id');
        const driverId = c.req.header('x-driver-id');
        
        if (!driverId) {
            return c.json({ message: 'Unauthorized driver' }, 401);
        }
        
        const doc = await db.collection('bookings').doc(id).get();
        if (!doc.exists || doc.data().driverId !== driverId) {
            return c.json({ message: 'Forbidden: Not your booking' }, 403);
        }
        
        await db.collection('bookings').doc(id).update({ status: 'COMPLETED' });
        return c.json({ message: 'Trip completed successfully' });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default bookingsRoutes;
