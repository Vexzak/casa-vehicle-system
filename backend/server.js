const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/vehicles',     require('./routes/vehicles'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/messages',     require('./routes/messages'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/wishlist',     require('./routes/wishlist'));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VeloMarket Vehicle Reservation API is running' });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ── Auto-expire reservations every hour ───────────────────────────────────
const { expireReservationsJob } = require('./jobs/expireReservations');

setInterval(async () => {
  try {
    await expireReservationsJob();
  } catch (err) {
    console.error('Auto-expire job error:', err);
  }
}, 60 * 60 * 1000);

expireReservationsJob().catch(err => console.error('Startup expiry check error:', err));

// ── Keep-alive ping (prevents Render free tier from sleeping) ──────────────
const BACKEND_URL = process.env.BACKEND_URL || 'https://essakmarket.onrender.com';

setInterval(async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    console.log(`Keep-alive ping: ${res.status}`);
  } catch (err) {
    console.error('Keep-alive ping failed:', err.message);
  }
}, 14 * 60 * 1000); // every 14 minutes

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://<your-laptop-ip>:${PORT}/api`);
  console.log(`⏰ Auto-expire job active (checks every 60 minutes)`);
  console.log(`🏓 Keep-alive ping active (every 14 minutes)`);
});