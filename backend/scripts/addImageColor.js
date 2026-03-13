/**
 * Migration: Add `color` column to vehicle_images table.
 * Run with:  node scripts/addImageColor.js
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
    console.log('🚀 Adding color column to vehicle_images...');

    await pool.query(`
      ALTER TABLE vehicle_images
      ADD COLUMN IF NOT EXISTS color JSONB DEFAULT NULL;
    `);

    console.log('✅ color column added to vehicle_images');
    console.log('\n🎉 Done! Images will now store their color tag.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();