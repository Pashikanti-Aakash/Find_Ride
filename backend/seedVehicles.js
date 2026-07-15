const db = require('./config/db');

async function seed() {
  try {
    console.log('Seeding approved vehicles for Phase 4 verification...');

    // Clear old data to prevent duplicate primary keys
    await db.query('DELETE FROM price_history');
    await db.query('DELETE FROM vehicle_features');
    await db.query('DELETE FROM vehicle_specifications');
    await db.query('DELETE FROM vehicle_colors');
    await db.query('DELETE FROM vehicle_images');
    await db.query('DELETE FROM vehicle_variants');
    await db.query('DELETE FROM vehicles');

    // 1. Seed Toyota Camry
    const [camryResult] = await db.query(
      'INSERT INTO vehicles (brand_id, name, type, body_type, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [5, 'Camry Hybrid', 'car', 'Sedan', 'approved', 'A premium mid-size hybrid sedan offering excellent comfort and class-leading mileage.']
    );
    const camryId = camryResult.insertId;

    await db.query(
      `INSERT INTO vehicle_variants (vehicle_id, name, price, transmission, engine_capacity, power, torque, mileage, fuel_type, seating_capacity, warranty) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        camryId, 'Standard Hybrid', 4120000.00, 'automatic', 2487, '178 bhp @ 5700 rpm', '221 Nm @ 3600 rpm', 22.35, 'hybrid', 5, '3 years or 100,000 km',
        camryId, 'Luxury Hybrid', 4650000.00, 'automatic', 2487, '215 bhp @ 5700 rpm', '221 Nm @ 3600 rpm', 22.35, 'hybrid', 5, '3 years or 100,000 km'
      ]
    );

    await db.query(
      'INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)',
      [camryId, 'https://upload.wikimedia.org/wikipedia/commons/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg', 1]
    );

    await db.query(
      'INSERT INTO vehicle_colors (vehicle_id, color_name, color_code, image_url) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      [
        camryId, 'Platinum White', '#FFFFFF', 'https://upload.wikimedia.org/wikipedia/commons/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg',
        camryId, 'Attitude Black', '#111111', null
      ]
    );

    await db.query(
      `INSERT INTO vehicle_specifications (vehicle_id, category, spec_key, spec_value) VALUES 
       (?, 'Engine & Transmission', 'No. of Cylinders', '4'),
       (?, 'Dimensions & Weight', 'Overall Length', '4885 mm'),
       (?, 'Dimensions & Weight', 'Overall Width', '1840 mm')`,
      [camryId, camryId, camryId]
    );

    await db.query(
      'INSERT INTO vehicle_features (vehicle_id, feature_name, is_standard) VALUES (?, ?, ?), (?, ?, ?)',
      [camryId, 'Anti-Lock Braking System (ABS)', 1, camryId, 'Panoramic Sunroof', 0]
    );

    // 2. Seed Tesla Model 3
    const [teslaResult] = await db.query(
      'INSERT INTO vehicles (brand_id, name, type, body_type, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [3, 'Model 3', 'car', 'Sedan', 'approved', 'A fully electric compact sedan with outstanding range, responsive handling, and Autopilot safety features.']
    );
    const teslaId = teslaResult.insertId;

    await db.query(
      `INSERT INTO vehicle_variants (vehicle_id, name, price, transmission, engine_capacity, power, torque, mileage, fuel_type, seating_capacity, warranty) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        teslaId, 'Rear-Wheel Drive', 4500000.00, 'none', null, '283 bhp', '350 Nm', 491.00, 'electric', 5, '4 years or 80,000 km',
        teslaId, 'Long Range AWD', 5500000.00, 'none', null, '449 bhp', '490 Nm', 614.00, 'electric', 5, '4 years or 80,000 km'
      ]
    );

    await db.query(
      'INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)',
      [teslaId, 'https://upload.wikimedia.org/wikipedia/commons/9/90/Tesla_Model_3_of_2018.jpg', 1]
    );

    await db.query(
      'INSERT INTO vehicle_colors (vehicle_id, color_name, color_code, image_url) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      [
        teslaId, 'Solid Black', '#000000', null,
        teslaId, 'Deep Blue Metallic', '#0000FF', null
      ]
    );

    await db.query(
      `INSERT INTO vehicle_specifications (vehicle_id, category, spec_key, spec_value) VALUES 
       (?, 'Performance', '0-100 km/h Acceleration', '4.4 seconds'),
       (?, 'Battery', 'Battery Type', 'Lithium-ion')`,
      [teslaId, teslaId]
    );

    await db.query(
      'INSERT INTO vehicle_features (vehicle_id, feature_name, is_standard) VALUES (?, ?, ?), (?, ?, ?)',
      [teslaId, 'Tesla Autopilot Navigation', 1, teslaId, 'Heated Steering Wheel', 1]
    );

    // 3. Seed Yamaha YZF R15
    const [r15Result] = await db.query(
      'INSERT INTO vehicles (brand_id, name, type, body_type, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [4, 'YZF R15 V4', 'bike', 'Sports', 'approved', 'A lightweight sports bike featuring racing-derived aerodynamics and a high-revving VVA engine.']
    );
    const r15Id = r15Result.insertId;

    await db.query(
      `INSERT INTO vehicle_variants (vehicle_id, name, price, transmission, engine_capacity, power, torque, mileage, fuel_type, seating_capacity, warranty) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r15Id, 'Standard Edition', 182000.00, 'manual', 155, '18.4 bhp @ 10000 rpm', '14.2 Nm @ 7500 rpm', 45.00, 'petrol', 2, '2 years or 30,000 km'
      ]
    );

    await db.query(
      'INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)',
      [r15Id, 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Yamaha_YZF-R15.jpg', 1]
    );

    await db.query(
      'INSERT INTO vehicle_colors (vehicle_id, color_name, color_code, image_url) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      [
        r15Id, 'Racing Blue', '#0000CC', null,
        r15Id, 'Metallic Red', '#CC0000', null
      ]
    );

    await db.query(
      `INSERT INTO vehicle_specifications (vehicle_id, category, spec_key, spec_value) VALUES 
       (?, 'Engine', 'Valves Configuration', 'SOHC 4-Valve VVA'),
       (?, 'Chassis', 'Suspension Front', 'Telescopic Fork')`,
      [r15Id, r15Id]
    );

    await db.query(
      'INSERT INTO vehicle_features (vehicle_id, feature_name, is_standard) VALUES (?, ?, ?), (?, ?, ?)',
      [r15Id, 'Quick Shifter', 0, r15Id, 'Traction Control System', 1]
    );

    console.log('Approved vehicles seeded successfully!');
  } catch (err) {
    console.error('Seeding Error:', err.message);
  } finally {
    process.exit();
  }
}

seed();
