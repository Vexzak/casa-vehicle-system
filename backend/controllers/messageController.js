const pool = require('../config/database');

// ── Send message (User → Admin) ────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    // VehicleDetails sends: { vehicle_id, subject, content }
    // We store everything in the `message` column for simplicity
    const { vehicle_id, message, subject, content } = req.body;
    const body = message || content || subject || '';

    if (!body.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    const result = await pool.query(
      `INSERT INTO messages (user_id, vehicle_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, vehicle_id || null, body.trim()]
    );

    // Vehicle name for logs / notifications
    let vehicleName = 'a vehicle';
    if (vehicle_id) {
      const vRes = await pool.query('SELECT name FROM vehicles WHERE id = $1', [vehicle_id]);
      if (vRes.rows.length) vehicleName = vRes.rows[0].name;
    }

    // Activity log
    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `User sent message about ${vehicleName}`]
    ).catch(() => {}); // non-fatal

    // Admin notification
    await pool.query(
      'INSERT INTO notifications (message) VALUES ($1)',
      [`New message received about ${vehicleName}`]
    ).catch(() => {}); // non-fatal

    res.status(201).json({
      message: 'Message sent successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get messages for logged-in user ───────────────────────────────────────
const getUserMessages = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*,
              v.name  AS vehicle_name,
              v.brand AS vehicle_brand
       FROM   messages m
       LEFT JOIN vehicles v ON m.vehicle_id = v.id
       WHERE  m.user_id = $1
       ORDER  BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get ALL messages (Admin only) ─────────────────────────────────────────
const getAllMessages = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*,
              u.name  AS user_name,
              u.email AS user_email,
              v.name  AS vehicle_name,
              v.brand AS vehicle_brand
       FROM   messages m
       JOIN   users    u ON m.user_id    = u.id
       LEFT JOIN vehicles v ON m.vehicle_id = v.id
       ORDER  BY m.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Reply to a message (Admin only) ───────────────────────────────────────
const replyToMessage = async (req, res) => {
  try {
    const { id }    = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply cannot be empty.' });
    }

    const result = await pool.query(
      `UPDATE messages
       SET reply = $1, is_read = TRUE, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [reply.trim(), id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    // Activity log
    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Admin replied to message #${id}`]
    ).catch(() => {});

    res.json({ message: 'Reply sent successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Mark message as read (Admin only) ────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE messages SET is_read = TRUE, updated_at = NOW() WHERE id = $1',
      [id]
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Unread count (Admin only) ─────────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE is_read = FALSE'
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getUserMessages,
  getAllMessages,
  replyToMessage,
  markAsRead,
  getUnreadCount,
};