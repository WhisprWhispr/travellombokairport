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
const driversRoutes = require('./routes/drivers');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const promosRoutes = require('./routes/promos');
const blogsRoutes = require('./routes/blogs');
const analyticsRoutes = require('./routes/analytics');
app.use('/api', apiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/promos', promosRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Travel Lombok Airport API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
