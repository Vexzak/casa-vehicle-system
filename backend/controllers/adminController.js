const pool = require('../config/database');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Total vehicles
    const vehiclesResult = await pool.query('SELECT COUNT(*) FROM vehicles');
    const totalVehicles = parseInt(vehiclesResult.rows[0].count);

    // Total users
    const usersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Total orders
    const ordersResult = await pool.query('SELECT COUNT(*) FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);

    // Pending orders
    const pendingOrdersResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
    const pendingOrders = parseInt(pendingOrdersResult.rows[0].count);

    // Unread notifications
    const notificationsResult = await pool.query('SELECT COUNT(*) FROM notifications WHERE is_read = FALSE');
    const unreadNotifications = parseInt(notificationsResult.rows[0].count);

    // Recent activity
    const activityResult = await pool.query(`
      SELECT al.*, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    res.json({
      totalVehicles,
      totalUsers,
      totalOrders,
      pendingOrders,
      unreadNotifications,
      recentActivity: activityResult.rows
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM notifications
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getActivityLogs,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
