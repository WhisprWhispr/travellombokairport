const express = require('express');
const router = express.Router();
const axios = require('axios');

const INSTANPAY_API_KEY = 'sk_live_22sy38ydvpzhe5su';
const BASE_URL = 'https://instanpay.net/api/v1';

// QRIS Payment
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

// Check Status
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

module.exports = router;
