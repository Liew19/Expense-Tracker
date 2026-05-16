# Expense Tracker

## Setup

```bash
mysql -u root -p -e "CREATE DATABASE expense_tracker"
npm install
cp server\.env.example server\.env
npm run dev
```

Open http://localhost:5173, register, login.

> Tables auto-create on server start (database must exist first).
> Manual SQL: `mysql -u root -p < server/init.sql`

## Deploy to Vercel

`api/index.js` → API, `client/dist` → static. Set [env vars](#environment-variables) in dashboard. Tables won't auto-create — run `init.sql` against production DB first.

## Env Vars

| Key | Default |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | |
| `DB_NAME` | `expense_tracker` |
| `DB_PORT` | `3306` |
| `DB_SSL` | `false` |
| `JWT_SECRET` | (change in production) |
| `PORT` | `5000` |

## API

| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/expenses` | Yes |
| GET | `/api/expenses/:id` | Yes |
| POST | `/api/expenses` | Yes |
| PUT | `/api/expenses/:id` | Yes |
| DELETE | `/api/expenses/:id` | Yes |
| GET | `/api/health` | No |
| GET | `/api/db-check` | No |
