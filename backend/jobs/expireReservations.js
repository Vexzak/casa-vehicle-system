const pool = require('../config/database');

/**
 * expireReservationsJob
 * ---------------------
 * Finds every reservation whose status is still 'active' but whose
 * expires_at timestamp has already passed, then:
 *   1. Marks the reservation as 'expired'
 *   2. Sets the vehicle back to 'available'
 *   3. Inserts a user notification
 *
 * Called automatically by server.js every 60 minutes and once on startup.
 * Can also be triggered manually via POST /api/reservations/expire (admin).
 */
const expireReservationsJob = async () => {
  const expiredResult = await pool.query(`
    SELECT r.id, r.vehicle_id, r.user_id, v.name AS vehicle_name
    FROM reservations r
    JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.status = 'active'
      AND r.expires_at < NOW()
  `);

  const expired = expiredResult.rows;

  if (expired.length === 0) {
    console.log(`⏰ [${new Date().toISOString()}] Expiry check: no reservations to expire`);
    return;
  }

  for (const reservation of expired) {
    // Mark reservation expired
    await pool.query(
      "UPDATE reservations SET status = 'expired' WHERE id = $1",
      [reservation.id]
    );

    // Release vehicle
    await pool.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
      [reservation.vehicle_id]
    );

    // Notify user
    await pool.query(
      'INSERT INTO notifications (message) VALUES ($1)',
      [
        `Your reservation #${reservation.id} for "${reservation.vehicle_name}" has expired ` +
        `because it was not claimed within 10 days. The vehicle is now available again.`
      ]
    );

    console.log(
      `⏰ Reservation #${reservation.id} expired — ` +
      `vehicle #${reservation.vehicle_id} (${reservation.vehicle_name}) released`
    );
  }

  console.log(`⏰ [${new Date().toISOString()}] Expiry job complete: ${expired.length} reservation(s) expired`);
};

module.exports = { expireReservationsJob };