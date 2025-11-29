-- Sample data for testing the Restaurant Management System

-- Get the restaurant ID (assuming it was created by schema.sql)
DO $$
DECLARE
    restaurant_uuid UUID;
BEGIN
    SELECT id INTO restaurant_uuid FROM restaurants LIMIT 1;
    
    -- Insert menu categories
    INSERT INTO menu_categories (restaurant_id, name, description, display_order) VALUES
    (restaurant_uuid, 'Appetizers', 'Start your meal right', 1),
    (restaurant_uuid, 'Main Course', 'Hearty and delicious mains', 2),
    (restaurant_uuid, 'Desserts', 'Sweet endings', 3),
    (restaurant_uuid, 'Beverages', 'Refreshing drinks', 4);
    
    -- Insert menu items
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, preparation_time, is_vegetarian, is_vegan) VALUES
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Appetizers' LIMIT 1), 'Caesar Salad', 'Fresh romaine lettuce with parmesan and croutons', 8.99, 10, true, false),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Appetizers' LIMIT 1), 'Garlic Bread', 'Toasted bread with garlic butter', 5.99, 8, true, false),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Appetizers' LIMIT 1), 'Spring Rolls', 'Crispy vegetable spring rolls', 6.99, 12, true, true),
    
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Main Course' LIMIT 1), 'Grilled Chicken', 'Tender grilled chicken with herbs', 15.99, 25, false, false),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Main Course' LIMIT 1), 'Margherita Pizza', 'Classic pizza with tomato and mozzarella', 12.99, 20, true, false),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Main Course' LIMIT 1), 'Pasta Carbonara', 'Creamy pasta with bacon', 13.99, 18, false, false),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Main Course' LIMIT 1), 'Veggie Burger', 'Plant-based burger with fries', 11.99, 15, true, true),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Main Course' LIMIT 1), 'Grilled Salmon', 'Fresh salmon with lemon butter', 18.99, 22, false, false),
    
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1), 'Chocolate Cake', 'Rich chocolate layer cake', 6.99, 5, true, false),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1), 'Ice Cream Sundae', 'Vanilla ice cream with toppings', 5.99, 5, true, false),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1), 'Tiramisu', 'Classic Italian dessert', 7.99, 5, true, false),
    
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Beverages' LIMIT 1), 'Coca Cola', 'Chilled soft drink', 2.99, 2, true, true),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Beverages' LIMIT 1), 'Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 5, true, true),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Beverages' LIMIT 1), 'Coffee', 'Hot brewed coffee', 3.99, 5, true, true),
    (restaurant_uuid, (SELECT id FROM menu_categories WHERE name = 'Beverages' LIMIT 1), 'Iced Tea', 'Refreshing iced tea', 3.49, 3, true, true);
    
    -- Insert inventory items
    INSERT INTO inventory_items (restaurant_id, name, category, unit, current_stock, minimum_stock, maximum_stock, unit_cost, supplier) VALUES
    (restaurant_uuid, 'Chicken Breast', 'Meat', 'kg', 50, 20, 100, 8.50, 'Fresh Meats Co'),
    (restaurant_uuid, 'Salmon Fillet', 'Seafood', 'kg', 30, 15, 60, 15.00, 'Ocean Fresh'),
    (restaurant_uuid, 'Lettuce', 'Vegetables', 'kg', 25, 10, 50, 2.50, 'Green Farms'),
    (restaurant_uuid, 'Tomatoes', 'Vegetables', 'kg', 40, 15, 80, 3.00, 'Green Farms'),
    (restaurant_uuid, 'Mozzarella Cheese', 'Dairy', 'kg', 35, 20, 70, 12.00, 'Dairy Delights'),
    (restaurant_uuid, 'Pasta', 'Dry Goods', 'kg', 60, 25, 100, 4.50, 'Italian Imports'),
    (restaurant_uuid, 'Flour', 'Dry Goods', 'kg', 80, 30, 150, 1.50, 'Baking Supplies'),
    (restaurant_uuid, 'Olive Oil', 'Oils', 'liters', 45, 20, 80, 8.00, 'Mediterranean Goods'),
    (restaurant_uuid, 'Coca Cola', 'Beverages', 'cans', 200, 100, 500, 0.50, 'Beverage Distributors'),
    (restaurant_uuid, 'Orange Juice', 'Beverages', 'liters', 40, 20, 80, 3.50, 'Fresh Juice Co'),
    (restaurant_uuid, 'Coffee Beans', 'Beverages', 'kg', 15, 10, 30, 18.00, 'Coffee Roasters'),
    (restaurant_uuid, 'Ice Cream', 'Frozen', 'liters', 25, 15, 50, 6.00, 'Frozen Treats');
    
    -- Insert sample customers
    INSERT INTO customers (restaurant_id, name, email, phone, address, preferences) VALUES
    (restaurant_uuid, 'John Doe', 'john.doe@email.com', '+1234567890', '123 Main St, City', '{"dietary": "none", "favorite_items": ["Grilled Chicken", "Caesar Salad"]}'),
    (restaurant_uuid, 'Jane Smith', 'jane.smith@email.com', '+1234567891', '456 Oak Ave, City', '{"dietary": "vegetarian", "favorite_items": ["Margherita Pizza", "Veggie Burger"]}'),
    (restaurant_uuid, 'Bob Johnson', 'bob.j@email.com', '+1234567892', '789 Pine Rd, City', '{"dietary": "none", "favorite_items": ["Grilled Salmon", "Pasta Carbonara"]}'),
    (restaurant_uuid, 'Alice Williams', 'alice.w@email.com', '+1234567893', '321 Elm St, City', '{"dietary": "vegan", "favorite_items": ["Spring Rolls", "Veggie Burger"]}');
    
    -- Insert sample reservations
    INSERT INTO reservations (restaurant_id, customer_id, customer_name, customer_phone, customer_email, reservation_date, reservation_time, party_size, special_requests) VALUES
    (restaurant_uuid, (SELECT id FROM customers WHERE name = 'John Doe' LIMIT 1), 'John Doe', '+1234567890', 'john.doe@email.com', CURRENT_DATE + INTERVAL '1 day', '19:00:00', 4, 'Window seat preferred'),
    (restaurant_uuid, (SELECT id FROM customers WHERE name = 'Jane Smith' LIMIT 1), 'Jane Smith', '+1234567891', 'jane.smith@email.com', CURRENT_DATE + INTERVAL '2 days', '20:00:00', 2, 'Vegetarian options'),
    (restaurant_uuid, (SELECT id FROM customers WHERE name = 'Bob Johnson' LIMIT 1), 'Bob Johnson', '+1234567892', 'bob.j@email.com', CURRENT_DATE + INTERVAL '1 day', '18:30:00', 6, 'Birthday celebration');
    
END $$;

-- Display summary
SELECT 
    (SELECT COUNT(*) FROM menu_categories) as categories,
    (SELECT COUNT(*) FROM menu_items) as menu_items,
    (SELECT COUNT(*) FROM inventory_items) as inventory_items,
    (SELECT COUNT(*) FROM customers) as customers,
    (SELECT COUNT(*) FROM reservations) as reservations;
