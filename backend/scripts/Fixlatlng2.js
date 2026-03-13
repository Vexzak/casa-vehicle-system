/**
 * Migration: Change latitude/longitude to FLOAT (no overflow, standard for coords).
 * Run with:  node scripts/fixLatLng2.js
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
    console.log('🚀 Changing latitude/longitude to FLOAT...');

    await pool.query(`
      ALTER TABLE vehicles
        ALTER COLUMN latitude  TYPE FLOAT USING latitude::FLOAT,
        ALTER COLUMN longitude TYPE FLOAT USING longitude::FLOAT;
    `);

    console.log('✅ latitude  → FLOAT');
    console.log('✅ longitude → FLOAT');
    console.log('\n🎉 Done! No more numeric overflow errors.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();