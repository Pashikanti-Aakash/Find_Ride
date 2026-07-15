const express = require('express');
const router = express.Router();
const { 
  getFavorites, 
  toggleFavorite, 
  checkFavoriteStatus 
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes with user authentication protection
router.use(protect);

router.get('/', getFavorites);
router.post('/:vehicleId', toggleFavorite);
router.get('/check/:vehicleId', checkFavoriteStatus);

module.exports = router;
