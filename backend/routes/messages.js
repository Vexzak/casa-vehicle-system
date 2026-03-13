const express = require('express');
const router  = express.Router();
const {
  sendMessage,
  getUserMessages,
  getAllMessages,
  replyToMessage,
  markAsRead,
  getUnreadCount,
} = require('../controllers/messageController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// User routes
router.post('/',           authenticateToken,           sendMessage);
router.get('/user',        authenticateToken,           getUserMessages);

// Admin routes
router.get('/all',         authenticateToken, isAdmin,  getAllMessages);
router.get('/unread-count',authenticateToken, isAdmin,  getUnreadCount);
router.put('/:id/reply',   authenticateToken, isAdmin,  replyToMessage);
router.put('/:id/read',    authenticateToken, isAdmin,  markAsRead);

module.exports = router;