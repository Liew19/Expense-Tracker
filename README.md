# Expense Tracker

Accordia assessment — full-stack expense management app.

React 19 + Express 5 + MySQL. JWT auth, CRUD, filters, pagination, i18n.

---

## Getting Started

Node 18+ and a local MySQL instance.

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE expense_tracker"

# 2. Install dependencies (one shot — npm workspaces)
npm install

# 3. Env vars
cp server\.env.example server\.env

# 4. Start both server + client
npm run dev

# Or separately:
npm run dev:server   # Terminal 1 → localhost:5000
npm run dev:client   # Terminal 2 → localhost:5173
```

Open http://localhost:5173.

**Test login**: `test@accordia.com` / `accordia123`

> Tables are created automatically on first start. No manual SQL.
> Click "Load Sample Data" on the home page to insert 20 records.

---

## Deploy to Vercel

The `api/index.js` serverless function handles API routes, `client/dist` is the static output.

### Env vars to set in Vercel Dashboard:

| Key | Description |
|---|---|
| `DB_HOST` | Your MySQL / TiDB host |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name (e.g. `expense_tracker`) |
| `DB_PORT` | Port (default `3306`) |
| `DB_SSL` | `true` for remote databases |
| `JWT_SECRET` | Secret key for signing tokens |

---

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/expenses` | Yes | List (paginated, filterable) |
| GET | `/api/expenses/:id` | Yes | Get one |
| POST | `/api/expenses` | Yes | Create |
| PUT | `/api/expenses/:id` | Yes | Update |
| DELETE | `/api/expenses/:id` | Yes | Soft delete |
| POST | `/api/seed` | Yes | Insert 20 sample records |
| GET | `/api/health` | No | Health check |