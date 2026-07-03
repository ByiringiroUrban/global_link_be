# Global Link Backend

Unified **Node.js + Express + Prisma + PostgreSQL** backend for the Global Link ecommerce and warehouse platform. All REST APIs and AI features (visual search, recommendations, chatbot) run in **one process** on **one port**.

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  backend/ (Node.js + Express)    │────▶│   PostgreSQL    │
│   (React/etc)   │     │  :3000 – REST API + AI routes    │     │   (Prisma ORM)  │
└─────────────────┘     └──────────────────────────────────┘     └─────────────────┘
```

| Component | Stack | Port |
|-----------|-------|------|
| **backend/** | Node.js, Express, TypeScript, Prisma, Sharp | 3000 |
| **postgres** | PostgreSQL 16 | 5432 |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Docker)

### 1. Environment setup

```bash
cp .env.example .env
```

### 2. Start PostgreSQL (Docker)

```bash
docker compose up -d postgres
```

### 3. Run the backend (single terminal)

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

That's it — **one command, one terminal**. All endpoints are at `http://localhost:3000`.

### Or run everything with Docker

```bash
docker compose up --build
```

## API Endpoints

All routes are served from **`http://localhost:3000`**.

### Authentication & Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register user, supplier, or admin |
| POST | `/api/auth/login` | - | Login and receive JWT |
| POST | `/api/auth/forgot-password` | - | Request password reset |
| POST | `/api/auth/reset-password` | - | Reset password with token |
| POST | `/api/auth/verify-email` | - | Verify email address |
| POST | `/api/auth/logout` | JWT | Invalidate session |
| GET | `/api/user/profile` | JWT | Get profile |
| PUT | `/api/user/profile` | JWT | Update profile |
| GET | `/api/user/orders` | JWT | Purchase history (paginated) |

### Dashboards

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard aggregate stats |
| GET | `/api/supplier/inventory` | Supplier | Inventory and recent orders |

### Products & Warehouse

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | - | List products (paginated) |
| GET | `/api/products/:id` | - | Product details |
| POST | `/api/products` | Supplier/Admin | Create product |
| POST | `/api/inventory/update` | Supplier/Admin | Update stock levels |

### Ecommerce

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | JWT | View cart |
| POST | `/api/cart` | JWT | Add item to cart |
| POST | `/api/orders` | JWT | Place order |
| GET | `/api/orders` | JWT | List user orders |
| GET | `/api/orders/:id` | JWT | Track order & shipment |

### AI (same server, same port)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/visual-search` | Upload image (`multipart/form-data`, field: `file`) |
| GET | `/api/ai/recommendations` | Style recommendations (`?style=casual&limit=10`) |
| POST | `/api/ai/chat` | AI chatbot (`{ "message": "..." }`) |

## Seed Accounts

After `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@globallink.com | Admin123! |
| Supplier | supplier@globallink.com | Supplier123! |
| User | user@globallink.com | User123! |

## Authentication

```
Authorization: Bearer <jwt_token>
```

## Project Structure

```
global_link_be/
├── docker-compose.yml
├── .env.example
└── backend/
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── src/
        ├── routes/          # auth, user, admin, products, cart, orders, ai
        ├── services/        # business logic + ai/
        ├── middleware/
        └── utils/
```

## Notes for Frontend Team

- **Single base URL:** `http://localhost:3000`
- No separate AI service or second port needed
- List endpoints support `?page=1&limit=20`
- Product list supports `?search=`, `?category=`, `?supplierId=`
- CORS configured for `FRONTEND_URL` (default `http://localhost:5173`)

## Next Steps

- Replace AI heuristics with real ML models (CLIP, LLM APIs)
- Add payment gateway (Stripe)
- Add Swagger/OpenAPI documentation
