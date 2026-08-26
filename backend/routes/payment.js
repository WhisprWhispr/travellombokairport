const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Get keys from environment variables or fallback to static for safety during transition
const INSTANPAY_API_KEY = process.env.INSTANPAY_API_KEY || 'sk_live_22sy38ydvpzhe5su';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_B43404FEC16A0221C5A0A0DCB9727C2CA0B6DC16A24BE560';
const BASE_URL = 'https://instanpay.net/api/v1';

// Verify Webhook Signature (from Instanpay Doc)
function verifyWebhookSignature(payload, signature, secret) {
    if (!signature || !secret) return false;
    
    // Create a copy and remove _signature
    const { _signature, ...data } = payload;
    const bodyStr = JSON.stringify(data);
    
    const expectedSig = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(bodyStr)
        .digest('base64');
        
    return signature === expectedSig;
}

// ==========================================
// 1. QRIS Payment
// ==========================================
router.post('/qris', async (req, res) => {
    try {
        const { amount, customer_name } = req.body;
        
        const response = await axios.post(`${BASE_URL}/payments`, {
            amount: parseInt(amount),
            customer_name: customer_name || 'Travel Lombok Customer'
        }, {
            headers: {
                'X-API-Key': INSTANPAY_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Instanpay QRIS Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Gagal membuat pembayaran QRIS' });
    }
});

router.get('/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const response = await axios.get(`${BASE_URL}/status/${transactionId}`, {
            headers: {
                'X-API-Key': INSTANPAY_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Instanpay Status Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Gagal mengecek status pembayaran' });
    }
});

// ==========================================
// 2. Crypto Payment
// ==========================================
router.post('/crypto', async (req, res) => {
    try {
        const { amount_usd, chain, token, customer_name, customer_email } = req.body;
        
        const response = await axios.post(`${BASE_URL}/crypto-payments`, {
            amount_usd: parseFloat(amount_usd),
            chain: chain || 'BSC',
            token: token || 'USDT',
            customer_name: customer_name || 'Travel Lombok Customer',
            customer_email: customer_email || ''
        }, {
            headers: {
                'X-API-Key': INSTANPAY_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Instanpay Crypto Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Gagal membuat pembayaran Crypto' });
    }
});

router.get('/crypto-status/:id', async (req, res) => {
    try {
        const { id } = req.params; // bisa transactionId lokal atau gatewayOrderId
        const response = await axios.get(`${BASE_URL}/crypto-status/${id}`, {
            headers: {
                'X-API-Key': INSTANPAY_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Instanpay Crypto Status Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Gagal mengecek status pembayaran Crypto' });
    }
});

// ==========================================
// 3. Webhook (QRIS & Crypto)
// ==========================================
router.post('/webhook', (req, res) => {
    const payload = req.body;
    
    // Verifikasi Signature
    const signature = payload._signature;
    const isValid = verifyWebhookSignature(payload, signature, WEBHOOK_SECRET);
    
    if (!isValid) {
        console.warn('⚠️ Webhook Signature tidak valid!');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    if (payload.type === 'CRYPTO') {
        // Handle pembayaran Crypto berhasil
        console.log(`✅ [WEBHOOK] Crypto PAID: $${payload.amount_usd} ${payload.token} on ${payload.chain}`);
        console.log(`ID: ${payload.transactionId} | Hash: ${payload.tx_hash}`);
        // TODO: Update database status pesanan berdasarkan transactionId
    } else {
        // Handle pembayaran QRIS berhasil
        console.log(`✅ [WEBHOOK] QRIS PAID: Rp ${payload.totalAmount} | ID: ${payload.transactionId}`);
        // TODO: Update database status pesanan berdasarkan transactionId
    }

    // Selalu respon dengan 200 OK agar Instanpay tahu webhook sudah diterima
    res.status(200).json({ success: true });
});

module.exports = router;
