const express = require('express');
const router = express.Router();

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const { low_stock, category } = req.query;
    const db = req.app.locals.db;
    
    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const params = [];
    
    if (low_stock === 'true') {
      query += ' AND current_stock <= minimum_stock';
    }
    
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    
    query += ' ORDER BY name';
    
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get low stock alerts
router.get('/alerts', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(`
      SELECT 
        *,
        (minimum_stock - current_stock) as shortage_amount,
        ROUND(((minimum_stock - current_stock) / minimum_stock * 100)::numeric, 2) as shortage_percentage
      FROM inventory_items 
      WHERE current_stock <= minimum_stock
      ORDER BY shortage_percentage DESC
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM inventory_items WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create inventory item
router.post('/', async (req, res) => {
  try {
    const {
      restaurant_id,
      name,
      category,
      unit,
      current_stock,
      minimum_stock,
      maximum_stock,
      unit_cost,
      supplier
    } = req.body;
    
    const db = req.app.locals.db;
    const result = await db.query(`
      INSERT INTO inventory_items (
        restaurant_id, name, category, unit, current_stock,
        minimum_stock, maximum_stock, unit_cost, supplier
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      restaurant_id, name, category, unit, current_stock,
      minimum_stock, maximum_stock, unit_cost, supplier
    ]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update inventory stock
router.patch('/:id/stock', async (req, res) => {
  const client = await req.app.locals.db.connect();
  
  try {
    await client.query('BEGIN');
    
    const { quantity, transaction_type, reason } = req.body;
    
    if (!['in', 'out', 'adjustment'].includes(transaction_type)) {
      return res.status(400).json({ success: false, error: 'Invalid transaction type' });
    }
    
    // Get current stock
    const itemResult = await client.query(
      'SELECT current_stock FROM inventory_items WHERE id = $1',
      [req.params.id]
    );
    
    if (itemResult.rows.length === 0) {
      throw new Error('Inventory item not found');
    }
    
    let newStock = parseFloat(itemResult.rows[0].current_stock);
    
    if (transaction_type === 'in') {
      newStock += parseFloat(quantity);
    } else if (transaction_type === 'out') {
      newStock -= parseFloat(quantity);
    } else {
      newStock = parseFloat(quantity);
    }
    
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }
    
    // Update stock
    const updateResult = await client.query(`
      UPDATE inventory_items 
      SET current_stock = $1,
          last_restocked_at = CASE WHEN $2 = 'in' THEN CURRENT_TIMESTAMP ELSE last_restocked_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [newStock, transaction_type, req.params.id]);
    
    // Log transaction
    await client.query(`
      INSERT INTO inventory_transactions (
        inventory_item_id, transaction_type, quantity, reason
      )
      VALUES ($1, $2, $3, $4)
    `, [req.params.id, transaction_type, quantity, reason]);
    
    await client.query('COMMIT');
    
    res.json({ success: true, data: updateResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating stock:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Get inventory transactions
router.get('/:id/transactions', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const db = req.app.locals.db;
    
    const result = await db.query(`
      SELECT * FROM inventory_transactions 
      WHERE inventory_item_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [req.params.id, limit]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
