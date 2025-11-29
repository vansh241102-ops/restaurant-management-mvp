# API Examples

Complete examples for testing all API endpoints.

## Base URL
```
http://localhost:3000/api
# or
https://your-app.railway.app/api
```

## Menu Management

### Get All Menu Items
```bash
curl http://localhost:3000/api/menu
```

### Get Menu by Category
```bash
curl "http://localhost:3000/api/menu?category=CATEGORY_ID"
```

### Get Available Items Only
```bash
curl "http://localhost:3000/api/menu?available=true"
```

### Create Menu Item
```bash
curl -X POST http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "RESTAURANT_ID",
    "category_id": "CATEGORY_ID",
    "name": "Grilled Steak",
    "description": "Premium beef steak grilled to perfection",
    "price": 24.99,
    "preparation_time": 30,
    "is_vegetarian": false,
    "is_vegan": false
  }'
```

### Update Menu Item
```bash
curl -X PATCH http://localhost:3000/api/menu/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "price": 22.99,
    "is_available": true
  }'
```

## Order Management

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "RESTAURANT_ID",
    "customer_id": "CUSTOMER_ID",
    "order_type": "dine-in",
    "table_number": "12",
    "items": [
      {
        "menu_item_id": "MENU_ITEM_ID_1",
        "quantity": 2,
        "special_instructions": "No onions"
      },
      {
        "menu_item_id": "MENU_ITEM_ID_2",
        "quantity": 1
      }
    ],
    "special_instructions": "Please rush",
    "payment_method": "card"
  }'
```

### Get All Orders
```bash
curl "http://localhost:3000/api/orders?status=pending&limit=20"
```

### Get Order Details
```bash
curl http://localhost:3000/api/orders/ORDER_ID
```

### Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing"
  }'
```

### Update Payment Status
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID/payment \
  -H "Content-Type: application/json" \
  -d '{
    "payment_status": "paid",
    "payment_method": "card"
  }'
```

## Inventory Management

### Get All Inventory
```bash
curl http://localhost:3000/api/inventory
```

### Get Low Stock Alerts
```bash
curl http://localhost:3000/api/inventory/alerts
```

### Add Inventory Item
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "RESTAURANT_ID",
    "name": "Beef Tenderloin",
    "category": "Meat",
    "unit": "kg",
    "current_stock": 45,
    "minimum_stock": 20,
    "maximum_stock": 100,
    "unit_cost": 25.50,
    "supplier": "Premium Meats Inc"
  }'
```

### Update Stock (Add Stock)
```bash
curl -X PATCH http://localhost:3000/api/inventory/ITEM_ID/stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 50,
    "transaction_type": "in",
    "reason": "Weekly restock"
  }'
```

### Update Stock (Remove Stock)
```bash
curl -X PATCH http://localhost:3000/api/inventory/ITEM_ID/stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "transaction_type": "out",
    "reason": "Used for orders"
  }'
```

### Get Inventory Transactions
```bash
curl http://localhost:3000/api/inventory/ITEM_ID/transactions
```

## Customer Management

### Get All Customers
```bash
curl http://localhost:3000/api/customers
```

### Search Customers
```bash
curl "http://localhost:3000/api/customers?search=john"
```

### Get Customer Details
```bash
curl http://localhost:3000/api/customers/CUSTOMER_ID
```

### Create Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "RESTAURANT_ID",
    "name": "Sarah Connor",
    "email": "sarah.c@email.com",
    "phone": "+1234567894",
    "address": "999 Tech Blvd, City",
    "preferences": {
      "dietary": "gluten-free",
      "favorite_items": ["Grilled Salmon"]
    }
  }'
```

### Update Customer
```bash
curl -X PATCH http://localhost:3000/api/customers/CUSTOMER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.email@example.com",
    "phone": "+1234567899"
  }'
```

### Add Loyalty Points
```bash
curl -X PATCH http://localhost:3000/api/customers/CUSTOMER_ID/loyalty \
  -H "Content-Type: application/json" \
  -d '{
    "points": 50
  }'
```

## Reservations

### Get All Reservations
```bash
curl http://localhost:3000/api/reservations
```

### Get Reservations by Date
```bash
curl "http://localhost:3000/api/reservations?date=2024-12-01"
```

### Create Reservation
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "RESTAURANT_ID",
    "customer_id": "CUSTOMER_ID",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "customer_email": "john@email.com",
    "reservation_date": "2024-12-01",
    "reservation_time": "19:00:00",
    "party_size": 4,
    "special_requests": "Anniversary dinner"
  }'
```

### Update Reservation Status
```bash
curl -X PATCH http://localhost:3000/api/reservations/RESERVATION_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "seated"
  }'
```

## Analytics

### Get Sales Analytics
```bash
# Today's sales
curl "http://localhost:3000/api/analytics/sales?period=today"

# This week
curl "http://localhost:3000/api/analytics/sales?period=week"

# This month
curl "http://localhost:3000/api/analytics/sales?period=month"

# Custom date range
curl "http://localhost:3000/api/analytics/sales?date_from=2024-11-01&date_to=2024-11-30"
```

### Get Popular Items
```bash
curl "http://localhost:3000/api/analytics/popular-items?limit=10&period=month"
```

### Get Revenue by Day
```bash
curl "http://localhost:3000/api/analytics/revenue-by-day?days=7"
```

### Get Peak Hours
```bash
curl "http://localhost:3000/api/analytics/peak-hours?period=week"
```

### Get Customer Insights
```bash
curl http://localhost:3000/api/analytics/customers
```

### Get Inventory Insights
```bash
curl http://localhost:3000/api/analytics/inventory
```

## AI Agents

### Order Agent (Natural Language Order)
```bash
curl -X POST http://localhost:3000/api/ai/order-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want 2 grilled chicken, 1 caesar salad, and 3 cokes for table 5"
  }'
```

### Inventory Agent (Predict Stock Needs)
```bash
curl -X POST http://localhost:3000/api/ai/inventory-agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "predict"
  }'
```

### Customer Service Agent
```bash
curl -X POST http://localhost:3000/api/ai/customer-service-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your vegetarian options?",
    "customer_id": "CUSTOMER_ID"
  }'
```

### Analytics Agent (Generate Insights)
```bash
curl -X POST http://localhost:3000/api/ai/analytics-agent \
  -H "Content-Type: application/json" \
  -d '{
    "period": "week",
    "focus": "sales"
  }'
```

### Get AI Agent Logs
```bash
curl "http://localhost:3000/api/ai/logs?agent_type=order&limit=20"
```

## Testing Workflow

### Complete Order Flow
```bash
# 1. Get menu
curl http://localhost:3000/api/menu

# 2. Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id":"ID","name":"Test User","phone":"+1234567890"}'

# 3. Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id":"ID","customer_id":"CUSTOMER_ID","order_type":"dine-in","items":[{"menu_item_id":"ITEM_ID","quantity":1}]}'

# 4. Update order status
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# 5. Check analytics
curl "http://localhost:3000/api/analytics/sales?period=today"
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
