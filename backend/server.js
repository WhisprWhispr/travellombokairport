require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const apiRoutes = require('./routes/api');
const paymentRoutes = require('./routes/payment');
const bookingsRoutes = require('./routes/bookings');
app.use('/api', apiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingsRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Travel Lombok Airport API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
