const express = require('express');
const router = express.Router();

// Get all menu items with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        mi.*,
        mc.name as category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND mc.id = $${params.length}`;
    }
    
    if (available !== undefined) {
      params.push(available === 'true');
      query += ` AND mi.is_available = $${params.length}`;
    }
    
    query += ' ORDER BY mc.display_order, mi.name';
    
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get menu categories
router.get('/categories', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(`
      SELECT * FROM menu_categories 
      WHERE is_active = true 
      ORDER BY display_order
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(`
      SELECT 
        mi.*,
        mc.name as category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create menu item
router.post('/', async (req, res) => {
  try {
    const {
      restaurant_id,
      category_id,
      name,
      description,
      price,
      image_url,
      preparation_time,
      calories,
      allergens,
      is_vegetarian,
      is_vegan
    } = req.body;
    
    const db = req.app.locals.db;
    const result = await db.query(`
      INSERT INTO menu_items (
        restaurant_id, category_id, name, description, price, 
        image_url, preparation_time, calories, allergens, 
        is_vegetarian, is_vegan
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      restaurant_id, category_id, name, description, price,
      image_url, preparation_time, calories, allergens,
      is_vegetarian, is_vegan
    ]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update menu item
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'name', 'description', 'price', 'image_url', 'is_available',
      'preparation_time', 'calories', 'allergens', 'is_vegetarian', 'is_vegan'
    ];
    
    const setClause = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (setClause.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }
    
    values.push(id);
    const db = req.app.locals.db;
    const result = await db.query(`
      UPDATE menu_items 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
