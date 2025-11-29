const express = require('express');
const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    const db = req.app.locals.db;
    
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR phone ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single customer with order history
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const customerResult = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    const ordersResult = await db.query(`
      SELECT * FROM orders 
      WHERE customer_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [req.params.id]);
    
    const customer = customerResult.rows[0];
    customer.recent_orders = ordersResult.rows;
    
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { restaurant_id, name, email, phone, address, preferences } = req.body;
    
    const db = req.app.locals.db;
    const result = await db.query(`
      INSERT INTO customers (restaurant_id, name, email, phone, address, preferences)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [restaurant_id, name, email, phone, address, preferences]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update customer
router.patch('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, preferences } = req.body;
    const db = req.app.locals.db;
    
    const result = await db.query(`
      UPDATE customers 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          address = COALESCE($4, address),
          preferences = COALESCE($5, preferences),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, email, phone, address, preferences, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add loyalty points
router.patch('/:id/loyalty', async (req, res) => {
  try {
    const { points } = req.body;
    const db = req.app.locals.db;
    
    const result = await db.query(`
      UPDATE customers 
      SET loyalty_points = loyalty_points + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [points, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
