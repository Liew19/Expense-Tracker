# Expense Tracker — Accordia Assessment

Full-stack expense management app. JWT auth, CRUD, filters, pagination, i18n.

**Stack**: React 19 + Express 5 + MySQL (works with TiDB)

---

## Local Setup

Requires **Node 18+** and **MySQL** running locally.

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE expense_tracker"

# 2. Install all dependencies (root npm workspaces)
npm install

# 3. Configure env
cp server\.env.example server\.env     # Windows
# cp server/.env.example server/.env   # Linux/Mac

# 4. Start both server + client (or use two terminals)
npm run dev

# Or run them separately:
npm run dev:server   # Terminal 1 → localhost:5000
npm run dev:client   # Terminal 2 → localhost:5173
```

Open **http://localhost:5173**.

**Test login**: `test@accordia.com` / `accordia123`

> Tables are auto-created on first server start. No manual SQL needed.
> Click **"Load Sample Data"** on the home page to seed 20 test records.

---

## Vercel Deploy

The app is configured for Vercel deployment (`api/index.js` as serverless function + `client/dist` as static output).

### Required env vars in Vercel Dashboard:

| Key | Description |
|---|---|
| `DB_HOST` | MySQL / TiDB host |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name (e.g. `expense_tracker`) |
| `DB_PORT` | Port (default `3306`) |
| `DB_SSL` | `true` for remote DB |
| `JWT_SECRET` | Your secret key for JWT signing |

---

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT token |
| GET | `/api/expenses` | Yes | List expenses (pagination, filters) |
| GET | `/api/expenses/:id` | Yes | Get single expense |
| POST | `/api/expenses` | Yes | Create expense |
| PUT | `/api/expenses/:id` | Yes | Update expense |
| DELETE | `/api/expenses/:id` | Yes | Soft-delete expense |
| POST | `/api/seed` | Yes | Insert 20 sample records |
| GET | `/api/health` | No | Health check |

### Query params for `GET /api/expenses`

| Param | Type | Example |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `10` |
| `type` | `income` / `expense` / `all` | `expense` |
| `month` | string (YYYY-MM) | `2026-05` |
| `date` | string (YYYY-MM-DD) | `2026-05-01` |
