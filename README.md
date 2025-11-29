# Restaurant Management MVP

AI-powered restaurant management system with multiple intelligent agents.

## Features

### Core Modules
- **Order Management** - Take and track orders with AI assistance
- **Menu Management** - Dynamic menu with categories and pricing
- **Inventory Tracking** - Real-time stock monitoring with alerts
- **Customer Management** - Customer profiles and order history
- **Analytics Dashboard** - Sales, revenue, and performance metrics

### AI Agents
- **Order Agent** - Voice/text order processing with recommendations
- **Inventory Agent** - Predictive stock management and auto-ordering
- **Customer Service Agent** - Handle queries and reservations
- **Analytics Agent** - Generate insights and reports

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase)
- **Frontend**: React + Vite
- **AI**: OpenRouter for LLM capabilities
- **Deployment**: Railway

## Project Structure

```
restaurant-management-mvp/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── agents/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── database/
    └── schema.sql
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

```env
DATABASE_URL=your_supabase_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_key
```

## API Endpoints

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order status

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add menu item
- `PATCH /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Add inventory item
- `PATCH /api/inventory/:id` - Update stock levels

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Add customer
- `GET /api/customers/:id` - Get customer details

### Analytics
- `GET /api/analytics/sales` - Sales analytics
- `GET /api/analytics/popular-items` - Popular menu items
- `GET /api/analytics/revenue` - Revenue reports

## License

MIT
