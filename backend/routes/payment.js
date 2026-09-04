const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// ==========================================
// API Keys & Config
// ==========================================
// 1. Borderpay (For QRIS)
const BORDERPAY_API_KEY = process.env.BORDERPAY_API_KEY || 'bp_test_placeholder_key';
const BORDERPAY_WEBHOOK_TOKEN = process.env.BORDERPAY_WEBHOOK_TOKEN || ''; // Verification token dari dashboard Borderpay
const BORDERPAY_BASE_URL = 'https://borderpay.id/api/v1';

// 2. Instanpay (For Crypto - kept as fallback for now)
const INSTANPAY_API_KEY = process.env.INSTANPAY_API_KEY || 'sk_live_22sy38ydvpzhe5su';
const INSTANPAY_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_B43404FEC16A0221C5A0A0DCB9727C2CA0B6DC16A24BE560';
const INSTANPAY_BASE_URL = 'https://instanpay.net/api/v1';

// Verify Webhook Signature (Generic HMAC SHA256)
function verifyWebhookSignature(payload, signature, secret) {
    if (!signature || !secret) return false;
    
    // Create a copy and remove _signature if it exists inside payload
    const { _signature, ...data } = payload;
    const bodyStr = JSON.stringify(data);
    
    const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(bodyStr)
        .digest('base64'); // Note: Adjust to 'hex' if Borderpay uses hex
        
    return signature === expectedSig || signature === `sha256=${expectedSig}`;
}

// ==========================================
// 1. QRIS Payment (via Borderpay)
// ==========================================
router.post('/qris', async (req, res) => {
    try {
        const { amount, customer_name, reference_id } = req.body;
        
        const borderpayPayload = {
            amount: parseInt(amount),
            method: 'QRIS',
            reference_id: reference_id || `TRX-${Date.now()}`,
            customer_name: customer_name || 'Travel Lombok Customer'
        };

        const response = await axios.post(`${BORDERPAY_BASE_URL}/transactions`, borderpayPayload, {
            headers: {
                'Authorization': `Bearer ${BORDERPAY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Borderpay QRIS Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Gagal membuat pembayaran QRIS via Borderpay', details: error.response?.data });
    }
});

router.get('/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const response = await axios.get(`${BORDERPAY_BASE_URL}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${BORDERPAY_API_KEY}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Borderpay Status Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Gagal mengecek status pembayaran' });
    }
});

// ==========================================
// 2. Crypto Payment (via Instanpay)
// ==========================================
router.post('/crypto', async (req, res) => {
    try {
        const { amount_usd, chain, token, customer_name, customer_email } = req.body;
        
        const response = await axios.post(`${INSTANPAY_BASE_URL}/crypto-payments`, {
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
        const { id } = req.params; 
        const response = await axios.get(`${INSTANPAY_BASE_URL}/crypto-status/${id}`, {
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
// 3. Webhook (Borderpay QRIS & Instanpay Crypto)
// ==========================================
router.post('/webhook', (req, res) => {
    const payload = req.body;
    
    // --- BORDERPAY QRIS WEBHOOK ---
    // Verifikasi menggunakan simple token header (metode resmi Borderpay)
    if (req.headers['x-borderpay-token']) {
        const token = req.headers['x-borderpay-token'];
        if (token !== BORDERPAY_WEBHOOK_TOKEN) {
            console.warn('⚠️ Borderpay Webhook Token tidak valid!');
            return res.status(401).json({ error: 'Invalid Borderpay token' });
        }
        
        console.log(`✅ [WEBHOOK BORDERPAY] QRIS PAID: Rp ${payload.amount} | ID: ${payload.reference_id || payload.id}`);
        // TODO: Update database status pesanan berdasarkan reference_id

    } else if (payload.type === 'CRYPTO' || req.headers['x-api-key']) {
        // --- INSTANPAY CRYPTO WEBHOOK ---
        const signature = req.headers['x-signature'] || payload._signature;
        const isValid = verifyWebhookSignature(payload, signature, INSTANPAY_WEBHOOK_SECRET);
        if (!isValid) return res.status(401).json({ error: 'Invalid Instanpay signature' });
        
        console.log(`✅ [WEBHOOK INSTANPAY] Crypto PAID: $${payload.amount_usd} ${payload.token} on ${payload.chain}`);
        // TODO: Update database status pesanan berdasarkan transactionId

    } else {
        console.warn('⚠️ Webhook tidak dikenali, tidak ada header provider yang valid.');
        return res.status(400).json({ error: 'Unknown webhook provider' });
    }

    res.status(200).json({ success: true });
});

module.exports = router;

