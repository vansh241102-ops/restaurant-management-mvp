const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Generate order number
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
}

// Get all orders with filters
router.get('/', async (req, res) => {
  try {
    const { status, order_type, date_from, date_to, limit = 50 } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }
    
    if (order_type) {
      params.push(order_type);
      query += ` AND o.order_type = $${params.length}`;
    }
    
    if (date_from) {
      params.push(date_from);
      query += ` AND o.created_at >= $${params.length}`;
    }
    
    if (date_to) {
      params.push(date_to);
      query += ` AND o.created_at <= $${params.length}`;
    }
    
    query += ` GROUP BY o.id, c.name, c.phone ORDER BY o.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single order with items
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get order details
    const orderResult = await db.query(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [req.params.id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Get order items
    const itemsResult = await db.query(`
      SELECT * FROM order_items WHERE order_id = $1
    `, [req.params.id]);
    
    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  const client = await req.app.locals.db.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      restaurant_id,
      customer_id,
      order_type,
      table_number,
      items,
      special_instructions,
      payment_method
    } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    const itemsWithPrices = [];
    
    for (const item of items) {
      const priceResult = await client.query(
        'SELECT price, name FROM menu_items WHERE id = $1',
        [item.menu_item_id]
      );
      
      if (priceResult.rows.length === 0) {
        throw new Error(`Menu item ${item.menu_item_id} not found`);
      }
      
      const price = parseFloat(priceResult.rows[0].price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      
      itemsWithPrices.push({
        menu_item_id: item.menu_item_id,
        item_name: priceResult.rows[0].name,
        quantity: item.quantity,
        unit_price: price,
        subtotal: itemSubtotal,
        special_instructions: item.special_instructions
      });
    }
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    const orderNumber = generateOrderNumber();
    
    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        restaurant_id, customer_id, order_number, order_type,
        table_number, subtotal, tax, total, special_instructions,
        payment_method, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *
    `, [
      restaurant_id, customer_id, orderNumber, order_type,
      table_number, subtotal, tax, total, special_instructions,
      payment_method
    ]);
    
    const order = orderResult.rows[0];
    
    // Create order items
    for (const item of itemsWithPrices) {
      await client.query(`
        INSERT INTO order_items (
          order_id, menu_item_id, item_name, quantity,
          unit_price, subtotal, special_instructions
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        order.id, item.menu_item_id, item.item_name, item.quantity,
        item.unit_price, item.subtotal, item.special_instructions
      ]);
    }
    
    // Update customer stats if customer_id provided
    if (customer_id) {
      await client.query(`
        UPDATE customers 
        SET total_orders = total_orders + 1,
            total_spent = total_spent + $1
        WHERE id = $2
      `, [total, customer_id]);
    }
    
    await client.query('COMMIT');
    
    // Fetch complete order with items
    const completeOrder = await client.query(`
      SELECT 
        o.*,
        json_agg(oi.*) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [order.id]);
    
    res.status(201).json({ success: true, data: completeOrder.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const db = req.app.locals.db;
    const result = await db.query(`
      UPDATE orders 
      SET status = $1, 
          updated_at = CURRENT_TIMESTAMP,
          completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE id = $2
      RETURNING *
    `, [status, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;
    const db = req.app.locals.db;
    
    const result = await db.query(`
      UPDATE orders 
      SET payment_status = $1, 
          payment_method = COALESCE($2, payment_method),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [payment_status, payment_method, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
