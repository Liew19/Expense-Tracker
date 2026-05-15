# Expense Tracker — Accordia Assessment

Full-stack expense management app. JWT auth, CRUD, filters, pagination, i18n.

**Stack**: React 19 + Express 5 + MySQL

---

## Setup

```bash
mysql -u root -p -e "CREATE DATABASE expense_tracker"

cd server && npm install && cp .env.example .env
mysql -u root -p expense_tracker < server/database.sql
npm run dev

cd client && npm install
npm run dev
```

Open `localhost:5173`, register, go.

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
