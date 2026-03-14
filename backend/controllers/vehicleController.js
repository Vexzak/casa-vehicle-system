const pool = require('../config/database');
const { upload } = require('../config/cloudinary');

// ─── Helper: safely parse JSON fields sent as strings ───────────────────────
const parseJSON = (val, fallback = []) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

// ─── Helper: derive overall availability_status from stock ──────────────────
const statusFromStock = (stock, currentStatus) => {
  if (stock > 0 && currentStatus !== 'sold') return 'available';
  if (stock === 0 && currentStatus === 'available') return 'reserved';
  return currentStatus;
};

// ─── Get all vehicles (with filters, search, reservation status) ────────────
const getAllVehicles = async (req, res) => {
  try {
    const { search, type, brand, minYear, maxYear, minPrice, maxPrice } = req.query;

    let query = `
      SELECT v.*,
             COALESCE(json_agg(
               json_build_object('id', vi.id, 'image_path', vi.image_path, 'color', vi.color)
             ) FILTER (WHERE vi.id IS NOT NULL), '[]') AS images
      FROM vehicles v
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (LOWER(v.name) LIKE $${paramCount} OR LOWER(v.brand) LIKE $${paramCount})`;
      params.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }
    if (type)     { query += ` AND v.type = $${paramCount}`;  params.push(type);     paramCount++; }
    if (brand)    { query += ` AND v.brand = $${paramCount}`; params.push(brand);    paramCount++; }
    if (minYear)  { query += ` AND v.year >= $${paramCount}`; params.push(minYear);  paramCount++; }
    if (maxYear)  { query += ` AND v.year <= $${paramCount}`; params.push(maxYear);  paramCount++; }
    if (minPrice) { query += ` AND v.price >= $${paramCount}`;params.push(minPrice); paramCount++; }
    if (maxPrice) { query += ` AND v.price <= $${paramCount}`;params.push(maxPrice); paramCount++; }

    query += ` GROUP BY v.id ORDER BY v.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get vehicle by ID ──────────────────────────────────────────────────────
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT v.*,
             COALESCE(json_agg(
               json_build_object('id', vi.id, 'image_path', vi.image_path, 'color', vi.color)
             ) FILTER (WHERE vi.id IS NOT NULL), '[]') AS images
      FROM vehicles v
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE v.id = $1
      GROUP BY v.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    let activeReservation = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const resResult = await pool.query(
          "SELECT * FROM reservations WHERE user_id = $1 AND vehicle_id = $2 AND status = 'active'",
          [decoded.id, id]
        );
        if (resResult.rows.length > 0) activeReservation = resResult.rows[0];
      } catch (_) {}
    }

    res.json({ ...result.rows[0], activeReservation });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Create vehicle (Admin only) ────────────────────────────────────────────
const createVehicle = async (req, res) => {
  try {
    const {
      name, type, brand, year, price, description,
      location, latitude, longitude, images,
      features, colors, color_variants,
      stock,
    } = req.body;

    const featuresVal      = JSON.stringify(parseJSON(features, []));
    const parsedColors     = parseJSON(colors, []);
    const colorsVal        = JSON.stringify(parsedColors);
    const colorVariantsVal = JSON.stringify(parseJSON(color_variants || colors, []));

    const totalStock = stock != null
      ? parseInt(stock, 10)
      : parsedColors.length > 0
        ? parsedColors.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 1), 0)
        : 1;

    const result = await pool.query(`
      INSERT INTO vehicles
        (name, type, brand, year, price, description,
         location, latitude, longitude,
         features, colors, color_variants, stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      name, type, brand, year, price, description,
      location, latitude || null, longitude || null,
      featuresVal, colorsVal, colorVariantsVal,
      totalStock,
    ]);

    const vehicle = result.rows[0];

    if (images && images.length > 0) {
      for (const imagePath of images) {
        await pool.query(
          'INSERT INTO vehicle_images (vehicle_id, image_path) VALUES ($1, $2)',
          [vehicle.id, imagePath]
        );
      }
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Admin added vehicle: ${name} (stock: ${totalStock})`]
    );

    res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Upload images for a vehicle (Admin only) ───────────────────────────────
const uploadVehicleImages = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await pool.query('SELECT id FROM vehicles WHERE id = $1', [id]);
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const imageColors = {};
    Object.keys(req.body).forEach(key => {
      const match = key.match(/^image_color_(\d+)$/);
      if (match) {
        imageColors[parseInt(match[1])] = parseJSON(req.body[key], null);
      }
    });

    if (req.body.colors) {
      const newColors = parseJSON(req.body.colors, []);
      if (newColors.length > 0) {
        const totalStock = newColors.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 1), 0);
        await pool.query(
          `UPDATE vehicles
           SET colors = $1, color_variants = $1, stock = $2
           WHERE id = $3`,
          [JSON.stringify(newColors), totalStock, id]
        );
      }
    }

    const inserted = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imagePath = file.path;  // ← Cloudinary URL
      const colorData = imageColors[i] ? JSON.stringify(imageColors[i]) : null;

      const result = await pool.query(
        'INSERT INTO vehicle_images (vehicle_id, image_path, color) VALUES ($1, $2, $3) RETURNING *',
        [id, imagePath, colorData]
      );
      inserted.push(result.rows[0]);
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Admin uploaded ${inserted.length} image(s) for vehicle ID: ${id}`]
    );

    res.status(201).json({ message: 'Images uploaded successfully', images: inserted });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Update vehicle (Admin only) ────────────────────────────────────────────
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, type, brand, year, price, description,
      location, latitude, longitude, availability_status,
      features, colors, color_variants,
      stock,
    } = req.body;

    if (availability_status === 'reserved') {
      const activeRes = await pool.query(
        "SELECT id FROM reservations WHERE vehicle_id = $1 AND status = 'active'",
        [id]
      );
      if (activeRes.rows.length === 0) {
        return res.status(400).json({
          message: "Cannot set status to 'reserved' — no active reservation exists for this vehicle"
        });
      }
    }

    const featuresVal  = JSON.stringify(parseJSON(features, []));
    const parsedColors = parseJSON(colors, []);
    const colorsVal    = JSON.stringify(parsedColors);
    const colorVariantsVal = JSON.stringify(parseJSON(color_variants || colors, []));

    const totalStock = stock != null
      ? parseInt(stock, 10)
      : parsedColors.length > 0
        ? parsedColors.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 1), 0)
        : undefined;

    let stockClause = '';
    const params = [
      name, type, brand, year, price,
      description, location, latitude || null, longitude || null,
      availability_status,
      featuresVal, colorsVal, colorVariantsVal,
    ];

    if (totalStock !== undefined) {
      stockClause = `, stock = $${params.length + 1}`;
      params.push(totalStock);
    }

    params.push(id);

    const result = await pool.query(`
      UPDATE vehicles
      SET name = $1, type = $2, brand = $3, year = $4, price = $5,
          description = $6, location = $7, latitude = $8, longitude = $9,
          availability_status = $10,
          features = $11, colors = $12, color_variants = $13
          ${stockClause}
      WHERE id = $${params.length}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Admin updated vehicle: ${name}`]
    );

    res.json({ message: 'Vehicle updated successfully', vehicle: result.rows[0] });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Delete vehicle (Admin only) ────────────────────────────────────────────
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const activeRes = await pool.query(
      "SELECT id FROM reservations WHERE vehicle_id = $1 AND status = 'active'",
      [id]
    );
    if (activeRes.rows.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete vehicle — it has an active reservation. Cancel the reservation first.'
      });
    }

    const vehicleResult = await pool.query('SELECT name FROM vehicles WHERE id = $1', [id]);
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const vehicleName = vehicleResult.rows[0].name;

    // No local file deletion needed — Cloudinary manages the files
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Admin deleted vehicle: ${vehicleName}`]
    );

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

// ─── Get all brands ──────────────────────────────────────────────────────────
const getBrands = async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT brand FROM vehicles ORDER BY brand');
    res.json(result.rows.map(row => row.brand));
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  uploadVehicleImages,
  updateVehicle,
  deleteVehicle,
  getBrands,
  upload,
};