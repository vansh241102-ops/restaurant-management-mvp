# System Architecture

## Overview

The Restaurant Management MVP is built with a modern, scalable architecture using Node.js, PostgreSQL, and AI integration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Web    │  │  Mobile  │  │   POS    │  │  Admin   │       │
│  │Dashboard │  │   App    │  │ Terminal │  │  Panel   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                      │ HTTP/REST API
                      │
┌─────────────────────▼─────────────────────────────────────────┐
│                    API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Express.js Server                        │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │    │
│  │  │   CORS     │  │   Logger   │  │   Error    │     │    │
│  │  │ Middleware │  │ Middleware │  │  Handler   │     │    │
│  │  └────────────┘  └────────────┘  └────────────┘     │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────┬───────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│   Business   │ │     AI      │ │  Database  │
│    Logic     │ │   Agents    │ │   Access   │
│    Layer     │ │    Layer    │ │   Layer    │
└───────┬──────┘ └──────┬──────┘ └─────┬──────┘
        │               │               │
┌───────▼───────────────▼───────────────▼──────────────────────┐
│                    SERVICE LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Menu   │  │  Orders  │  │Inventory │  │Customers │    │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Analytics │  │Reserv.   │  │   AI     │  │  Logs    │    │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────┬───────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│  PostgreSQL  │ │ OpenRouter  │ │   Cache    │
│   Database   │ │  AI API     │ │  (Future)  │
│  (Supabase)  │ │             │ │            │
└──────────────┘ └─────────────┘ └────────────┘
```

## Component Details

### 1. Client Layer
**Purpose**: User interfaces for different roles

**Components**:
- **Web Dashboard**: Admin and manager interface
- **Mobile App**: Waiter and customer apps (future)
- **POS Terminal**: Point of sale system (future)
- **Admin Panel**: System configuration

### 2. API Gateway Layer
**Technology**: Express.js

**Responsibilities**:
- Route incoming requests
- Apply middleware (CORS, logging, auth)
- Handle errors globally
- Request validation
- Response formatting

**Key Files**:
- `server.js` - Main server setup
- Middleware stack

### 3. Business Logic Layer
**Purpose**: Core application logic

**Components**:

#### Route Handlers
- `menu.js` - Menu CRUD operations
- `orders.js` - Order processing
- `inventory.js` - Stock management
- `customers.js` - Customer profiles
- `analytics.js` - Reports generation
- `reservations.js` - Booking management
- `ai-agents.js` - AI integration

#### AI Agents
- **Order Agent**: NLP order processing
- **Inventory Agent**: Stock prediction
- **Customer Service Agent**: Query handling
- **Analytics Agent**: Insight generation

### 4. Data Layer
**Technology**: PostgreSQL (via Supabase)

**Key Tables**:
- `restaurants` - Restaurant info
- `menu_categories` - Menu organization
- `menu_items` - Products
- `orders` - Order records
- `order_items` - Line items
- `customers` - Customer profiles
- `inventory_items` - Stock items
- `inventory_transactions` - Stock movements
- `reservations` - Bookings
- `ai_agent_logs` - AI interactions

## Data Flow

### Order Creation Flow
```
1. Client sends POST /api/orders
   ↓
2. Express receives request
   ↓
3. Order route handler validates data
   ↓
4. Begin database transaction
   ↓
5. Fetch menu item prices
   ↓
6. Calculate totals (subtotal, tax, total)
   ↓
7. Create order record
   ↓
8. Create order items
   ↓
9. Update customer stats
   ↓
10. Commit transaction
    ↓
11. Return order with items
    ↓
12. Client receives response
```

### AI Agent Flow
```
1. Client sends POST /api/ai/order-agent
   ↓
2. Agent receives message + context
   ↓
3. Fetch relevant data (menu, customer)
   ↓
4. Build AI prompt with context
   ↓
5. Call OpenRouter API
   ↓
6. Parse AI response
   ↓
7. Log interaction to database
   ↓
8. Return structured response
   ↓
9. Client processes AI output
```

## Database Schema

### Core Relationships
```
restaurants (1) ──→ (N) menu_categories
restaurants (1) ──→ (N) menu_items
restaurants (1) ──→ (N) customers
restaurants (1) ──→ (N) orders
restaurants (1) ──→ (N) inventory_items
restaurants (1) ──→ (N) reservations

menu_categories (1) ──→ (N) menu_items

customers (1) ──→ (N) orders
customers (1) ──→ (N) reservations

orders (1) ──→ (N) order_items
menu_items (1) ──→ (N) order_items

inventory_items (1) ──→ (N) inventory_transactions
```

### Key Indexes
- `orders.restaurant_id` - Fast restaurant queries
- `orders.customer_id` - Customer order history
- `orders.status` - Status filtering
- `orders.created_at` - Time-based queries
- `menu_items.category_id` - Category filtering
- `customers.phone` - Customer lookup

## API Design

### RESTful Principles
- **Resources**: Nouns (menu, orders, customers)
- **HTTP Methods**: GET, POST, PATCH, DELETE
- **Status Codes**: 200, 201, 400, 404, 500
- **JSON Format**: Consistent response structure

### Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message"
}
```

## Security Architecture

### Current Implementation
- Environment variables for secrets
- Parameterized SQL queries (SQL injection prevention)
- CORS configuration
- Input validation

### Future Enhancements
- JWT authentication
- Role-based access control (RBAC)
- Rate limiting
- API key management
- Encryption at rest
- HTTPS enforcement

## Scalability Considerations

### Current Design
- Stateless API (horizontal scaling ready)
- Database connection pooling
- Efficient queries with indexes
- Transaction management

### Future Optimizations
- Redis caching layer
- CDN for static assets
- Database read replicas
- Load balancing
- Microservices architecture
- Message queue (RabbitMQ/Redis)
- WebSocket for real-time updates

## Deployment Architecture

### Development
```
Local Machine
├── Node.js Server (localhost:3000)
└── PostgreSQL Database (local or Supabase)
```

### Production
```
Railway (Backend)
├── Node.js Server (auto-scaled)
├── Environment Variables
└── Health Monitoring

Supabase (Database)
├── PostgreSQL Database
├── Automatic Backups
└── Connection Pooling

OpenRouter (AI)
└── LLM API
```

## Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+
- **ORM**: Native pg driver
- **AI**: OpenRouter API

### Database
- **Primary**: PostgreSQL (Supabase)
- **Features**: JSONB, UUID, Triggers, Indexes

### DevOps
- **Hosting**: Railway
- **Database**: Supabase
- **Version Control**: Git/GitHub
- **CI/CD**: Railway auto-deploy

### External Services
- **AI**: OpenRouter (Meta Llama 3.1)
- **Future**: Stripe, Twilio, SendGrid

## Performance Metrics

### Target Performance
- API Response Time: < 200ms
- Database Query Time: < 50ms
- AI Agent Response: < 2s
- Concurrent Users: 100+
- Orders per Hour: 1000+

### Monitoring Points
- API endpoint latency
- Database query performance
- AI agent success rate
- Error rates
- Resource utilization

## Error Handling

### Levels
1. **Route Level**: Input validation
2. **Service Level**: Business logic errors
3. **Database Level**: Transaction rollback
4. **Global Level**: Catch-all error handler

### Logging
- Request logging (method, path, timestamp)
- Error logging (stack traces in dev)
- AI interaction logging (database)

## Future Architecture

### Microservices Vision
```
API Gateway
├── Menu Service
├── Order Service
├── Inventory Service
├── Customer Service
├── Analytics Service
└── AI Service

Message Queue (RabbitMQ)
├── Order Events
├── Inventory Events
└── Notification Events

Cache Layer (Redis)
├── Menu Cache
├── Session Cache
└── Analytics Cache
```

### Event-Driven Architecture
- Order placed → Update inventory
- Order completed → Update analytics
- Low stock → Notify manager
- New customer → Send welcome email

## Best Practices Implemented

1. **Separation of Concerns**: Routes, logic, data access
2. **DRY Principle**: Reusable functions
3. **Error Handling**: Comprehensive try-catch
4. **Transactions**: ACID compliance
5. **Validation**: Input sanitization
6. **Documentation**: Inline comments
7. **Consistent Naming**: Clear conventions
8. **Environment Config**: Secure secrets

## Conclusion

This architecture provides:
- ✅ Scalability for growth
- ✅ Maintainability through clean code
- ✅ Reliability with transactions
- ✅ Extensibility for new features
- ✅ Performance through optimization
- ✅ Security through best practices
