const db = require('../config/db');

class Brand {
  static async findAll() {
    const [rows] = await db.query(
      `SELECT b.*, m.company_name as manufacturer_company 
       FROM brands b 
       LEFT JOIN manufacturers m ON b.manufacturer_id = m.id
       ORDER BY b.name ASC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM brands WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByName(name) {
    const [rows] = await db.query('SELECT * FROM brands WHERE name = ?', [name]);
    return rows[0] || null;
  }

  static async create({ name, logoUrl = null, description = null, manufacturerId = null }) {
    const [result] = await db.query(
      'INSERT INTO brands (name, logo_url, description, manufacturer_id) VALUES (?, ?, ?, ?)',
      [name, logoUrl, description, manufacturerId]
    );
    return result.insertId;
  }

  static async update(id, { name, logoUrl, description, manufacturerId }) {
    await db.query(
      'UPDATE brands SET name = ?, logo_url = ?, description = ?, manufacturer_id = ? WHERE id = ?',
      [name, logoUrl, description, manufacturerId, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM brands WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async linkManufacturerToBrand(brandName, manufacturerId) {
    const existingBrand = await this.findByName(brandName);
    
    if (existingBrand) {
      // Link the approved manufacturer to the existing brand
      await db.query(
        'UPDATE brands SET manufacturer_id = ? WHERE id = ?',
        [manufacturerId, existingBrand.id]
      );
      return existingBrand.id;
    } else {
      // Create a brand shell matching their brand name automatically
      const [result] = await db.query(
        'INSERT INTO brands (name, manufacturer_id) VALUES (?, ?)',
        [brandName, manufacturerId]
      );
      return result.insertId;
    }
  }
}

module.exports = Brand;
