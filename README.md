# 📜 Quotes API

A production-grade REST API that serves random quotes from famous Indian scholars and scientists — built with **Node.js**, **Express**, and **SQLite**. Designed to be deployable anywhere in minutes with zero external dependencies.

---

## 🌟 Project Overview

The Quotes API is a stateless, scalable HTTP service that exposes a curated dataset of 25+ quotes from luminaries such as A.P.J. Abdul Kalam, C.V. Raman, Srinivasa Ramanujan, Jagadish Chandra Bose, and more. The architecture is deliberately simple — one file-based SQLite database, no background processes — making it trivial to run locally or deploy on a PaaS like Render.

---

## ✨ Features

| Feature | Detail |
|---|---|
| **Random quote endpoint** | Scalable offset-based selection (no `ORDER BY RANDOM()`) |
| **Health check** | `/api/v1/health` — uptime + timestamp |
| **Rate limiting** | 60 req / min / IP via `express-rate-limit` |
| **Security headers** | `helmet` + `cors` |
| **Structured logging** | `pino` with pretty-print in dev, JSON in prod |
| **Graceful shutdown** | SIGTERM / SIGINT handling with connection cleanup |
| **Redis-ready** | Drop-in store swap when you need distributed rate limiting |
| **Zero external DB** | SQLite file — no Postgres, no MongoDB, no setup |

---

## 🛠️ Tech Stack

- **Runtime** — Node.js 18+ LTS
- **Framework** — Express.js 4
- **Database** — SQLite via `better-sqlite3`
- **Logging** — `pino` + `pino-pretty`
- **Security** — `helmet`, `cors`
- **Rate limiting** — `express-rate-limit`
- **Config** — `dotenv`

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18 or newer (`node -v`)
- npm 9 or newer (`npm -v`)

### 1 — Clone & install

```bash
git clone https://github.com/your-username/quotes-api.git
cd quotes-api
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env if you want to change PORT or DB_PATH
```

### 3 — Seed the database

```bash
npm run seed
```

You should see:
```
✅  Seed complete — 25 new row(s) inserted. Total in DB: 25
```

### 4 — Start the server

```bash
# Development (with pretty logs + auto-restart via nodemon)
npm run dev

# Production
npm start
```

The server will be live at `http://localhost:3000`.

---

## 📡 API Endpoints

### `GET /api/v1/quote`

Returns a single random quote.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "quote": {
      "id": 4,
      "quote": "Dream is not that which you see while sleeping; it is something that does not let you sleep.",
      "author": "A.P.J. Abdul Kalam"
    }
  }
}
```

---

### `GET /api/v1/health`

Health check — used by load balancers and uptime monitors.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 42.317,
    "timestamp": "2024-06-01T10:00:00.000Z",
    "service": "quotes-api"
  }
}
```

---

### Error responses

All errors follow the same shape:

```json
{
  "success": false,
  "error": "Route GET /api/v1/does-not-exist not found."
}
```

| Status | Scenario |
|---|---|
| `404` | Route or resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 🧪 Example Requests (curl)

```bash
# Random quote
curl http://localhost:3000/api/v1/quote

# Health check
curl http://localhost:3000/api/v1/health

# With pretty JSON output (requires jq)
curl -s http://localhost:3000/api/v1/quote | jq .

# Check rate-limit headers
curl -I http://localhost:3000/api/v1/quote
```

---

## ☁️ Deployment on Render

Render is a great free-tier PaaS for Node.js APIs. Here's how to deploy:

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial production API"
git remote add origin https://github.com/your-username/quotes-api.git
git push -u origin main
```

### Step 2 — Create a Render Web Service

1. Log in at [render.com](https://render.com) and click **New → Web Service**
2. Connect your GitHub repo
3. Fill in the settings:

| Field | Value |
|---|---|
| **Name** | `quotes-api` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run seed` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or Starter for always-on) |

### Step 3 — Add Environment Variables

In **Environment → Add Environment Variable**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render sets this automatically)* |
| `DB_PATH` | `./database/quotes.db` |

> ⚠️ **Persistent disk note:** Render's free tier has an ephemeral filesystem — the DB resets on each deploy. To persist data across deploys, attach a **Render Disk** (paid) mounted at `/var/data` and set `DB_PATH=/var/data/quotes.db`. The seed script is idempotent and safe to re-run.

### Step 4 — Deploy

Click **Create Web Service**. Render will build, seed, and start your API. You'll get a public URL like:

```
https://quotes-api-xxxx.onrender.com/api/v1/quote
```

### Step 5 — Verify

```bash
curl https://quotes-api-xxxx.onrender.com/api/v1/health
```

---

## 🏗️ Project Structure

```
quotes-api/
├── src/
│   ├── app.js              # Express app factory (middlewares + routes)
│   ├── server.js           # HTTP server + graceful shutdown
│   ├── config/
│   │   ├── env.js          # Centralised env var access
│   │   ├── database.js     # SQLite singleton connection
│   │   └── logger.js       # Pino logger instance
│   ├── controllers/
│   │   └── quoteController.js
│   ├── routes/
│   │   └── quoteRoutes.js
│   ├── services/
│   │   └── quoteService.js # Business logic + scalable random query
│   ├── middleware/
│   │   ├── rateLimiter.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   └── utils/
│       └── response.js     # sendSuccess / sendError helpers
├── database/
│   ├── init.sql            # Raw schema (informational)
│   └── seed.js             # Idempotent seed script
├── .env.example
├── package.json
└── README.md
```

---

## 🔌 Redis (Optional — Future Scaling)

The rate limiter uses an in-memory store by default. When you need distributed rate limiting across multiple instances, swap the store in `src/middleware/rateLimiter.js`:

```js
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');

const redisClient = createClient({ url: env.REDIS_URL });
await redisClient.connect();

const rateLimiter = rateLimit({
  // ... existing config ...
  store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
});
```

Set `REDIS_URL` in your `.env` and install the packages:

```bash
npm install rate-limit-redis redis
```

No other changes required — the rest of the codebase remains stateless.

---

## 📄 License

MIT
