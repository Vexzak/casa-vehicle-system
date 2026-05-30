const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, createOrder);
router.get('/user', authenticateToken, getUserOrders);
router.get('/all', authenticateToken, isAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, isAdmin, updateOrderStatus);

module.exports = router;
