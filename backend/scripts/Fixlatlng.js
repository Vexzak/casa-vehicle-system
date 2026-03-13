/**
 * Migration: Fix latitude/longitude column precision.
 * DECIMAL(10,8) only allows values < 100 — breaks longitudes like 125.6087.
 * Fix: latitude -> DECIMAL(10,7), longitude -> DECIMAL(11,7)
 *
 * Run with:  node scripts/fixLatLng.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const migrate = async () => {
  try {
    console.log('🚀 Fixing latitude/longitude column precision...');

    await pool.query(`
      ALTER TABLE vehicles
        ALTER COLUMN latitude  TYPE DECIMAL(10, 7),
        ALTER COLUMN longitude TYPE DECIMAL(11, 7);
    `);

    console.log('✅ latitude  → DECIMAL(10,7)  (supports -999.9999999 to 999.9999999)');
    console.log('✅ longitude → DECIMAL(11,7)  (supports -9999.9999999 to 9999.9999999)');
    console.log('\n🎉 Done! You can now save coordinates like 7.0707, 125.6087');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();