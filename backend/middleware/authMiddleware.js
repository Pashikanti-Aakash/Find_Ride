const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findride_super_jwt_secret_key_2026_x!');

      // Get user from database, verify status
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User matching token no longer exists.' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Your account is disabled. Contact support.' });
      }

      // Attach user to req object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource.`
      });
    }
    next();
  };
};

// Ensure manufacturer is approved
const isApprovedManufacturer = async (req, res, next) => {
  if (req.user.role !== 'manufacturer') {
    return next(); // If not a manufacturer, this guard doesn't apply directly here (role guards handle it)
  }

  try {
    const manufacturer = await User.findManufacturerByUserId(req.user.id);
    if (!manufacturer) {
      return res.status(403).json({ message: 'Manufacturer registration details not found.' });
    }

    if (manufacturer.status !== 'approved') {
      return res.status(403).json({
        message: `Manufacturer portal access denied. Current registration status: ${manufacturer.status}.`
      });
    }

    // Attach manufacturer details to request
    req.manufacturer = manufacturer;
    next();
  } catch (error) {
    console.error('Manufacturer Check Error:', error.message);
    res.status(500).json({ message: 'Internal server validation error.' });
  }
};

module.exports = {
  protect,
  restrictTo,
  isApprovedManufacturer
};
