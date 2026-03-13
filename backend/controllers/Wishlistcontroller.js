const pool = require('../config/database');

// ─── Get user's wishlist ─────────────────────────────────────────────────────
const getWishlist = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        w.id,
        w.vehicle_id,
        w.selected_color,
        w.created_at,
        json_build_object(
          'id',                  v.id,
          'name',                v.name,
          'type',                v.type,
          'brand',               v.brand,
          'year',                v.year,
          'price',               v.price,
          'description',         v.description,
          'location',            v.location,
          'availability_status', v.availability_status,
          'features',            v.features,
          'colors',              v.colors,
          'color_variants',      v.color_variants,
          'images',              COALESCE((
            SELECT json_agg(
              json_build_object('id', vi.id, 'image_path', vi.image_path, 'color', vi.color)
            )
            FROM vehicle_images vi
            WHERE vi.vehicle_id = v.id
          ), '[]'::json)
        ) AS vehicle
      FROM wishlist w
      JOIN vehicles v ON v.id = w.vehicle_id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Add to wishlist ─────────────────────────────────────────────────────────
const addToWishlist = async (req, res) => {
  try {
    const { vehicle_id, selected_color } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ message: 'vehicle_id is required' });
    }

    // Check vehicle exists
    const vehicle = await pool.query('SELECT id FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check already wishlisted
    const existing = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND vehicle_id = $2',
      [req.user.id, vehicle_id]
    );
    if (existing.rows.length > 0) {
      // Update the selected color if already wishlisted
      const updated = await pool.query(
        'UPDATE wishlist SET selected_color = $1 WHERE user_id = $2 AND vehicle_id = $3 RETURNING *',
        [selected_color ? JSON.stringify(selected_color) : null, req.user.id, vehicle_id]
      );
      return res.json({ message: 'Wishlist updated', wishlist: updated.rows[0] });
    }

    const result = await pool.query(
      'INSERT INTO wishlist (user_id, vehicle_id, selected_color) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, vehicle_id, selected_color ? JSON.stringify(selected_color) : null]
    );

    res.status(201).json({ message: 'Added to wishlist', wishlist: result.rows[0] });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Remove from wishlist ────────────────────────────────────────────────────
const removeFromWishlist = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND vehicle_id = $2 RETURNING id',
      [req.user.id, vehicle_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Check if a vehicle is wishlisted ───────────────────────────────────────
const checkWishlist = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const result = await pool.query(
      'SELECT id, selected_color FROM wishlist WHERE user_id = $1 AND vehicle_id = $2',
      [req.user.id, vehicle_id]
    );
    res.json({
      wishlisted: result.rows.length > 0,
      selected_color: result.rows[0]?.selected_color || null,
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };