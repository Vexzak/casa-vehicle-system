const pool = require('../config/database');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id as cart_id, v.*,
             COALESCE(json_agg(
               json_build_object('id', vi.id, 'image_path', vi.image_path)
             ) FILTER (WHERE vi.id IS NOT NULL), '[]') as images
      FROM cart c
      JOIN vehicles v ON c.vehicle_id = v.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE c.user_id = $1
      GROUP BY c.id, v.id
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    // Check if vehicle exists
    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if already in cart
    const existingCart = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND vehicle_id = $2',
      [req.user.id, vehicle_id]
    );

    if (existingCart.rows.length > 0) {
      return res.status(400).json({ message: 'Vehicle already in cart' });
    }

    // Add to cart
    await pool.query(
      'INSERT INTO cart (user_id, vehicle_id) VALUES ($1, $2)',
      [req.user.id, vehicle_id]
    );

    // Create activity log
    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `User added vehicle to cart: ${vehicleResult.rows[0].name}`]
    );

    res.status(201).json({ message: 'Vehicle added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
