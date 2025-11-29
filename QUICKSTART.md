# Quick Start Guide

Get your restaurant management system running in 10 minutes!

## Prerequisites

- Node.js 16+ installed
- PostgreSQL database (or Supabase account)
- OpenRouter API key (for AI features)

## Option 1: Local Development (Fastest)

### Step 1: Clone Repository
```bash
git clone https://github.com/vansh241102-ops/restaurant-management-mvp.git
cd restaurant-management-mvp/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Database

**Using Supabase (Recommended)**:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Copy contents of `database/schema.sql` and execute
5. (Optional) Execute `database/sample-data.sql` for test data
6. Copy connection string from Settings > Database

**Using Local PostgreSQL**:
```bash
# Create database
createdb restaurant_db

# Run schema
psql restaurant_db < ../database/schema.sql

# (Optional) Add sample data
psql restaurant_db < ../database/sample-data.sql
```

### Step 4: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_random_secret_key
OPENROUTER_API_KEY=your_openrouter_key
CORS_ORIGIN=*
```

### Step 5: Start Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Step 6: Test API
```bash
# Health check
curl http://localhost:3000/health

# Get menu
curl http://localhost:3000/api/menu

# Get analytics
curl http://localhost:3000/api/analytics/sales?period=today
```

✅ **You're ready!** API is running at `http://localhost:3000`

## Option 2: Cloud Deployment (Production)

### Step 1: Setup Supabase Database
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Execute `database/schema.sql` in SQL Editor
4. (Optional) Execute `database/sample-data.sql`
5. Copy connection string

### Step 2: Deploy to Railway
1. Fork this repository to your GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your forked repository
5. Railway will auto-detect and deploy

### Step 3: Configure Environment Variables
In Railway dashboard, add:
```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=generate_random_string
OPENROUTER_API_KEY=your_openrouter_key
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
```

### Step 4: Get Your API URL
Railway provides a URL like: `https://your-app.railway.app`

### Step 5: Test Deployment
```bash
curl https://your-app.railway.app/health
curl https://your-app.railway.app/api/menu
```

✅ **Live and deployed!**

## Getting OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to Keys section
3. Create new API key
4. Add $5-10 credits (AI features cost ~$0.001 per request)
5. Copy key to `.env` file

## Testing the System

### 1. Check Menu
```bash
curl http://localhost:3000/api/menu
```

### 2. Create a Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "YOUR_RESTAURANT_ID",
    "name": "Test Customer",
    "phone": "+1234567890",
    "email": "test@example.com"
  }'
```

### 3. Place an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "YOUR_RESTAURANT_ID",
    "customer_id": "CUSTOMER_ID_FROM_STEP_2",
    "order_type": "dine-in",
    "table_number": "5",
    "items": [
      {
        "menu_item_id": "MENU_ITEM_ID",
        "quantity": 2
      }
    ]
  }'
```

### 4. Try AI Order Agent
```bash
curl -X POST http://localhost:3000/api/ai/order-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want 2 pizzas and 3 cokes for table 8"
  }'
```

### 5. Check Analytics
```bash
curl http://localhost:3000/api/analytics/sales?period=today
```

## Common Issues

### Database Connection Error
- Verify DATABASE_URL is correct
- Check database is running
- For Supabase: Ensure project is active

### AI Agent Errors
- Verify OPENROUTER_API_KEY is set
- Check you have credits in OpenRouter account
- Test with a simple request first

### Port Already in Use
```bash
# Change PORT in .env to different number
PORT=3001
```

### CORS Errors
```bash
# Set CORS_ORIGIN to your frontend URL
CORS_ORIGIN=http://localhost:5173
```

## Next Steps

### 1. Explore API
- Read `API_EXAMPLES.md` for all endpoints
- Test different features
- Try AI agents

### 2. Add Sample Data
```bash
# If you haven't already
psql your_database < database/sample-data.sql
```

### 3. Customize
- Modify menu categories
- Adjust tax rate in `orders.js`
- Add your restaurant details

### 4. Build Frontend
- Create React dashboard
- Use API endpoints
- Add real-time updates

### 5. Extend Features
- Add authentication
- Implement payment gateway
- Create mobile app

## Project Structure

```
restaurant-management-mvp/
├── backend/
│   ├── src/
│   │   └── routes/          # API endpoints
│   │       ├── menu.js      # Menu management
│   │       ├── orders.js    # Order processing
│   │       ├── inventory.js # Stock management
│   │       ├── customers.js # Customer profiles
│   │       ├── analytics.js # Reports & insights
│   │       ├── reservations.js # Table bookings
│   │       └── ai-agents.js # AI features
│   ├── server.js            # Main server file
│   ├── package.json         # Dependencies
│   └── .env                 # Configuration
├── database/
│   ├── schema.sql           # Database structure
│   └── sample-data.sql      # Test data
├── README.md                # Overview
├── DEPLOYMENT.md            # Deployment guide
├── API_EXAMPLES.md          # API documentation
├── FEATURES.md              # Feature list
└── QUICKSTART.md            # This file
```

## Resources

- **Documentation**: See `README.md` and `FEATURES.md`
- **API Examples**: See `API_EXAMPLES.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Database Schema**: See `database/schema.sql`

## Support

Having issues? Check:
1. Server logs for errors
2. Database connection
3. Environment variables
4. API endpoint URLs

## What's Included

✅ Complete REST API  
✅ PostgreSQL database with schema  
✅ 4 AI agents (Order, Inventory, Customer Service, Analytics)  
✅ Menu management  
✅ Order processing  
✅ Inventory tracking  
✅ Customer profiles  
✅ Reservations  
✅ Analytics & reporting  
✅ Sample data  
✅ Deployment configs  
✅ Comprehensive documentation  

## Time to First Order

From zero to processing orders:
- **Local setup**: ~10 minutes
- **Cloud deployment**: ~15 minutes
- **With sample data**: Ready immediately!

Happy building! 🚀
