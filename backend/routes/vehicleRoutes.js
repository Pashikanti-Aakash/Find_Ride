const express = require('express');
const router = express.Router();
const {
  createVehicle,
  getManufacturerVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  addVariant,
  updateVariant,
  deleteVariant,
  addColor,
  deleteColor,
  getPendingVehicles,
  updateVehicleStatus
} = require('../controllers/vehicleController');
const { protect, restrictTo, isApprovedManufacturer } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to retrieve vehicle specs
router.get('/:id', getVehicleById);

// Admin-only review endpoints
router.get('/admin/pending', protect, restrictTo('admin'), getPendingVehicles);
router.put('/admin/:id/status', protect, restrictTo('admin'), updateVehicleStatus);

// Brand Manufacturer endpoints (secured by approval status check)
router.use(protect);
router.use(restrictTo('manufacturer'));
router.use(isApprovedManufacturer);

router.post('/', upload.array('images', 5), createVehicle);
router.get('/manufacturer/list', getManufacturerVehicles); // Avoid conflict with /:id
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Variants Management
router.post('/:id/variants', addVariant);
router.put('/:id/variants/:variantId', updateVariant);
router.delete('/:id/variants/:variantId', deleteVariant);

// Colors Swatch Management
router.post('/:id/colors', upload.single('colorImage'), addColor);
router.delete('/:id/colors/:colorId', deleteColor);

module.exports = router;
