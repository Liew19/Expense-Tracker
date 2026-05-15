# Expense Tracker — Accordia Assessment

Full-stack expense management app. JWT auth, CRUD, filters, pagination, i18n.

**Stack**: React 19 + Vite + Tailwind v4 + shadcn/ui → Express 5 → MySQL

---

## Running it

```bash
# Prerequisites: Node 18+, MySQL running locally

mysql -u root -p -e "CREATE DATABASE expense_tracker"

cd server && npm install && cp .env.example .env
mysql -u root -p expense_tracker < server/database.sql
npm run dev            # → localhost:5000

cd client && npm install
npm run dev            # → localhost:5173
```

Open `localhost:5173`, register an account, done.

---

## Tech choices (the opinions that matter)

**MySQL over MongoDB**: Expenses are relational — user_id, amounts, categories, dates. I want `SUM() GROUP BY` without the aggregation pipeline circus. Foreign keys prevent orphan records. Prepared statements via `mysql2` handle injection.

**React Query over useState/useEffect**: Have you ever traced a `useEffect` dependency bug at 2am? Didn't think so. React Query gives me caching, background refetch, and mutation invalidation in ~40 lines. The delete flow is one `useMutation` call — no loading flags to manage.

**bcryptjs over bcrypt**: bcrypt needs native compilation. On Windows that's a headache. bcryptjs is pure JS and indistinguishable for auth at this scale.

**Custom i18n over react-i18next**: Two locale files. I don't need a framework for that. Context provider + JSON, done.

**shadcn/ui**: I wanted shadcn's calendar popover and select components. Own the code, no black-box dependency.

**Express 5**: Async error handling is built in. No `asyncHandler` wrappers needed.

---

## What's janky / what I'd fix

- **No migrations** — raw SQL in `database.sql`. Real project needs Knex or Drizzle.
- **Client-side pagination** — fetches all records, paginates in JS. Fine for <500 rows, breaks past that.
- **Repetitive error handling** — every controller has the same `try/catch → 500`. Needs a global error middleware.
- **No tests** — 7 days, cut scope. Would add Jest + RTL.
- **`server/.env` is committed** — it shouldn't be. The `.env.example` is the right pattern but the actual `.env` snuck in. Remove before sharing publicly.

---

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Returns JWT |
| GET | `/api/expenses` | Yes | List user's expenses |
| GET | `/api/expenses/:id` | Yes | Single expense |
| POST | `/api/expenses` | Yes | Create |
| PUT | `/api/expenses/:id` | Yes | Update |
| DELETE | `/api/expenses/:id` | Yes | Soft delete |

**JWT payload**: `{ id, username, email }` — 7 day expiry.

---

*Accordia technical assessment, May 2026.*
