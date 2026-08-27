const nodemailer = require('nodemailer');
require('dotenv').config();

// Konfigurasi transporter menggunakan SMTP Gmail (atau layanan lain yang ada di .env)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Default ke gmail, bisa disesuaikan
    auth: {
        user: process.env.EMAIL_USER, // Email admin (misal: admin@travellombokairport.com)
        pass: process.env.EMAIL_PASS  // App Password Gmail
    }
});

/**
 * Mengirim email notifikasi perubahan status pesanan
 * @param {Object} bookingData - Data pesanan
 * @param {String} type - Tipe pesanan ('booking' atau 'order')
 */
const sendStatusChangeEmail = async (bookingData, type = 'booking') => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('EMAIL_USER atau EMAIL_PASS belum diatur di .env. Lewati pengiriman email.');
            return;
        }

        // Coba cari email dari field yang tersedia
        const customerEmail = bookingData.customerEmail || bookingData.email || bookingData.userEmail;
        if (!customerEmail) {
            console.warn(`Tidak ada email ditemukan untuk transaksi ${bookingData.transactionId || bookingData.id}`);
            return;
        }

        const status = bookingData.status || 'UNKNOWN';
        const itemName = bookingData.itemName || bookingData.packageName || bookingData.serviceName || '-';
        const dateStr = bookingData.startDate || bookingData.travelDate 
            ? new Date(bookingData.startDate || bookingData.travelDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) 
            : '-';

        let subject = `Pembaruan Status Pesanan: ${status} - Travel Lombok Airport`;
        let statusMessage = '';

        if (status === 'PAID') {
            subject = `✅ Pembayaran Berhasil (Pesanan Lunas) - Travel Lombok Airport`;
            statusMessage = `Terima kasih! Pembayaran Anda telah kami terima dan pesanan Anda kini berstatus <strong>LUNAS (PAID)</strong>.`;
        } else if (status === 'CONFIRMED') {
            subject = `✅ Pesanan Dikonfirmasi - Travel Lombok Airport`;
            statusMessage = `Pesanan Anda telah kami <strong>KONFIRMASI</strong>. Kami akan segera menghubungi Anda untuk koordinasi lebih lanjut.`;
        } else if (status === 'CANCELLED' || status === 'FAILED') {
            subject = `❌ Pesanan Dibatalkan - Travel Lombok Airport`;
            statusMessage = `Mohon maaf, pesanan Anda telah <strong>DIBATALKAN</strong>. Jika Anda memiliki pertanyaan, silakan hubungi Customer Service kami.`;
        } else {
            statusMessage = `Status pesanan Anda saat ini adalah: <strong>${status}</strong>.`;
        }

        const mailOptions = {
            from: `"Travel Lombok Airport" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: subject,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0284c7; text-align: center;">Travel Lombok Airport</h2>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
                <p>Halo <strong>${bookingData.customerName || 'Pelanggan Setia'}</strong>,</p>
                <p>${statusMessage}</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #1e293b;">Detail Pesanan:</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569;">
                        <li style="margin-bottom: 8px;"><strong>ID Transaksi:</strong> ${bookingData.transactionId || '-'}</li>
                        <li style="margin-bottom: 8px;"><strong>Layanan/Paket:</strong> ${itemName}</li>
                        <li style="margin-bottom: 8px;"><strong>Tanggal:</strong> ${dateStr}</li>
                        <li style="margin-bottom: 8px;"><strong>Status Saat Ini:</strong> <span style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 4px;">${status}</span></li>
                    </ul>
                </div>
                
                <p>Anda dapat mengecek status pesanan secara langsung melalui website kami menggunakan ID Transaksi di atas.</p>
                <p>Terima kasih telah memilih <strong>Travel Lombok Airport</strong> untuk perjalanan Anda.</p>
                <br />
                <p style="font-size: 0.85rem; color: #94a3b8; text-align: center;">Jika Anda memiliki pertanyaan, balas email ini atau hubungi WA kami di +62 896-7696-3255</p>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Status change email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending status change email:', error);
    }
};

/**
 * Mengirim email pengingat H-1 keberangkatan
 * @param {Object} bookingData - Data pesanan
 */
const sendReminderEmail = async (bookingData) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

        const customerEmail = bookingData.customerEmail || bookingData.email || bookingData.userEmail;
        if (!customerEmail) return;

        const itemName = bookingData.itemName || bookingData.packageName || bookingData.serviceName || '-';
        const dateStr = bookingData.startDate || bookingData.travelDate 
            ? new Date(bookingData.startDate || bookingData.travelDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) 
            : '-';

        const mailOptions = {
            from: `"Travel Lombok Airport" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `⏰ Pengingat H-1 Perjalanan Anda: ${itemName} - Travel Lombok Airport`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #16a34a; text-align: center;">Pengingat Perjalanan Besok!</h2>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
                <p>Halo <strong>${bookingData.customerName || 'Pelanggan Setia'}</strong>,</p>
                <p>Kami ingin mengingatkan bahwa layanan perjalanan Anda bersama <strong>Travel Lombok Airport</strong> akan berlangsung besok.</p>
                
                <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                    <ul style="list-style: none; padding: 0; margin: 0; color: #1e293b;">
                        <li style="margin-bottom: 8px;"><strong>ID Transaksi:</strong> ${bookingData.transactionId || '-'}</li>
                        <li style="margin-bottom: 8px;"><strong>Layanan/Paket:</strong> ${itemName}</li>
                        <li style="margin-bottom: 8px;"><strong>Tanggal:</strong> ${dateStr}</li>
                    </ul>
                </div>
                
                <p>Tim / Supir kami akan segera menghubungi Anda jika belum ada kordinasi. Pastikan nomor HP/WhatsApp Anda (${bookingData.phone || bookingData.wa || '-'}) aktif.</p>
                <p>Persiapkan barang bawaan Anda dan sampai jumpa besok!</p>
                <br />
                <p style="font-size: 0.85rem; color: #94a3b8; text-align: center;">Travel Lombok Airport Team</p>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Reminder email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending reminder email:', error);
    }
};

module.exports = {
    sendStatusChangeEmail,
    sendReminderEmail
};
