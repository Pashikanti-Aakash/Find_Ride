const Favorite = require('../models/Favorite');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.getByUser(req.user.id);
    res.json(favorites);
  } catch (error) {
    console.error('Get Favorites Error:', error.message);
    res.status(500).json({ message: 'Internal server error retrieving wishlist.' });
  }
};

// @desc    Toggle vehicle favorite state
// @route   POST /api/favorites/:vehicleId
// @access  Private
const toggleFavorite = async (req, res) => {
  const { vehicleId } = req.params;
  const userId = req.user.id;

  try {
    const isFav = await Favorite.isFavorited(userId, vehicleId);
    if (isFav) {
      await Favorite.remove(userId, vehicleId);
      res.json({ favorited: false, message: 'Removed from favorites.' });
    } else {
      await Favorite.add(userId, vehicleId);
      res.json({ favorited: true, message: 'Added to favorites.' });
    }
  } catch (error) {
    console.error('Toggle Favorite Error:', error.message);
    res.status(500).json({ message: 'Internal server error toggling wishlist item.' });
  }
};

// @desc    Check if a vehicle is favorited
// @route   GET /api/favorites/check/:vehicleId
// @access  Private
const checkFavoriteStatus = async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const isFav = await Favorite.isFavorited(req.user.id, vehicleId);
    res.json({ isFavorited: isFav });
  } catch (error) {
    console.error('Check Favorite Status Error:', error.message);
    res.status(500).json({ message: 'Internal server error checking wishlist status.' });
  }
};

module.exports = {
  getFavorites,
  toggleFavorite,
  checkFavoriteStatus
};
