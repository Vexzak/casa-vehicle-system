const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  uploadVehicleImages,
  updateVehicle,
  deleteVehicle,
  getBrands,
  upload,
} = require('../controllers/vehicleController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// ── Public routes ──────────────────────────────────────────────────────────
router.get('/',        getAllVehicles);
router.get('/brands',  getBrands);
router.get('/:id',     getVehicleById);

// ── Admin routes ───────────────────────────────────────────────────────────
router.post('/',                authenticateToken, isAdmin, createVehicle);
router.put('/:id',              authenticateToken, isAdmin, updateVehicle);
router.delete('/:id',           authenticateToken, isAdmin, deleteVehicle);

// ── Image upload route (the missing one!) ──────────────────────────────────
router.post('/:id/images',      authenticateToken, isAdmin, upload.array('images', 10), uploadVehicleImages);

module.exports = router;