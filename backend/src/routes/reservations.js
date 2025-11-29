const express = require('express');
const router = express.Router();

// Get all reservations
router.get('/', async (req, res) => {
  try {
    const { date, status, limit = 50 } = req.query;
    const db = req.app.locals.db;
    
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params = [];
    
    if (date) {
      params.push(date);
      query += ` AND reservation_date = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    query += ` ORDER BY reservation_date DESC, reservation_time DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single reservation
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create reservation
router.post('/', async (req, res) => {
  try {
    const {
      restaurant_id,
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      reservation_date,
      reservation_time,
      party_size,
      table_number,
      special_requests
    } = req.body;
    
    const db = req.app.locals.db;
    const result = await db.query(`
      INSERT INTO reservations (
        restaurant_id, customer_id, customer_name, customer_phone,
        customer_email, reservation_date, reservation_time, party_size,
        table_number, special_requests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      restaurant_id, customer_id, customer_name, customer_phone,
      customer_email, reservation_date, reservation_time, party_size,
      table_number, special_requests
    ]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update reservation status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled', 'no-show'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const db = req.app.locals.db;
    const result = await db.query(`
      UPDATE reservations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update reservation
router.patch('/:id', async (req, res) => {
  try {
    const {
      reservation_date,
      reservation_time,
      party_size,
      table_number,
      special_requests
    } = req.body;
    
    const db = req.app.locals.db;
    const result = await db.query(`
      UPDATE reservations 
      SET reservation_date = COALESCE($1, reservation_date),
          reservation_time = COALESCE($2, reservation_time),
          party_size = COALESCE($3, party_size),
          table_number = COALESCE($4, table_number),
          special_requests = COALESCE($5, special_requests),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [reservation_date, reservation_time, party_size, table_number, special_requests, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('DELETE FROM reservations WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
