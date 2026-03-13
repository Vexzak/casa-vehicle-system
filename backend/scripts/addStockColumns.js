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
    console.log('🚀 Running stock migration...');

    // 1. Add top-level stock column to vehicles (default 1 for existing rows)
    await pool.query(`
      ALTER TABLE vehicles
      ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 1;
    `);
    console.log('✅ Added stock column to vehicles');

    // 2. Add selected_color column to reservations so we know which color was reserved
    await pool.query(`
      ALTER TABLE reservations
      ADD COLUMN IF NOT EXISTS selected_color JSONB;
    `);
    console.log('✅ Added selected_color column to reservations');

    // 3. For existing vehicles that are currently 'reserved', set stock = 0
    //    so the logic stays consistent with current state
    await pool.query(`
      UPDATE vehicles
      SET stock = 0
      WHERE availability_status = 'reserved';
    `);
    console.log('✅ Set stock=0 for currently reserved vehicles');

    // 4. For existing vehicles that are 'sold', set stock = 0
    await pool.query(`
      UPDATE vehicles
      SET stock = 0
      WHERE availability_status = 'sold';
    `);
    console.log('✅ Set stock=0 for sold vehicles');

    // 5. Make sure colors JSONB on every existing vehicle includes a stock field.
    //    For any vehicle whose colors array has entries without stock, add stock:1.
    //    We do this with a PostgreSQL function to update each element in the array.
    await pool.query(`
      UPDATE vehicles
      SET colors = (
        SELECT jsonb_agg(
          CASE
            WHEN (elem->>'stock') IS NULL
            THEN elem || jsonb_build_object('stock', 1)
            ELSE elem
          END
        )
        FROM jsonb_array_elements(
          CASE WHEN jsonb_typeof(colors) = 'array' THEN colors ELSE '[]'::jsonb END
        ) AS elem
      )
      WHERE jsonb_typeof(colors) = 'array' AND jsonb_array_length(colors) > 0;
    `);
    console.log('✅ Backfilled stock:1 into existing color variants');

    console.log('\n🎉 Stock migration completed successfully!');
    console.log('📋 Changes made:');
    console.log('   • vehicles.stock (INTEGER, default 1)');
    console.log('   • reservations.selected_color (JSONB)');
    console.log('   • Existing reserved/sold vehicles → stock set to 0');
    console.log('   • Existing color variants → stock field added (default 1)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();