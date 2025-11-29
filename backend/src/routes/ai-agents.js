const express = require('express');
const router = express.Router();
const axios = require('axios');

// AI Agent helper function
async function callAI(prompt, systemPrompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    throw new Error('AI service unavailable');
  }
}

// Order Agent - Process natural language orders
router.post('/order-agent', async (req, res) => {
  try {
    const { message, menu_items } = req.body;
    const db = req.app.locals.db;
    
    // Get menu if not provided
    let menuContext = menu_items;
    if (!menuContext) {
      const menuResult = await db.query(`
        SELECT id, name, description, price, is_available 
        FROM menu_items 
        WHERE is_available = true
      `);
      menuContext = menuResult.rows;
    }
    
    const systemPrompt = `You are an AI order assistant for a restaurant. 
    Available menu items: ${JSON.stringify(menuContext)}
    
    Parse the customer's order request and return a JSON response with:
    {
      "items": [{"menu_item_id": "uuid", "quantity": number, "special_instructions": "string"}],
      "order_type": "dine-in|takeaway|delivery",
      "table_number": "string or null",
      "response": "friendly confirmation message"
    }
    
    If items are unclear or unavailable, ask for clarification in the response field.`;
    
    const aiResponse = await callAI(message, systemPrompt);
    
    // Log AI interaction
    await db.query(`
      INSERT INTO ai_agent_logs (agent_type, action, input_data, output_data)
      VALUES ('order', 'process_order', $1, $2)
    `, [{ message, menu_items: menuContext }, { response: aiResponse }]);
    
    res.json({ success: true, data: JSON.parse(aiResponse) });
  } catch (error) {
    console.error('Order agent error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inventory Agent - Predict stock needs
router.post('/inventory-agent', async (req, res) => {
  try {
    const { action = 'predict' } = req.body;
    const db = req.app.locals.db;
    
    if (action === 'predict') {
      // Get inventory data
      const inventoryResult = await db.query(`
        SELECT 
          i.*,
          COALESCE(
            (SELECT SUM(quantity) 
             FROM inventory_transactions 
             WHERE inventory_item_id = i.id 
               AND transaction_type = 'out' 
               AND created_at >= CURRENT_DATE - INTERVAL '7 days'
            ), 0
          ) as weekly_usage
        FROM inventory_items i
      `);
      
      const systemPrompt = `You are an AI inventory manager. Analyze the inventory data and provide:
      1. Items that need restocking (current_stock <= minimum_stock)
      2. Predicted stock needs for next week based on weekly_usage
      3. Recommendations for optimal stock levels
      
      Return JSON: {
        "restock_needed": [{"item_id": "uuid", "item_name": "string", "quantity_needed": number, "priority": "high|medium|low"}],
        "predictions": [{"item_id": "uuid", "predicted_usage": number, "recommended_order": number}],
        "insights": "string with key recommendations"
      }`;
      
      const aiResponse = await callAI(
        JSON.stringify(inventoryResult.rows),
        systemPrompt
      );
      
      await db.query(`
        INSERT INTO ai_agent_logs (agent_type, action, input_data, output_data)
        VALUES ('inventory', 'predict_stock', $1, $2)
      `, [{ inventory: inventoryResult.rows }, { response: aiResponse }]);
      
      res.json({ success: true, data: JSON.parse(aiResponse) });
    } else {
      res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Inventory agent error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer Service Agent - Handle queries
router.post('/customer-service-agent', async (req, res) => {
  try {
    const { message, customer_id } = req.body;
    const db = req.app.locals.db;
    
    // Get customer context if provided
    let customerContext = null;
    if (customer_id) {
      const customerResult = await db.query(`
        SELECT c.*, 
          (SELECT json_agg(o.*) FROM orders o WHERE o.customer_id = c.id ORDER BY created_at DESC LIMIT 5) as recent_orders
        FROM customers c
        WHERE c.id = $1
      `, [customer_id]);
      
      if (customerResult.rows.length > 0) {
        customerContext = customerResult.rows[0];
      }
    }
    
    // Get restaurant info
    const restaurantResult = await db.query('SELECT * FROM restaurants LIMIT 1');
    const restaurant = restaurantResult.rows[0];
    
    const systemPrompt = `You are a friendly customer service AI for ${restaurant.name}.
    Restaurant details: ${JSON.stringify(restaurant)}
    ${customerContext ? `Customer context: ${JSON.stringify(customerContext)}` : ''}
    
    Handle customer queries about:
    - Menu items and recommendations
    - Order status and history
    - Reservations
    - Restaurant hours and location
    - Dietary restrictions and allergens
    - Loyalty program
    
    Provide helpful, friendly responses. If you need to take action (like making a reservation), 
    return JSON with: {"action": "action_type", "params": {}, "response": "message to customer"}`;
    
    const aiResponse = await callAI(message, systemPrompt);
    
    await db.query(`
      INSERT INTO ai_agent_logs (agent_type, action, input_data, output_data)
      VALUES ('customer_service', 'handle_query', $1, $2)
    `, [{ message, customer_id, customerContext }, { response: aiResponse }]);
    
    res.json({ success: true, data: { response: aiResponse } });
  } catch (error) {
    console.error('Customer service agent error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics Agent - Generate insights
router.post('/analytics-agent', async (req, res) => {
  try {
    const { period = 'week', focus = 'general' } = req.body;
    const db = req.app.locals.db;
    
    // Get analytics data
    const salesResult = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as revenue,
        AVG(total) as avg_order_value
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period === 'week' ? '7' : '30'} days'
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    const popularItemsResult = await db.query(`
      SELECT 
        oi.item_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= CURRENT_DATE - INTERVAL '${period === 'week' ? '7' : '30'} days'
        AND o.status != 'cancelled'
      GROUP BY oi.item_name
      ORDER BY total_quantity DESC
      LIMIT 10
    `);
    
    const systemPrompt = `You are an AI analytics expert for a restaurant. Analyze the data and provide:
    1. Key performance insights
    2. Trends and patterns
    3. Actionable recommendations
    4. Areas of concern or opportunity
    
    Focus area: ${focus}
    
    Return JSON: {
      "summary": "brief overview",
      "insights": ["insight1", "insight2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...],
      "metrics": {"key": "value", ...}
    }`;
    
    const aiResponse = await callAI(
      JSON.stringify({
        sales: salesResult.rows,
        popular_items: popularItemsResult.rows,
        period
      }),
      systemPrompt
    );
    
    await db.query(`
      INSERT INTO ai_agent_logs (agent_type, action, input_data, output_data)
      VALUES ('analytics', 'generate_insights', $1, $2)
    `, [{ period, focus }, { response: aiResponse }]);
    
    res.json({ success: true, data: JSON.parse(aiResponse) });
  } catch (error) {
    console.error('Analytics agent error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get AI agent logs
router.get('/logs', async (req, res) => {
  try {
    const { agent_type, limit = 50 } = req.query;
    const db = req.app.locals.db;
    
    let query = 'SELECT * FROM ai_agent_logs WHERE 1=1';
    const params = [];
    
    if (agent_type) {
      params.push(agent_type);
      query += ` AND agent_type = $${params.length}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
