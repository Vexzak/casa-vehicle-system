const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
  createReservation,
  getUserReservations,
  getReservationById,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
  expireReservations
} = require('../controllers/reservationController');

// ── User routes (authenticated) ────────────────────────────────────────────

// POST   /api/reservations          — reserve a vehicle
router.post('/', authenticateToken, createReservation);

// GET    /api/reservations/my        — get current user's reservations
router.get('/my', authenticateToken, getUserReservations);

// GET    /api/reservations/:id       — get a single reservation (own or admin)
router.get('/:id', authenticateToken, getReservationById);

// PATCH  /api/reservations/:id/cancel — cancel a reservation (own or admin)
router.patch('/:id/cancel', authenticateToken, cancelReservation);

// ── Admin routes ───────────────────────────────────────────────────────────

// GET    /api/reservations           — get ALL reservations (admin)
router.get('/', authenticateToken, isAdmin, getAllReservations);

// PATCH  /api/reservations/:id/status — update status: completed/expired/cancelled (admin)
router.patch('/:id/status', authenticateToken, isAdmin, updateReservationStatus);

// POST   /api/reservations/expire    — trigger expiry check (admin or cron)
router.post('/expire', authenticateToken, isAdmin, expireReservations);

module.exports = router;