# Expense Tracker — Accordia Assessment

Full-stack expense management app. JWT auth, CRUD, filters, pagination, i18n.

**Stack**: React 19 + Express 5 + MySQL

---

## Setup

Requires Node 18+ and MySQL running locally.

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE expense_tracker"

# 2. Server
cd server
npm install
copy .env.example .env       # Windows
# cp .env.example .env       # Linux/Mac
mysql -u root -p expense_tracker < database.sql
npm run seed                 # adds test user + sample data
npm run dev                  # Terminal 1 → localhost:5000

# 3. Client (new terminal)
cd client
npm install
npm run dev                  # Terminal 2 → localhost:5173
```

Open `localhost:5173`.

**Test login**: `test@accordia.com` / `accordia123`

---

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
