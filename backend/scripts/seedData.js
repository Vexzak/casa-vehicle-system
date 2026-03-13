const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin User', 'admin@casa.com', adminPassword, 'admin']);
    console.log('✅ Admin user created (email: admin@casa.com, password: admin123)');

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['John Doe', 'user@casa.com', userPassword, 'user']);
    console.log('✅ Regular user created (email: user@casa.com, password: user123)');

    // Sample vehicles
    const vehicles = [
      {
        name: 'Tesla Model 3',
        type: 'car',
        brand: 'Tesla',
        year: 2024,
        price: 45000.00,
        description: 'Electric sedan with autopilot features, long-range battery, and premium interior.',
        location: '123 Main St, San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        rating: 4.8
      },
      {
        name: 'BMW X5',
        type: 'car',
        brand: 'BMW',
        year: 2023,
        price: 62000.00,
        description: 'Luxury SUV with advanced safety features, spacious interior, and powerful engine.',
        location: '456 Oak Ave, Los Angeles, CA',
        latitude: 34.0522,
        longitude: -118.2437,
        rating: 4.6
      },
      {
        name: 'Honda CBR1000RR',
        type: 'motorcycle',
        brand: 'Honda',
        year: 2024,
        price: 17500.00,
        description: 'High-performance sport bike with advanced electronics and aerodynamic design.',
        location: '789 Pine Rd, Miami, FL',
        latitude: 25.7617,
        longitude: -80.1918,
        rating: 4.9
      },
      {
        name: 'Mercedes-Benz E-Class',
        type: 'car',
        brand: 'Mercedes-Benz',
        year: 2024,
        price: 58000.00,
        description: 'Elegant sedan with cutting-edge technology, luxurious comfort, and superior performance.',
        location: '321 Elm St, New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        rating: 4.7
      },
      {
        name: 'Harley-Davidson Street 750',
        type: 'motorcycle',
        brand: 'Harley-Davidson',
        year: 2023,
        price: 8500.00,
        description: 'Classic cruiser motorcycle with iconic styling and smooth ride.',
        location: '654 Maple Dr, Chicago, IL',
        latitude: 41.8781,
        longitude: -87.6298,
        rating: 4.5
      },
      {
        name: 'Toyota Camry',
        type: 'car',
        brand: 'Toyota',
        year: 2024,
        price: 28000.00,
        description: 'Reliable sedan with excellent fuel efficiency, safety features, and modern design.',
        location: '987 Cedar Ln, Houston, TX',
        latitude: 29.7604,
        longitude: -95.3698,
        rating: 4.4
      }
    ];

    for (const vehicle of vehicles) {
      const result = await pool.query(`
        INSERT INTO vehicles (name, type, brand, year, price, description, location, latitude, longitude, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        vehicle.name, vehicle.type, vehicle.brand, vehicle.year, vehicle.price,
        vehicle.description, vehicle.location, vehicle.latitude, vehicle.longitude, vehicle.rating
      ]);

      const vehicleId = result.rows[0].id;

      // Add sample images (using placeholder URLs)
      const imageUrls = [
        `https://via.placeholder.com/800x600?text=${encodeURIComponent(vehicle.name)}+1`,
        `https://via.placeholder.com/800x600?text=${encodeURIComponent(vehicle.name)}+2`,
        `https://via.placeholder.com/800x600?text=${encodeURIComponent(vehicle.name)}+3`
      ];

      for (const imageUrl of imageUrls) {
        await pool.query(`
          INSERT INTO vehicle_images (vehicle_id, image_path)
          VALUES ($1, $2)
        `, [vehicleId, imageUrl]);
      }
    }

    console.log('✅ Sample vehicles created');

    // Create sample activity log
    await pool.query(`
      INSERT INTO activity_logs (user_id, action)
      VALUES (1, 'Admin user logged in')
    `);
    console.log('✅ Sample activity log created');

    // Create sample notification
    await pool.query(`
      INSERT INTO notifications (message)
      VALUES ('System initialized successfully')
    `);
    console.log('✅ Sample notification created');

    console.log('🎉 Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
