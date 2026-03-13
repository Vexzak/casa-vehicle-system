const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');

    // ── users ──────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)  NOT NULL,
        email      VARCHAR(255)  UNIQUE NOT NULL,
        password   VARCHAR(255)  NOT NULL,
        role       VARCHAR(50)   DEFAULT 'user',
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table ready');

    // ── vehicles ───────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id                  SERIAL PRIMARY KEY,
        name                VARCHAR(255)    NOT NULL,
        type                VARCHAR(50)     NOT NULL,
        brand               VARCHAR(100)    NOT NULL,
        year                INTEGER         NOT NULL,
        price               DECIMAL(10, 2)  NOT NULL,
        description         TEXT,
        location            VARCHAR(255),
        latitude            DECIMAL(10, 8),
        longitude           DECIMAL(11, 8),
        availability_status VARCHAR(50)     DEFAULT 'available',
        rating              DECIMAL(3, 2)   DEFAULT 0,
        features            JSONB           DEFAULT '[]'::jsonb,
        colors              JSONB           DEFAULT '[]'::jsonb,
        color_variants      JSONB           DEFAULT '[]'::jsonb,
        created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Vehicles table ready');

    // ── vehicle_images ─────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicle_images (
        id         SERIAL PRIMARY KEY,
        vehicle_id INTEGER      REFERENCES vehicles(id) ON DELETE CASCADE,
        image_path VARCHAR(500) NOT NULL,
        color      JSONB,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Vehicle images table ready');

    // ── reservations ───────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER       REFERENCES users(id)    ON DELETE CASCADE,
        vehicle_id INTEGER       REFERENCES vehicles(id) ON DELETE CASCADE,
        status     VARCHAR(50)   DEFAULT 'active',
        expires_at TIMESTAMP     NOT NULL,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_active_reservation UNIQUE (user_id, vehicle_id, status)
      );
    `);
    console.log('✅ Reservations table ready');

    // ── messages ───────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER  REFERENCES users(id)    ON DELETE CASCADE,
        vehicle_id INTEGER  REFERENCES vehicles(id) ON DELETE SET NULL,
        message    TEXT     NOT NULL,
        reply      TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Messages table ready');

    // ── activity_logs ──────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER  REFERENCES users(id) ON DELETE SET NULL,
        action     TEXT     NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Activity logs table ready');

    // ── notifications ──────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         SERIAL  PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message    TEXT    NOT NULL,
        is_read    BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Notifications table ready');

    // ── wishlist ───────────────────────────────────────────────────────────
    // selected_color — JSONB {name, hex} chosen by user when saving to wishlist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id             SERIAL PRIMARY KEY,
        user_id        INTEGER REFERENCES users(id)    ON DELETE CASCADE,
        vehicle_id     INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        selected_color JSONB,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_vehicle_wishlist UNIQUE (user_id, vehicle_id)
      );
    `);
    console.log('✅ Wishlist table ready');

    // ── Indexes ────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_status_expires
        ON reservations (status, expires_at)
        WHERE status = 'active';
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_user
        ON wishlist (user_id);
    `);
    console.log('✅ Indexes ready');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('📋 Tables: users, vehicles, vehicle_images, reservations, messages, activity_logs, notifications, wishlist');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();