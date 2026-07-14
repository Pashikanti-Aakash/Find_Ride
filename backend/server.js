const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const initializeDatabase = require('./config/dbInit');
const authRoutes = require('./routes/authRoutes');
const brandRoutes = require('./routes/brandRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Seed
initializeDatabase().then(() => {
  console.log('Database verification and initialization check complete.');
});

// Create uploads directory if it does not exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created "uploads" directory.');
}

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in dev, can lock down in prod
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom request logger for debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} - Params: ${JSON.stringify(req.params)} - Body: ${JSON.stringify(req.body)}`);
  next();
});

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Find Ride backend is running successfully.' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
