const pool = require('../config/database');

// Create order (checkout)
const createOrder = async (req, res) => {
  try {
    const { vehicle_ids } = req.body;

    if (!vehicle_ids || vehicle_ids.length === 0) {
      return res.status(400).json({ message: 'No vehicles selected for purchase' });
    }

    const orders = [];

    for (const vehicle_id of vehicle_ids) {
      // Get vehicle details
      const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);

      if (vehicleResult.rows.length === 0) {
        continue;
      }

      const vehicle = vehicleResult.rows[0];

      // Create order
      const orderResult = await pool.query(`
        INSERT INTO orders (user_id, vehicle_id, status, total_price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [req.user.id, vehicle_id, 'pending', vehicle.price]);

      orders.push(orderResult.rows[0]);

      // Remove from cart
      await pool.query(
        'DELETE FROM cart WHERE user_id = $1 AND vehicle_id = $2',
        [req.user.id, vehicle_id]
      );

      // Create activity log
      await pool.query(
        'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
        [req.user.id, `User placed order for vehicle: ${vehicle.name}`]
      );

      // Create notification for admin
      await pool.query(
        'INSERT INTO notifications (message) VALUES ($1)',
        [`New order received for ${vehicle.name}`]
      );
    }

    res.status(201).json({
      message: 'Order(s) placed successfully',
      orders
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, v.name as vehicle_name, v.brand, v.type,
             COALESCE(json_agg(
               json_build_object('id', vi.id, 'image_path', vi.image_path)
             ) FILTER (WHERE vi.id IS NOT NULL), '[]') as images
      FROM orders o
      JOIN vehicles v ON o.vehicle_id = v.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE o.user_id = $1
      GROUP BY o.id, v.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email,
             v.name as vehicle_name, v.brand, v.type,
             COALESCE(json_agg(
               json_build_object('id', vi.id, 'image_path', vi.image_path)
             ) FILTER (WHERE vi.id IS NOT NULL), '[]') as images
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN vehicles v ON o.vehicle_id = v.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      GROUP BY o.id, u.id, v.id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create activity log
    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Admin updated order #${id} status to ${status}`]
    );

    // Create notification for user
    await pool.query(
      'INSERT INTO notifications (message) VALUES ($1)',
      [`Order #${id} status updated to ${status}`]
    );

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
};
