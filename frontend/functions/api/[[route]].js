import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';

// Import Routes
import apiRoutes from './routes/api.js';
import bookingsRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payment.js';
import authRoutes from './routes/auth.js';
import driversRoutes from './routes/drivers.js';
import aiRoutes from './routes/ai.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';

const app = new Hono().basePath('/api');

// Global Middleware
app.use('*', cors());

// Base Route
app.get('/', (c) => c.text('Travel Lombok Airport API is running (Cloudflare Serverless)'));

// Mount Routes
app.route('/items', apiRoutes);
app.route('/stats', apiRoutes); // apiRoutes handles /items, /stats, /gallery, /withdrawals
app.route('/gallery', apiRoutes);
app.route('/withdrawals', apiRoutes);
app.route('/reviews', apiRoutes);

// For cleanly mounting the rest
app.route('/bookings', bookingsRoutes);
app.route('/payment', paymentRoutes);
app.route('/auth', authRoutes);
app.route('/drivers', driversRoutes);
app.route('/ai', aiRoutes);
app.route('/analytics', analyticsRoutes);
app.route('/', uploadRoutes);

// For fallback in api.js
app.route('/', apiRoutes);

export const onRequest = handle(app);

