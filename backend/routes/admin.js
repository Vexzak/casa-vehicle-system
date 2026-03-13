const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getActivityLogs,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, isAdmin, getDashboardStats);
router.get('/users', authenticateToken, isAdmin, getAllUsers);
router.get('/activity-logs', authenticateToken, isAdmin, getActivityLogs);
router.get('/notifications', authenticateToken, isAdmin, getNotifications);
router.put('/notifications/:id/read', authenticateToken, isAdmin, markNotificationAsRead);
router.put('/notifications/read-all', authenticateToken, isAdmin, markAllNotificationsAsRead);

module.exports = router;
