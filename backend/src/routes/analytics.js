const express = require('express');
const router = express.Router();

// Get sales analytics
router.get('/sales', async (req, res) => {
  try {
    const { period = 'today', date_from, date_to } = req.query;
    const db = req.app.locals.db;
    
    let dateFilter = '';
    const params = [];
    
    if (period === 'today') {
      dateFilter = "AND DATE(created_at) = CURRENT_DATE";
    } else if (period === 'week') {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (date_from && date_to) {
      params.push(date_from, date_to);
      dateFilter = `AND created_at BETWEEN $1 AND $2`;
    }
    
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        AVG(total) as average_order_value,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN order_type = 'dine-in' THEN 1 ELSE 0 END) as dine_in_orders,
        SUM(CASE WHEN order_type = 'takeaway' THEN 1 ELSE 0 END) as takeaway_orders,
        SUM(CASE WHEN order_type = 'delivery' THEN 1 ELSE 0 END) as delivery_orders
      FROM orders 
      WHERE 1=1 ${dateFilter}
    `, params);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get popular menu items
router.get('/popular-items', async (req, res) => {
  try {
    const { limit = 10, period = 'month' } = req.query;
    const db = req.app.locals.db;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND o.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    }
    
    const result = await db.query(`
      SELECT 
        oi.item_name,
        oi.menu_item_id,
        COUNT(*) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue,
        AVG(oi.unit_price) as avg_price
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY oi.item_name, oi.menu_item_id
      ORDER BY total_quantity DESC
      LIMIT $1
    `, [limit]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get revenue by day
router.get('/revenue-by-day', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const db = req.app.locals.db;
    
    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as revenue,
        AVG(total) as avg_order_value
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching revenue by day:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get peak hours
router.get('/peak-hours', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const db = req.app.locals.db;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'";
    }
    
    const result = await db.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as order_count,
        SUM(total) as revenue
      FROM orders
      ${dateFilter}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer insights
router.get('/customers', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_customers,
        SUM(total_orders) as total_orders,
        AVG(total_spent) as avg_customer_value,
        SUM(loyalty_points) as total_loyalty_points
      FROM customers
    `);
    
    const topCustomers = await db.query(`
      SELECT 
        id, name, phone, email,
        total_orders, total_spent, loyalty_points
      FROM customers
      ORDER BY total_spent DESC
      LIMIT 10
    `);
    
    res.json({ 
      success: true, 
      data: {
        overview: result.rows[0],
        top_customers: topCustomers.rows
      }
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get inventory insights
router.get('/inventory', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN current_stock <= minimum_stock THEN 1 ELSE 0 END) as low_stock_items,
        SUM(current_stock * unit_cost) as total_inventory_value
      FROM inventory_items
    `);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching inventory insights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
