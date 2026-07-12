const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'findride_super_jwt_secret_key_2026_x!',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user or manufacturer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  try {
    // 1. Check if user already exists
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. User role registration flow
    if (role === 'user') {
      const userId = await User.create({
        username,
        email,
        passwordHash,
        role: 'user',
        status: 'active'
      });

      const token = generateToken(userId);
      const user = await User.findById(userId);

      return res.status(201).json({
        message: 'Registration successful.',
        token,
        user
      });
    }

    // 4. Manufacturer role registration flow (Database Transaction)
    if (role === 'manufacturer') {
      const { brandName, companyName, registrationNumber } = req.body;
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Check if registration number already registered
        const [regRows] = await connection.query(
          'SELECT id FROM manufacturers WHERE registration_number = ?',
          [registrationNumber]
        );

        if (regRows.length > 0) {
          connection.release();
          return res.status(400).json({ message: 'Registration number is already registered.' });
        }

        // Insert into users (manufacturers start as active user status but pending manufacturer approval)
        const [userResult] = await connection.query(
          'INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
          [username, email, passwordHash, 'manufacturer', 'active']
        );
        const userId = userResult.insertId;

        // Insert into manufacturers
        await connection.query(
          'INSERT INTO manufacturers (user_id, brand_name, company_name, registration_number, status) VALUES (?, ?, ?, ?, ?)',
          [userId, brandName, companyName, registrationNumber, 'pending']
        );

        await connection.commit();
        connection.release();

        const token = generateToken(userId);
        const user = await User.findById(userId);

        return res.status(201).json({
          message: 'Manufacturer registration submitted. Account is pending approval by an administrator.',
          token,
          user,
          manufacturerDetails: {
            brandName,
            companyName,
            registrationNumber,
            status: 'pending'
          }
        });
      } catch (transactionError) {
        await connection.rollback();
        connection.release();
        throw transactionError;
      }
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Internal server registration error.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { loginIdentifier, password } = req.body;

  try {
    // Find user by username or email
    let user = null;
    if (loginIdentifier.includes('@')) {
      user = await User.findByEmail(loginIdentifier);
    } else {
      user = await User.findByUsername(loginIdentifier);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    // Compare password hashes
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = generateToken(user.id);

    // Get clean user data
    const cleanUser = await User.findById(user.id);
    let manufacturerDetails = null;

    if (cleanUser.role === 'manufacturer') {
      manufacturerDetails = await User.findManufacturerByUserId(cleanUser.id);
    }

    res.json({
      message: 'Login successful.',
      token,
      user: cleanUser,
      manufacturerDetails
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Internal server authentication error.' });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let manufacturerDetails = null;

    if (user.role === 'manufacturer') {
      manufacturerDetails = await User.findManufacturerByUserId(user.id);
    }

    res.json({
      user,
      manufacturerDetails
    });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ message: 'Internal server retrieve error.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateMe = async (req, res) => {
  const { username, email } = req.body;

  try {
    // Check if new username or email conflicts with other users
    const existingUsername = await User.findByUsername(username);
    if (existingUsername && existingUsername.id !== req.user.id) {
      return res.status(400).json({ message: 'Username is already taken by another user.' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail && existingEmail.id !== req.user.id) {
      return res.status(400).json({ message: 'Email address is already in use.' });
    }

    const updatedUser = await User.updateProfile(req.user.id, { username, email });
    res.json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ message: 'Internal server profile update error.' });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide both current and new passwords.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    // Get full user record (with password_hash)
    const rawUser = await User.findByUsername(req.user.username);
    
    const isMatch = await bcrypt.compare(currentPassword, rawUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await User.updatePassword(req.user.id, newPasswordHash);

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update Password Error:', error.message);
    res.status(500).json({ message: 'Internal server password update error.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  updatePassword
};
