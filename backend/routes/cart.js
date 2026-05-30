const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getCart);
router.post('/add', authenticateToken, addToCart);
router.delete('/:id', authenticateToken, removeFromCart);
router.delete('/', authenticateToken, clearCart);

module.exports = router;
