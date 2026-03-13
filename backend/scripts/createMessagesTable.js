/**
 * Run this once to create the messages table:
 *   node backend/scripts/createMessagesTable.js
 */
const pool = require('../config/database');

const createMessagesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id   INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        message      TEXT NOT NULL,
        reply        TEXT,
        is_read      BOOLEAN DEFAULT FALSE,
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_user_id    ON messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_vehicle_id ON messages(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
    `);

    console.log('✅ messages table created (or already exists).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating messages table:', err);
    process.exit(1);
  }
};

createMessagesTable();