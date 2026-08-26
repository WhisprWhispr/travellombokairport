import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import Routes
import apiRoutes from './functions/api/routes/api.js';
import bookingsRoutes from './functions/api/routes/bookings.js';
import paymentRoutes from './functions/api/routes/payment.js';
import authRoutes from './functions/api/routes/auth.js';
import driversRoutes from './functions/api/routes/drivers.js';
import aiRoutes from './functions/api/routes/ai.js';
import promosRoutes from './functions/api/routes/promos.js';
import blogsRoutes from './functions/api/routes/blogs.js';

const app = new Hono().basePath('/api');

// Global Middleware
app.use('*', cors());

// Base Route
app.get('/', (c) => c.text('Travel Lombok Airport API is running (Cloudflare Worker)'));

// Mount Routes
app.route('/items', apiRoutes);
app.route('/stats', apiRoutes); 
app.route('/gallery', apiRoutes);
app.route('/withdrawals', apiRoutes);

// For cleanly mounting the rest
app.route('/bookings', bookingsRoutes);
app.route('/payment', paymentRoutes);
app.route('/auth', authRoutes);
app.route('/drivers', driversRoutes);
app.route('/ai', aiRoutes);
app.route('/promos', promosRoutes);
app.route('/blogs', blogsRoutes);

// For fallback in api.js
app.route('/', apiRoutes);

export default app;
