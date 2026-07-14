const Vehicle = require('../models/Vehicle');
const db = require('../config/db');

// Reusable helper to verify if the manufacturer owns this vehicle
const verifyVehicleOwnership = async (vehicleId, manufacturerId) => {
  const [rows] = await db.query(
    `SELECT v.id FROM vehicles v 
     JOIN brands b ON v.brand_id = b.id 
     WHERE v.id = ? AND b.manufacturer_id = ?`,
    [vehicleId, manufacturerId]
  );
  return rows.length > 0;
};

// @desc    Create a new vehicle listing
// @route   POST /api/vehicles
// @access  Private (Manufacturer)
const createVehicle = async (req, res) => {
  const { name, type, bodyType, description } = req.body;
  const manufacturerId = req.manufacturer.id;

  try {
    // 1. Get the brand linked to this manufacturer
    const [brandRows] = await db.query(
      'SELECT id FROM brands WHERE manufacturer_id = ? LIMIT 1',
      [manufacturerId]
    );

    if (brandRows.length === 0) {
      return res.status(400).json({ 
        message: 'No active brand configuration found linked to your manufacturer account.' 
      });
    }
    const brandId = brandRows[0].id;

    // 2. Parse JSON fields from multipart body
    const variants = req.body.variants ? JSON.parse(req.body.variants) : [];
    const colors = req.body.colors ? JSON.parse(req.body.colors) : [];
    const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : [];
    const features = req.body.features ? JSON.parse(req.body.features) : [];

    // 3. Map uploaded image files from Multer
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        images.push({
          image_url: `/uploads/${file.filename}`,
          is_primary: index === 0 ? 1 : 0
        });
      });
    }

    if (variants.length === 0) {
      return res.status(400).json({ message: 'At least one variant configuration is required.' });
    }

    // 4. Create vehicle transactional sequence
    const vehicleId = await Vehicle.create({
      brandId,
      name,
      type,
      bodyType,
      description,
      variants,
      colors,
      images,
      specifications,
      features
    });

    res.status(201).json({
      message: 'Vehicle listing uploaded successfully. Pending administrator approval.',
      vehicleId
    });
  } catch (error) {
    console.error('Create Vehicle Error:', error.message);
    res.status(500).json({ message: 'Internal server vehicle upload error.' });
  }
};

// @desc    Get all vehicles for the logged-in brand
// @route   GET /api/vehicles/manufacturer
// @access  Private (Manufacturer)
const getManufacturerVehicles = async (req, res) => {
  const manufacturerId = req.manufacturer.id;

  try {
    const [brandRows] = await db.query(
      'SELECT id FROM brands WHERE manufacturer_id = ? LIMIT 1',
      [manufacturerId]
    );

    if (brandRows.length === 0) {
      return res.json([]); // Return empty list if no brand is registered
    }

    const vehicles = await Vehicle.findAllByBrand(brandRows[0].id);
    res.json(vehicles);
  } catch (error) {
    console.error('Get Manufacturer Vehicles Error:', error.message);
    res.status(500).json({ message: 'Internal server catalog retrieve error.' });
  }
};

// @desc    Get vehicle detail profile
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Get Vehicle Detail Error:', error.message);
    res.status(500).json({ message: 'Internal server specification retrieve error.' });
  }
};

// @desc    Update vehicle core details
// @route   PUT /api/vehicles/:id
// @access  Private (Manufacturer)
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { name, type, bodyType, description } = req.body;
  const manufacturerId = req.manufacturer.id;

  try {
    const isOwner = await verifyVehicleOwnership(id, manufacturerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this vehicle.' });
    }

    const updated = await Vehicle.update(id, { name, type, bodyType, description });
    res.json({
      message: 'Vehicle core details updated successfully.',
      vehicle: updated
    });
  } catch (error) {
    console.error('Update Vehicle Error:', error.message);
    res.status(500).json({ message: 'Internal server update error.' });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Manufacturer)
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  const manufacturerId = req.manufacturer.id;

  try {
    const isOwner = await verifyVehicleOwnership(id, manufacturerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this vehicle.' });
    }

    await Vehicle.delete(id);
    res.json({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    console.error('Delete Vehicle Error:', error.message);
    res.status(500).json({ message: 'Internal server deletion error.' });
  }
};

// @desc    Add a vehicle variant
// @route   POST /api/vehicles/:id/variants
// @access  Private (Manufacturer)
const addVariant = async (req, res) => {
  const { id } = req.params;
  const manufacturerId = req.manufacturer.id;

  try {
    const isOwner = await verifyVehicleOwnership(id, manufacturerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this vehicle.' });
    }

    const variantId = await Vehicle.addVariant(id, req.body);
    res.status(201).json({
      message: 'Variant added successfully.',
      variantId
    });
  } catch (error) {
    console.error('Add Variant Error:', error.message);
    res.status(500).json({ message: 'Internal server variant create error.' });
  }
};

// @desc    Update a vehicle variant details
// @route   PUT /api/vehicles/:id/variants/:variantId
// @access  Private (Manufacturer)
const updateVariant = async (req, res) => {
  const { id, variantId } = req.params;
  const manufacturerId = req.manufacturer.id;

  try {
    const isOwner = await verifyVehicleOwnership(id, manufacturerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this vehicle.' });
    }

    await Vehicle.updateVariant(variantId, req.body);
    res.json({ message: 'Variant specifications updated successfully.' });
  } catch (error) {
    console.error('Update Variant Error:', error.message);
    res.status(500).json({ message: 'Internal server variant update error.' });
  }
};

// @desc    Delete a variant
// @route   DELETE /api/vehicles/:id/variants/:variantId
// @access  Private (Manufacturer)
const deleteVariant = async (req, res) => {
  const { id, variantId } = req.params;
  const manufacturerId = req.manufacturer.id;

  try {
    const isOwner = await verifyVehicleOwnership(id, manufacturerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this vehicle.' });
    }

    // Protect delete: check if this is the last variant
    const [rows] = await db.query('SELECT COUNT(*) as count FROM vehicle_variants WHERE vehicle_id = ?', [id]);
    if (rows[0].count <= 1) {
      return res.status(400).json({ message: 'A vehicle must have at least one variant. Cannot delete.' });
    }

    await Vehicle.deleteVariant(variantId);
    res.json({ message: 'Variant deleted successfully.' });
  } catch (error) {
    console.error('Delete Variant Error:', error.message);
    res.status(500).json({ message: 'Internal server variant deletion error.' });
  }
};

// @desc    Add a paint color swatch
// @route   POST /api/vehicles/:id/colors
// @access  Private (Manufacturer)
const addColor = async (req, res) => {
  const { id } = req.params;
  const { color_name, color_code } = req.body;
  const manufacturerId = req.manufacturer.id;

  try {
    const isOwner = await verifyVehicleOwnership(id, manufacturerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this vehicle.' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const colorId = await Vehicle.addColor(id, { color_name, color_code, image_url });
    res.status(201).json({
      message: 'Color swatch added successfully.',
      colorId
    });
  } catch (error) {
    console.error('Add Color Error:', error.message);
    res.status(500).json({ message: 'Internal server color creation error.' });
  }
};

// @desc    Delete a color swatch
// @route   DELETE /api/vehicles/:id/colors/:colorId
// @access  Private (Manufacturer)
const deleteColor = async (req, res) => {
  const { id, colorId } = req.params;
  const manufacturerId = req.manufacturer.id;

  try {
    const isOwner = await verifyVehicleOwnership(id, manufacturerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this vehicle.' });
    }

    await Vehicle.deleteColor(colorId);
    res.json({ message: 'Color option deleted successfully.' });
  } catch (error) {
    console.error('Delete Color Error:', error.message);
    res.status(500).json({ message: 'Internal server color deletion error.' });
  }
};

// @desc    Get pending vehicle uploads for Admin approval
// @route   GET /api/vehicles/admin/pending
// @access  Private (Admin)
const getPendingVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getPendingVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Get Pending Vehicles Error:', error.message);
    res.status(500).json({ message: 'Internal server pending list retrieval error.' });
  }
};

// @desc    Approve or reject a vehicle listing
// @route   PUT /api/vehicles/admin/:id/status
// @access  Private (Admin)
const updateVehicleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Valid status ("approved" or "rejected") is required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verify vehicle exists and retrieve manufacturer details
    const [vRows] = await connection.query(
      `SELECT v.name, b.manufacturer_id, m.user_id 
       FROM vehicles v 
       JOIN brands b ON v.brand_id = b.id 
       JOIN manufacturers m ON b.manufacturer_id = m.id 
       WHERE v.id = ?`,
      [id]
    );

    if (vRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Vehicle listing not found.' });
    }

    const vehicleDetails = vRows[0];

    // 2. Update vehicle status
    await connection.query(
      'UPDATE vehicles SET status = ? WHERE id = ?',
      [status, id]
    );

    // 3. Send Notification to the Manufacturer user account
    const notificationMessage = status === 'approved'
      ? `Congratulations! Your vehicle listing "${vehicleDetails.name}" has been approved and is now active in the catalog.`
      : `Unfortunately, your vehicle listing "${vehicleDetails.name}" was rejected by our quality control administration.`;

    await connection.query(
      'INSERT INTO notifications (user_id, message, type, related_id) VALUES (?, ?, ?, ?)',
      [vehicleDetails.user_id, notificationMessage, 'approval', id]
    );

    await connection.commit();
    connection.release();

    res.json({
      message: `Vehicle listing status updated to: ${status}.`,
      vehicleId: id,
      status
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Update Vehicle Status Error:', error.message);
    res.status(500).json({ message: 'Internal server status update error.' });
  }
};

module.exports = {
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
};
