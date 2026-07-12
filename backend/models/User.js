const db = require('../config/db');

class User {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, username, email, role, status, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ username, email, passwordHash, role = 'user', status = 'active' }) {
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, role, status]
    );
    return result.insertId;
  }

  static async createManufacturer({ userId, brandName, companyName, registrationNumber }) {
    const [result] = await db.query(
      'INSERT INTO manufacturers (user_id, brand_name, company_name, registration_number, status) VALUES (?, ?, ?, ?, ?)',
      [userId, brandName, companyName, registrationNumber, 'pending']
    );
    return result.insertId;
  }

  static async findManufacturerByUserId(userId) {
    const [rows] = await db.query(
      'SELECT m.*, u.username, u.email, u.status as user_status FROM manufacturers m JOIN users u ON m.user_id = u.id WHERE m.user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  static async findManufacturerById(id) {
    const [rows] = await db.query(
      'SELECT m.*, u.username, u.email, u.status as user_status FROM manufacturers m JOIN users u ON m.user_id = u.id WHERE m.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async updateProfile(userId, { username, email }) {
    await db.query(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, userId]
    );
    return this.findById(userId);
  }

  static async updatePassword(userId, newPasswordHash) {
    const [result] = await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
