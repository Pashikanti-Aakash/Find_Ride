const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  updatePassword
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUpdateProfile, updateMe);
router.put('/password', protect, updatePassword);

module.exports = router;
