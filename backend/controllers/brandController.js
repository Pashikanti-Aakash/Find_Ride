const Brand = require('../models/Brand');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json(brands);
  } catch (error) {
    console.error('Get Brands Error:', error.message);
    res.status(500).json({ message: 'Internal server retrieving brands error.' });
  }
};

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private (Admin)
const createBrand = async (req, res) => {
  const { name, description, manufacturerId } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Brand name is required.' });
  }

  try {
    // Check conflicts
    const existing = await Brand.findByName(name.trim());
    if (existing) {
      return res.status(400).json({ message: `Brand "${name}" already exists.` });
    }

    // Logo resolution: check file upload, then body url, then default null
    let logoUrl = null;
    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.logoUrl) {
      logoUrl = req.body.logoUrl;
    }

    const brandId = await Brand.create({
      name: name.trim(),
      logoUrl,
      description: description || null,
      manufacturerId: manufacturerId || null
    });

    const newBrand = await Brand.findById(brandId);
    res.status(201).json({
      message: 'Brand created successfully.',
      brand: newBrand
    });
  } catch (error) {
    console.error('Create Brand Error:', error.message);
    res.status(500).json({ message: 'Internal server brand creation error.' });
  }
};

// @desc    Update an existing brand
// @route   PUT /api/brands/:id
// @access  Private (Admin)
const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, description, manufacturerId } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Brand name is required.' });
  }

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    // Name conflict check (different ID)
    const existing = await Brand.findByName(name.trim());
    if (existing && existing.id !== parseInt(id)) {
      return res.status(400).json({ message: `Brand "${name}" already taken by another brand.` });
    }

    let logoUrl = brand.logo_url;
    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.logoUrl !== undefined) {
      logoUrl = req.body.logoUrl || null;
    }

    const updated = await Brand.update(id, {
      name: name.trim(),
      logoUrl,
      description: description || null,
      manufacturerId: manufacturerId || null
    });

    res.json({
      message: 'Brand updated successfully.',
      brand: updated
    });
  } catch (error) {
    console.error('Update Brand Error:', error.message);
    res.status(500).json({ message: 'Internal server brand update error.' });
  }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private (Admin)
const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    await Brand.delete(id);
    res.json({ message: 'Brand deleted successfully.' });
  } catch (error) {
    console.error('Delete Brand Error:', error.message);
    res.status(500).json({ message: 'Internal server brand deletion error.' });
  }
};

module.exports = {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
};
