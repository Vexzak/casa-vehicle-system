const pool = require('../config/database');

// ─── Create a reservation ───────────────────────────────────────────────────
const createReservation = async (req, res) => {
  const { vehicle_id, selected_color } = req.body;
  const user_id = req.user.id;

  try {
    const vehicleResult = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1',
      [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const vehicle = vehicleResult.rows[0];

    // ── Allow 'available' or 'reserved' — but not 'sold' ──
    if (vehicle.availability_status === 'sold') {
      return res.status(400).json({ message: 'Vehicle is not available for reservation.' });
    }

    // ── If reserved, only allow if the selected color still has stock ──
    if (vehicle.availability_status === 'reserved') {
      if (!selected_color || !selected_color.name) {
        return res.status(400).json({ message: 'Vehicle is not available for reservation.' });
      }
      const colors = Array.isArray(vehicle.colors) ? vehicle.colors : [];
      const selectedColorEntry = colors.find(c => c.name === selected_color.name);
      const selectedColorHasStock = selectedColorEntry && (parseInt(selectedColorEntry.stock, 10) || 0) > 0;
      if (!selectedColorHasStock) {
        return res.status(400).json({ message: 'Vehicle is not available for reservation.' });
      }
    }

    // ── Check if selected color is out of stock ──
    if (selected_color && selected_color.name) {
      const colors = Array.isArray(vehicle.colors) ? vehicle.colors : [];
      const colorEntry = colors.find(c => c.name === selected_color.name);
      if (colorEntry && parseInt(colorEntry.stock, 10) === 0) {
        return res.status(400).json({ message: `${selected_color.name} is currently out of stock.` });
      }
    }

    // ── Duplicate reservation check (per-color, not per-vehicle) ──
    if (selected_color && selected_color.name) {
      // Only block if the same user already reserved this exact color on this vehicle
      const existing = await pool.query(
        `SELECT * FROM reservations
         WHERE user_id = $1 AND vehicle_id = $2 AND status = 'active'
         AND selected_color->>'name' = $3`,
        [user_id, vehicle_id, selected_color.name]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: `You already have an active reservation for ${selected_color.name}.` });
      }
    } else {
      // No color selected — only block if user already has a no-color reservation for this vehicle
      const existing = await pool.query(
        `SELECT * FROM reservations
         WHERE user_id = $1 AND vehicle_id = $2 AND status = 'active'
         AND selected_color IS NULL`,
        [user_id, vehicle_id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: 'You already have an active reservation for this vehicle.' });
      }
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 10);

    // ── INSERT — uses expires_at to match SELECT queries ──
    await pool.query(
      `INSERT INTO reservations (user_id, vehicle_id, selected_color, expires_at, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [
        user_id,
        vehicle_id,
        selected_color ? JSON.stringify(selected_color) : null,
        expiry,
      ]
    );

    // ── Decrement the selected color's stock in the colors JSONB array ──
    if (selected_color && selected_color.name) {
      await pool.query(
        `UPDATE vehicles
         SET colors = (
           SELECT jsonb_agg(
             CASE
               WHEN (elem->>'name') = $1
               THEN jsonb_set(
                 elem,
                 '{stock}',
                 to_jsonb(GREATEST(0, (COALESCE(elem->>'stock', '1'))::int - 1))
               )
               ELSE elem
             END
           )
           FROM jsonb_array_elements(
             CASE WHEN jsonb_typeof(colors) = 'array' THEN colors ELSE '[]'::jsonb END
           ) AS elem
         )
         WHERE id = $2`,
        [selected_color.name, vehicle_id]
      );
    }

    // ── Only mark vehicle as 'reserved' if ALL color stock is now 0 ──
    const updatedVehicle = await pool.query('SELECT colors, stock FROM vehicles WHERE id = $1', [vehicle_id]);
    const updatedColors = updatedVehicle.rows[0]?.colors || [];
    const totalStock = Array.isArray(updatedColors)
      ? updatedColors.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0)
      : (updatedVehicle.rows[0]?.stock || 0);

    if (totalStock === 0) {
      await pool.query(
        `UPDATE vehicles SET availability_status = 'reserved' WHERE id = $1`,
        [vehicle_id]
      );
    } else {
      // Keep it available if stock still remains
      await pool.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1 AND availability_status != 'sold'`,
        [vehicle_id]
      );
    }

    return res.status(201).json({ message: 'Reservation created successfully.' });

  } catch (error) {
    console.error('Reservation error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── Get logged-in user's reservations ─────────────────────────────────────
const getUserReservations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.*,
        json_build_object(
          'id',                  v.id,
          'name',                v.name,
          'brand',               v.brand,
          'type',                v.type,
          'year',                v.year,
          'price',               v.price,
          'location',            v.location,
          'stock',               v.stock,
          'availability_status', v.availability_status,
          'images', COALESCE(json_agg(
            json_build_object('id', vi.id, 'image_path', vi.image_path, 'color', vi.color)
          ) FILTER (WHERE vi.id IS NOT NULL), '[]')
        ) AS vehicle,
        EXTRACT(DAY FROM (r.expires_at - NOW())) AS days_remaining
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE r.user_id = $1
      GROUP BY r.id, v.id
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get user reservations error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Get single reservation by ID ──────────────────────────────────────────
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        r.*,
        json_build_object(
          'id',                  v.id,
          'name',                v.name,
          'brand',               v.brand,
          'type',                v.type,
          'year',                v.year,
          'price',               v.price,
          'location',            v.location,
          'stock',               v.stock,
          'availability_status', v.availability_status,
          'images', COALESCE(json_agg(
            json_build_object('id', vi.id, 'image_path', vi.image_path, 'color', vi.color)
          ) FILTER (WHERE vi.id IS NOT NULL), '[]')
        ) AS vehicle,
        json_build_object(
          'id',    u.id,
          'name',  u.name,
          'email', u.email
        ) AS user,
        EXTRACT(DAY FROM (r.expires_at - NOW())) AS days_remaining
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE r.id = $1
      GROUP BY r.id, v.id, u.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = result.rows[0];

    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Cancel a reservation — restores stock ──────────────────────────────────
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancel_reason, cancel_note } = req.body;

    const reservationResult = await pool.query(
      'SELECT * FROM reservations WHERE id = $1',
      [id]
    );

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];

    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (reservation.status !== 'active') {
      return res.status(400).json({ message: `Reservation is already ${reservation.status}` });
    }

    await pool.query(
      "UPDATE reservations SET status = 'cancelled', cancel_reason = $1, cancel_note = $2 WHERE id = $3",
      [cancel_reason || null, cancel_note || null, id]
    );

    // ── Restore stock ────────────────────────────────────────────────────────
    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [reservation.vehicle_id]);
    if (vehicleResult.rows.length > 0) {
      const vehicle = vehicleResult.rows[0];
      const newStock = (vehicle.stock || 0) + 1;

      let updatedColors = Array.isArray(vehicle.colors)
        ? vehicle.colors
        : (typeof vehicle.colors === 'string' ? JSON.parse(vehicle.colors) : []);

      const resColor = reservation.selected_color
        ? (typeof reservation.selected_color === 'string'
            ? JSON.parse(reservation.selected_color)
            : reservation.selected_color)
        : null;

      if (resColor && resColor.name && updatedColors.length > 0) {
        updatedColors = updatedColors.map(c =>
          c.name === resColor.name
            ? { ...c, stock: (parseInt(c.stock, 10) || 0) + 1 }
            : c
        );
      }

      const newStatus = newStock > 0 && vehicle.availability_status !== 'sold'
        ? 'available'
        : vehicle.availability_status;

      await pool.query(
        `UPDATE vehicles SET stock = $1, availability_status = $2, colors = $3, color_variants = $3 WHERE id = $4`,
        [newStock, newStatus, JSON.stringify(updatedColors), reservation.vehicle_id]
      );
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Reservation #${id} cancelled for vehicle #${reservation.vehicle_id}`]
    );

    res.json({ message: 'Reservation cancelled successfully. Vehicle stock has been restored.' });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Get ALL reservations (Admin only) ─────────────────────────────────────
const getAllReservations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.*,
        json_build_object(
          'id',                  v.id,
          'name',                v.name,
          'brand',               v.brand,
          'type',                v.type,
          'year',                v.year,
          'price',               v.price,
          'location',            v.location,
          'stock',               v.stock,
          'availability_status', v.availability_status,
          'images', COALESCE(json_agg(
            json_build_object('id', vi.id, 'image_path', vi.image_path, 'color', vi.color)
          ) FILTER (WHERE vi.id IS NOT NULL), '[]')
        ) AS vehicle,
        json_build_object(
          'id',    u.id,
          'name',  u.name,
          'email', u.email
        ) AS user,
        EXTRACT(DAY FROM (r.expires_at - NOW())) AS days_remaining
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      GROUP BY r.id, u.id, v.id
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Update reservation status (Admin only) ────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'completed', 'cancelled', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const reservationResult = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];
    const wasActive = reservation.status === 'active';

    const result = await pool.query(
      'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [reservation.vehicle_id]);
    if (vehicleResult.rows.length > 0) {
      const vehicle = vehicleResult.rows[0];

      let newStock = vehicle.stock;
      let newVehicleStatus = vehicle.availability_status;

      let updatedColors = Array.isArray(vehicle.colors)
        ? vehicle.colors
        : (typeof vehicle.colors === 'string' ? JSON.parse(vehicle.colors) : []);

      const resColor = reservation.selected_color
        ? (typeof reservation.selected_color === 'string'
            ? JSON.parse(reservation.selected_color)
            : reservation.selected_color)
        : null;

      if ((status === 'cancelled' || status === 'expired') && wasActive) {
        newStock = (vehicle.stock || 0) + 1;
        newVehicleStatus = newStock > 0 ? 'available' : 'reserved';

        if (resColor && resColor.name && updatedColors.length > 0) {
          updatedColors = updatedColors.map(c =>
            c.name === resColor.name
              ? { ...c, stock: (parseInt(c.stock, 10) || 0) + 1 }
              : c
          );
        }
      } else if (status === 'completed') {
        newVehicleStatus = newStock <= 0 ? 'sold' : 'available';
      } else if (status === 'active' && !wasActive) {
        newStock = Math.max(0, (vehicle.stock || 0) - 1);
        newVehicleStatus = newStock <= 0 ? 'reserved' : 'available';

        if (resColor && resColor.name && updatedColors.length > 0) {
          updatedColors = updatedColors.map(c =>
            c.name === resColor.name
              ? { ...c, stock: Math.max(0, (parseInt(c.stock, 10) || 1) - 1) }
              : c
          );
        }
      }

      await pool.query(
        `UPDATE vehicles SET stock = $1, availability_status = $2, colors = $3, color_variants = $3 WHERE id = $4`,
        [newStock, newVehicleStatus, JSON.stringify(updatedColors), reservation.vehicle_id]
      );
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Admin updated reservation #${id} to status: ${status}`]
    );

    await pool.query(
      'INSERT INTO notifications (message) VALUES ($1)',
      [`Your reservation #${id} has been updated to: ${status}`]
    );

    res.json({
      message: 'Reservation status updated successfully',
      reservation: result.rows[0]
    });
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Auto-expire reservations — restores stock ──────────────────────────────
const expireReservations = async (req, res) => {
  try {
    const expiredResult = await pool.query(`
      SELECT * FROM reservations
      WHERE status = 'active' AND expires_at < NOW()
    `);

    const expired = expiredResult.rows;

    if (expired.length === 0) {
      return res.json({ message: 'No reservations to expire', count: 0 });
    }

    for (const reservation of expired) {
      await pool.query(
        "UPDATE reservations SET status = 'expired' WHERE id = $1",
        [reservation.id]
      );

      const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [reservation.vehicle_id]);
      if (vehicleResult.rows.length > 0) {
        const vehicle = vehicleResult.rows[0];
        const newStock = (vehicle.stock || 0) + 1;

        let updatedColors = Array.isArray(vehicle.colors)
          ? vehicle.colors
          : (typeof vehicle.colors === 'string' ? JSON.parse(vehicle.colors) : []);

        const resColor = reservation.selected_color
          ? (typeof reservation.selected_color === 'string'
              ? JSON.parse(reservation.selected_color)
              : reservation.selected_color)
          : null;

        if (resColor && resColor.name && updatedColors.length > 0) {
          updatedColors = updatedColors.map(c =>
            c.name === resColor.name
              ? { ...c, stock: (parseInt(c.stock, 10) || 0) + 1 }
              : c
          );
        }

        const newStatus = newStock > 0 ? 'available' : 'reserved';

        await pool.query(
          `UPDATE vehicles SET stock = $1, availability_status = $2, colors = $3, color_variants = $3 WHERE id = $4`,
          [newStock, newStatus, JSON.stringify(updatedColors), reservation.vehicle_id]
        );
      }

      await pool.query(
        'INSERT INTO notifications (message) VALUES ($1)',
        [`Your reservation #${reservation.id} has expired. The vehicle is now available again.`]
      );
    }

    console.log(`⏰ Expired ${expired.length} reservation(s), stock restored`);

    res.json({
      message: `${expired.length} reservation(s) expired and stock restored`,
      count: expired.length,
      expired_ids: expired.map(r => r.id)
    });
  } catch (error) {
    console.error('Expire reservations error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  getReservationById,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
  expireReservations
};