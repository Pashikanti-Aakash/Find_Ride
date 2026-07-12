const express = require('express');
const router = express.Router();
const {
  getManufacturers,
  updateManufacturerStatus,
  getAdminStats
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Shield all admin routes with JWT and admin role guard
router.use(protect);
router.use(restrictTo('admin'));

router.get('/manufacturers', getManufacturers);
router.put('/manufacturers/:id/status', updateManufacturerStatus);
router.get('/stats', getAdminStats);

module.exports = router;
