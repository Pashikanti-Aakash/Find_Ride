const express = require('express');
const router = express.Router();
const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to view brands
router.get('/', getBrands);

// Admin-only routes for modifications
router.post('/', protect, restrictTo('admin'), upload.single('logo'), createBrand);
router.put('/:id', protect, restrictTo('admin'), upload.single('logo'), updateBrand);
router.delete('/:id', protect, restrictTo('admin'), deleteBrand);

module.exports = router;
