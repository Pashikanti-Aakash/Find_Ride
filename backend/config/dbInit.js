const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initializeDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  let connection;
  try {
    // 1. Connect without database to ensure it exists
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to MySQL server for initialization...');

    const dbName = process.env.DB_NAME || 'findride_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" checked/created.`);

    // 2. Select database
    await connection.query(`USE \`${dbName}\`;`);

    // 3. Read and execute db_init.sql
    const sqlPath = path.join(__dirname, '../db_init.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlScript = fs.readFileSync(sqlPath, 'utf8');
      
      // Clean comments and execute individual statements to be safe,
      // or since we enabled multipleStatements, execute the whole file!
      await connection.query(sqlScript);
      console.log('Database tables verified/created successfully.');
    } else {
      console.warn('db_init.sql script not found. Skipping table generation.');
    }

    // 4. Seed default admin if not exists
    const [adminRows] = await connection.query(
      'SELECT * FROM users WHERE role = ? LIMIT 1',
      ['admin']
    );

    if (adminRows.length === 0) {
      const adminUsername = 'admin';
      const adminEmail = 'admin@findride.com';
      const adminPassword = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      await connection.query(
        'INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        [adminUsername, adminEmail, passwordHash, 'admin', 'active']
      );
      console.log('----------------------------------------------------');
      console.log('Seeded default admin user:');
      console.log(`  Username: ${adminUsername}`);
      console.log(`  Email:    ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log('----------------------------------------------------');
    }

    // 5. Seed default brands if none exist
    const [brandRows] = await connection.query('SELECT COUNT(*) as count FROM brands');
    if (brandRows[0].count === 0) {
      const defaultBrands = [
        ['Toyota', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg', 'Japanese multinational automotive manufacturer.'],
        ['Honda', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg', 'Japanese public multinational conglomerate manufacturer of automobiles and motorcycles.'],
        ['Tesla', 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png', 'American electric vehicle and clean energy company.'],
        ['Yamaha', 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Yamaha_Motor_Logo.svg', 'Japanese manufacturer of motorcycles, marine products, and other motorized products.']
      ];

      for (const brand of defaultBrands) {
        await connection.query(
          'INSERT INTO brands (name, logo_url, description) VALUES (?, ?, ?)',
          brand
        );
      }
      console.log('Seeded default brands (Toyota, Honda, Tesla, Yamaha).');
    }

  } catch (error) {
    console.error('Error during database initialization:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database initialization connection closed.');
    }
  }
}

module.exports = initializeDatabase;
