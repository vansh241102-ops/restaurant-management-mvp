# Deployment Guide

## Prerequisites

1. **Supabase Account** - For PostgreSQL database
2. **Railway Account** - For backend deployment
3. **OpenRouter API Key** - For AI agents

## Step 1: Setup Database (Supabase)

1. Create a new project on [Supabase](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL to create all tables
5. Copy your database connection string from Settings > Database

## Step 2: Deploy Backend (Railway)

### Option A: Deploy from GitHub

1. Go to [Railway](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select this repository
4. Railway will auto-detect and deploy

### Option B: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Set Environment Variables

In Railway dashboard, add these variables:

```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_random_secret_key
OPENROUTER_API_KEY=your_openrouter_key
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
```

## Step 3: Get OpenRouter API Key

1. Sign up at [OpenRouter](https://openrouter.ai)
2. Go to Keys section
3. Create a new API key
4. Add it to Railway environment variables

## Step 4: Test Deployment

Once deployed, Railway will provide a URL like: `https://your-app.railway.app`

Test the API:

```bash
# Health check
curl https://your-app.railway.app/health

# Get menu
curl https://your-app.railway.app/api/menu

# Get analytics
curl https://your-app.railway.app/api/analytics/sales
```

## Step 5: Initialize Sample Data (Optional)

You can add sample menu items, categories, and inventory through the API:

```bash
# Create menu category
curl -X POST https://your-app.railway.app/api/menu/categories \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "your_restaurant_id",
    "name": "Main Course",
    "description": "Delicious main dishes"
  }'

# Create menu item
curl -X POST https://your-app.railway.app/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "your_restaurant_id",
    "category_id": "category_id",
    "name": "Grilled Chicken",
    "description": "Tender grilled chicken with herbs",
    "price": 15.99,
    "is_vegetarian": false
  }'
```

## API Documentation

### Base URL
```
https://your-app.railway.app/api
```

### Endpoints

#### Menu
- `GET /menu` - List all menu items
- `GET /menu/:id` - Get menu item details
- `POST /menu` - Create menu item
- `PATCH /menu/:id` - Update menu item
- `DELETE /menu/:id` - Delete menu item

#### Orders
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status

#### Inventory
- `GET /inventory` - List inventory items
- `GET /inventory/alerts` - Get low stock alerts
- `POST /inventory` - Add inventory item
- `PATCH /inventory/:id/stock` - Update stock levels

#### Customers
- `GET /customers` - List customers
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create customer
- `PATCH /customers/:id` - Update customer

#### Analytics
- `GET /analytics/sales` - Sales analytics
- `GET /analytics/popular-items` - Popular menu items
- `GET /analytics/revenue-by-day` - Daily revenue
- `GET /analytics/peak-hours` - Peak hours analysis

#### AI Agents
- `POST /ai/order-agent` - Process natural language orders
- `POST /ai/inventory-agent` - Predict stock needs
- `POST /ai/customer-service-agent` - Handle customer queries
- `POST /ai/analytics-agent` - Generate insights

## Monitoring

- **Railway Dashboard**: Monitor logs, metrics, and deployments
- **Supabase Dashboard**: Monitor database performance and queries
- **AI Logs**: Check `/api/ai/logs` for AI agent interactions

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure IP allowlist includes Railway IPs (or set to allow all)

### AI Agent Errors
- Verify OPENROUTER_API_KEY is set
- Check OpenRouter account has credits
- Review AI logs at `/api/ai/logs`

### Deployment Failures
- Check Railway build logs
- Verify all dependencies in package.json
- Ensure Node.js version compatibility

## Next Steps

1. **Add Authentication** - Implement JWT-based auth for staff
2. **Build Frontend** - Create React dashboard
3. **Add Webhooks** - Integrate with payment providers
4. **Mobile App** - Build React Native apps
5. **Real-time Updates** - Add WebSocket support

## Support

For issues or questions:
- Check Railway logs
- Review Supabase logs
- Check AI agent logs at `/api/ai/logs`
