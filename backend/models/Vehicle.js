const db = require('../config/db');

class Vehicle {
  // @desc Create a complete vehicle listing (transactional across 6 tables)
  static async create({
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
  }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert vehicle core record (starts as pending)
      const [vResult] = await connection.query(
        'INSERT INTO vehicles (brand_id, name, type, body_type, status, description) VALUES (?, ?, ?, ?, ?, ?)',
        [brandId, name, type, bodyType, 'pending', description || null]
      );
      const vehicleId = vResult.insertId;

      // 2. Insert variants
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await connection.query(
            `INSERT INTO vehicle_variants (
              vehicle_id, name, price, transmission, engine_capacity, 
              power, torque, mileage, fuel_type, seating_capacity, 
              fuel_tank_capacity, ground_clearance, seat_height, weight, warranty
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              vehicleId,
              variant.name,
              variant.price,
              variant.transmission || 'manual',
              variant.engineCapacity || null,
              variant.power || null,
              variant.torque || null,
              variant.mileage || null,
              variant.fuelType,
              variant.seatingCapacity || 5,
              variant.fuelTankCapacity || null,
              variant.groundClearance || null,
              variant.seatHeight || null,
              variant.weight || null,
              variant.warranty || null
            ]
          );
        }
      }

      // 3. Insert colors
      if (colors && colors.length > 0) {
        for (const color of colors) {
          await connection.query(
            'INSERT INTO vehicle_colors (vehicle_id, color_name, color_code, image_url) VALUES (?, ?, ?, ?)',
            [vehicleId, color.color_name, color.color_code, color.image_url || null]
          );
        }
      }

      // 4. Insert images
      if (images && images.length > 0) {
        for (const img of images) {
          await connection.query(
            'INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)',
            [vehicleId, img.image_url, img.is_primary ? 1 : 0]
          );
        }
      }

      // 5. Insert specifications
      if (specifications && specifications.length > 0) {
        for (const spec of specifications) {
          await connection.query(
            'INSERT INTO vehicle_specifications (vehicle_id, category, spec_key, spec_value) VALUES (?, ?, ?, ?)',
            [vehicleId, spec.category, spec.spec_key, spec.spec_value]
          );
        }
      }

      // 6. Insert features
      if (features && features.length > 0) {
        for (const feat of features) {
          await connection.query(
            'INSERT INTO vehicle_features (vehicle_id, feature_name, is_standard) VALUES (?, ?, ?)',
            [vehicleId, feat.feature_name, feat.is_standard ? 1 : 0]
          );
        }
      }

      await connection.commit();
      connection.release();
      return vehicleId;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // @desc Find all vehicles for a specific brand (with price ranges and image counts)
  static async findAllByBrand(brandId) {
    const [rows] = await db.query(
      `SELECT v.*, 
              (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = 1 LIMIT 1) as primary_image,
              MIN(vv.price) as min_price, 
              MAX(vv.price) as max_price, 
              COUNT(DISTINCT vv.id) as variants_count,
              COUNT(DISTINCT vc.id) as colors_count
       FROM vehicles v 
       LEFT JOIN vehicle_variants vv ON v.id = vv.vehicle_id 
       LEFT JOIN vehicle_colors vc ON v.id = vc.vehicle_id
       WHERE v.brand_id = ? 
       GROUP BY v.id 
       ORDER BY v.created_at DESC`,
      [brandId]
    );
    return rows;
  }

  // @desc Get complete details of a vehicle by ID (aggregate details in one structure)
  static async findById(id) {
    const [vRows] = await db.query(
      `SELECT v.*, b.name as brand_name, b.logo_url as brand_logo 
       FROM vehicles v 
       JOIN brands b ON v.brand_id = b.id 
       WHERE v.id = ?`,
      [id]
    );

    const vehicle = vRows[0];
    if (!vehicle) return null;

    // Fetch related components
    const [variants] = await db.query('SELECT * FROM vehicle_variants WHERE vehicle_id = ? ORDER BY price ASC', [id]);
    const [colors] = await db.query('SELECT * FROM vehicle_colors WHERE vehicle_id = ?', [id]);
    const [images] = await db.query('SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC', [id]);
    const [specs] = await db.query('SELECT * FROM vehicle_specifications WHERE vehicle_id = ?', [id]);
    const [feats] = await db.query('SELECT * FROM vehicle_features WHERE vehicle_id = ?', [id]);

    return {
      ...vehicle,
      variants,
      colors,
      images,
      specifications: specs,
      features: feats
    };
  }

  // @desc Update core vehicle details
  static async update(id, { name, type, bodyType, description }) {
    await db.query(
      'UPDATE vehicles SET name = ?, type = ?, body_type = ?, description = ? WHERE id = ?',
      [name, type, bodyType, description || null, id]
    );
    return this.findById(id);
  }

  // @desc Delete complete vehicle
  static async delete(id) {
    const [result] = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // @desc Add a new variant
  static async addVariant(vehicleId, variant) {
    const [result] = await db.query(
      `INSERT INTO vehicle_variants (
        vehicle_id, name, price, transmission, engine_capacity, 
        power, torque, mileage, fuel_type, seating_capacity, 
        fuel_tank_capacity, ground_clearance, seat_height, weight, warranty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicleId,
        variant.name,
        variant.price,
        variant.transmission || 'manual',
        variant.engineCapacity || null,
        variant.power || null,
        variant.torque || null,
        variant.mileage || null,
        variant.fuelType,
        variant.seatingCapacity || 5,
        variant.fuelTankCapacity || null,
        variant.groundClearance || null,
        variant.seatHeight || null,
        variant.weight || null,
        variant.warranty || null
      ]
    );
    return result.insertId;
  }

  // @desc Update variant specifications & log price changes
  static async updateVariant(variantId, variant) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Retrieve previous price
      const [prevRows] = await connection.query(
        'SELECT price FROM vehicle_variants WHERE id = ?',
        [variantId]
      );

      if (prevRows.length === 0) {
        connection.release();
        return null;
      }

      const oldPrice = parseFloat(prevRows[0].price);
      const newPrice = parseFloat(variant.price);

      // Perform update
      await connection.query(
        `UPDATE vehicle_variants SET 
          name = ?, price = ?, transmission = ?, engine_capacity = ?, 
          power = ?, torque = ?, mileage = ?, fuel_type = ?, seating_capacity = ?, 
          fuel_tank_capacity = ?, ground_clearance = ?, seat_height = ?, weight = ?, warranty = ?
         WHERE id = ?`,
        [
          variant.name,
          variant.price,
          variant.transmission || 'manual',
          variant.engineCapacity || null,
          variant.power || null,
          variant.torque || null,
          variant.mileage || null,
          variant.fuelType,
          variant.seatingCapacity || 5,
          variant.fuelTankCapacity || null,
          variant.groundClearance || null,
          variant.seatHeight || null,
          variant.weight || null,
          variant.warranty || null,
          variantId
        ]
      );

      // If price changed, write to price history
      if (oldPrice !== newPrice) {
        await connection.query(
          'INSERT INTO price_history (variant_id, old_price, new_price) VALUES (?, ?, ?)',
          [variantId, oldPrice, newPrice]
        );
      }

      await connection.commit();
      connection.release();
      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // @desc Delete a variant
  static async deleteVariant(variantId) {
    const [result] = await db.query('DELETE FROM vehicle_variants WHERE id = ?', [variantId]);
    return result.affectedRows > 0;
  }

  // @desc Add a new color swatch
  static async addColor(vehicleId, { color_name, color_code, image_url }) {
    const [result] = await db.query(
      'INSERT INTO vehicle_colors (vehicle_id, color_name, color_code, image_url) VALUES (?, ?, ?, ?)',
      [vehicleId, color_name, color_code, image_url || null]
    );
    return result.insertId;
  }

  // @desc Delete a color swatch
  static async deleteColor(colorId) {
    const [result] = await db.query('DELETE FROM vehicle_colors WHERE id = ?', [colorId]);
    return result.affectedRows > 0;
  }

  // @desc Get pending vehicles for admin review
  static async getPendingVehicles() {
    const [rows] = await db.query(
      `SELECT v.*, b.name as brand_name,
              (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = 1 LIMIT 1) as primary_image,
              MIN(vv.price) as min_price, 
              MAX(vv.price) as max_price
       FROM vehicles v 
       JOIN brands b ON v.brand_id = b.id 
       LEFT JOIN vehicle_variants vv ON v.id = vv.vehicle_id 
       WHERE v.status = 'pending' 
       GROUP BY v.id 
       ORDER BY v.created_at ASC`
    );
    return rows;
  }

  // @desc Update vehicle status (e.g. approved / rejected)
  static async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE vehicles SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  // @desc Find all approved vehicles with optional filters for type, brand, and search
  static async findApproved({ type, brandId, search }) {
    let sql = `
      SELECT v.*, b.name as brand_name, b.logo_url as brand_logo,
             (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = 1 LIMIT 1) as primary_image,
             MIN(vv.price) as min_price, 
             MAX(vv.price) as max_price
      FROM vehicles v
      JOIN brands b ON v.brand_id = b.id
      LEFT JOIN vehicle_variants vv ON v.id = vv.vehicle_id
      WHERE v.status = 'approved'
    `;
    const params = [];

    if (type) {
      sql += ' AND v.type = ?';
      params.push(type);
    }

    if (brandId) {
      sql += ' AND v.brand_id = ?';
      params.push(brandId);
    }

    if (search) {
      sql += ' AND (v.name LIKE ? OR b.name LIKE ? OR v.body_type LIKE ?)';
      const searchWild = '%' + search + '%';
      params.push(searchWild, searchWild, searchWild);
    }

    sql += ' GROUP BY v.id ORDER BY v.created_at DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = Vehicle;
