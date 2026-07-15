const db = require('../config/db');

class Favorite {
  // @desc Add a vehicle to user favorites
  static async add(userId, vehicleId) {
    try {
      await db.query(
        'INSERT IGNORE INTO favorites (user_id, vehicle_id) VALUES (?, ?)',
        [userId, vehicleId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // @desc Remove a vehicle from user favorites
  static async remove(userId, vehicleId) {
    try {
      const [result] = await db.query(
        'DELETE FROM favorites WHERE user_id = ? AND vehicle_id = ?',
        [userId, vehicleId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // @desc Retrieve all approved vehicles favorited by a user
  static async getByUser(userId) {
    try {
      const [rows] = await db.query(
        `SELECT v.*, b.name as brand_name, b.logo_url as brand_logo,
                (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = 1 LIMIT 1) as primary_image,
                MIN(vv.price) as min_price, 
                MAX(vv.price) as max_price
         FROM favorites f
         JOIN vehicles v ON f.vehicle_id = v.id
         JOIN brands b ON v.brand_id = b.id
         LEFT JOIN vehicle_variants vv ON v.id = vv.vehicle_id
         WHERE f.user_id = ? AND v.status = 'approved'
         GROUP BY v.id
         ORDER BY f.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // @desc Check if a vehicle is favorited by a user
  static async isFavorited(userId, vehicleId) {
    try {
      const [rows] = await db.query(
        'SELECT 1 FROM favorites WHERE user_id = ? AND vehicle_id = ? LIMIT 1',
        [userId, vehicleId]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Favorite;
