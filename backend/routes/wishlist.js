const express = require('express');
const router  = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.get('/',                    authenticateToken, getWishlist);
router.post('/',                   authenticateToken, addToWishlist);
router.delete('/:vehicle_id',      authenticateToken, removeFromWishlist);
router.get('/check/:vehicle_id',   authenticateToken, checkWishlist);

module.exports = router;