/**
 * Migration: Add `features` and `colors` columns to the vehicles table.
 * Run once with:  node scripts/addVehicleColumns.js
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
    console.log('🚀 Running migration: add features & colors columns...');

    // features — array of feature keys e.g. ["abs","bluetooth","traction"]
    await pool.query(`
      ALTER TABLE vehicles
      ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✅ features column ready');

    // colors — array of {name, hex} objects e.g. [{"name":"Midnight Black","hex":"#1a1a1a"}]
    await pool.query(`
      ALTER TABLE vehicles
      ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✅ colors column ready');

    // Also add color_variants as an alias column (keeps compatibility with VehicleDetails)
    await pool.query(`
      ALTER TABLE vehicles
      ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✅ color_variants column ready');

    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now create/update vehicles with features and colors.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();