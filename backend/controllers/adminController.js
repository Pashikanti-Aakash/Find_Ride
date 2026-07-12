const db = require('../config/db');
const Brand = require('../models/Brand');

// @desc    Get all manufacturers with their registration details
// @route   GET /api/admin/manufacturers
// @access  Private (Admin)
const getManufacturers = async (req, res) => {
  const { status } = req.query;

  try {
    let query = `
      SELECT m.*, u.username, u.email, u.status as user_status 
      FROM manufacturers m 
      JOIN users u ON m.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE m.status = ?';
      params.push(status);
    }

    query += ' ORDER BY m.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get Manufacturers Error:', error.message);
    res.status(500).json({ message: 'Internal server retrieving manufacturers error.' });
  }
};

// @desc    Approve or reject a manufacturer registration
// @route   PUT /api/admin/manufacturers/:id/status
// @access  Private (Admin)
const updateManufacturerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Valid status ("approved" or "rejected") is required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verify manufacturer exists
    const [mRows] = await connection.query(
      'SELECT * FROM manufacturers WHERE id = ?',
      [id]
    );

    if (mRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Manufacturer registration details not found.' });
    }

    const manufacturer = mRows[0];

    // 2. Update registration status
    await connection.query(
      'UPDATE manufacturers SET status = ? WHERE id = ?',
      [status, id]
    );

    // 3. Link/Create Brand on approval
    if (status === 'approved') {
      const brandName = manufacturer.brand_name;
      
      // Look up if brand name exists (case-insensitive check)
      const [brandRows] = await connection.query(
        'SELECT id FROM brands WHERE LOWER(name) = LOWER(?)',
        [brandName]
      );

      if (brandRows.length > 0) {
        // Link to existing brand
        await connection.query(
          'UPDATE brands SET manufacturer_id = ? WHERE id = ?',
          [id, brandRows[0].id]
        );
      } else {
        // Create brand shell
        await connection.query(
          'INSERT INTO brands (name, manufacturer_id) VALUES (?, ?)',
          [brandName, id]
        );
      }
    }

    // 4. Create Notification for the manufacturer user
    const notificationMessage = status === 'approved' 
      ? `Congratulations! Your brand partner registration for "${manufacturer.brand_name}" has been approved. You can now access the partner portal.`
      : `Unfortunately, your brand partner registration request for "${manufacturer.brand_name}" was rejected. Please contact administration for details.`;

    await connection.query(
      'INSERT INTO notifications (user_id, message, type, related_id) VALUES (?, ?, ?, ?)',
      [manufacturer.user_id, notificationMessage, 'approval', id]
    );

    await connection.commit();
    connection.release();

    res.json({
      message: `Manufacturer registration status updated to: ${status}.`,
      manufacturerId: id,
      status
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Update Manufacturer Status Error:', error.message);
    res.status(500).json({ message: 'Internal server status update error.' });
  }
};

// @desc    Get dashboard counters
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const [userCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [brandCount] = await db.query('SELECT COUNT(*) as count FROM brands');
    const [mCount] = await db.query('SELECT COUNT(*) as count FROM manufacturers');
    const [pendingMCount] = await db.query("SELECT COUNT(*) as count FROM manufacturers WHERE status = 'pending'");
    const [vehicleCount] = await db.query('SELECT COUNT(*) as count FROM vehicles');

    res.json({
      totalUsers: userCount[0].count,
      totalBrands: brandCount[0].count,
      totalManufacturers: mCount[0].count,
      pendingManufacturers: pendingMCount[0].count,
      totalVehicles: vehicleCount[0].count
    });
  } catch (error) {
    console.error('Get Stats Error:', error.message);
    res.status(500).json({ message: 'Internal server retrieving stats error.' });
  }
};

module.exports = {
  getManufacturers,
  updateManufacturerStatus,
  getAdminStats
};
