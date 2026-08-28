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
const uploadRoutes = require('./routes/upload');
app.use('/api', apiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/promos', promosRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploads directory statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base route
app.get('/', (req, res) => {
    res.send('Travel Lombok Airport API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Setup H-1 Reminder Cron Job (Runs every day at 08:00 AM)
const cron = require('node-cron');
const { db } = require('./config/firebase');
const { sendReminderEmail } = require('./services/mailer');

cron.schedule('0 8 * * *', async () => {
    console.log('Running daily H-1 reminder check...');
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Format YYYY-MM-DD
        const tomorrowString = tomorrow.toISOString().split('T')[0]; 

        // Query bookings that are paid or confirmed
        const snapshot = await db.collection('bookings').where('status', 'in', ['PAID', 'CONFIRMED']).get();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            // Assuming startDate is stored as ISO string or YYYY-MM-DD
            if (data.startDate && data.startDate.startsWith(tomorrowString)) {
                sendReminderEmail({ id: doc.id, ...data });
            }
        });
    } catch (error) {
        console.error('Error running cron job for reminders:', error);
    }
});
