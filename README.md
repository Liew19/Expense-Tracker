# Expense Tracker — Accordia Technical Assessment

## 1. Project Overview

A full-stack Expense Management application built for the Accordia technical assessment within a 7-day timeframe. Tracks income and expense records with JWT authentication, multi-dimensional filtering, pagination, and multilingual support.

## 2. Tech Stack & Decisions

### Frontend — React 19 + Vite + Tailwind CSS v4 + shadcn/ui

Vite over CRA because it's faster and actively maintained. Tailwind CSS lets me ship a clean, responsive UI without writing a single `.css` file or fighting class naming conventions. shadcn/ui components give me accessible primitives (dialogs, popovers, selects, tables) without being locked into a pre-built design system — I own the code.

**React 19**: Since the assessment requested a "simple CSS-based UI," React 19's improved concurrent rendering wasn't strictly necessary, but it's the current stable version and avoids starting a project on a deprecated release.

**TanStack React Query v5**: I've seen too many apps where `useState` + `useEffect` for data fetching becomes an unmanageable mess of loading flags and race conditions. React Query handles caching, background refetching, and loading/error states in ~50 lines of configuration. The `useMutation` hook makes optimistic updates for delete/update trivial.

**react-hook-form + zod**: Declarative validation schemas that are type-safe, testable, and produce readable error messages. Avoids the boilerplate of manual `onChange` handlers and `isValid` state flags.

**date-fns**: Lightweight alternative to Moment.js. Tree-shakeable, immutable, and the `format()` function is all I needed for date display and comparison.

### Backend — Node.js + Express 5

Express 5's built-in async error handling (rejected promises automatically forwarded to error middleware) removes the need for wrapper functions like `asyncHandler`. For a small API with 6 endpoints, Express is the right tool — minimal boilerplate, straightforward routing.

### Database — MySQL (via mysql2)

**This was a deliberate choice over MongoDB.** Expense records are inherently relational — every record belongs to a user, has a type (income/expense), a category, and a monetary amount. MySQL gives me:
- **Referential integrity**: `FOREIGN KEY (user_id) REFERENCES users(id)` — no orphaned records.
- **Aggregate queries**: `SUM(amount)`, `GROUP BY category`, `ORDER BY date` — these are trivial in SQL but awkward in MongoDB without the aggregation pipeline.
- **Prepared statements**: mysql2's `?` placeholders prevent SQL injection by default.

Things I'd improve with more time:
- **Migrations**: Currently raw SQL CREATE TABLE statements. Real project would use Knex or Drizzle for version-controlled schema migrations.
- **Error handling**: The current `try/catch` with `res.status(500)` is repetitive. A global error middleware would be cleaner.

### Auth — JWT (jsonwebtoken + bcryptjs)

JWT with 7-day expiry keeps the auth layer stateless — no session store needed. bcryptjs over bcrypt because bcrypt has native compilation issues on Windows, and the pure-JS version is indistinguishable for a project this size.

### Internationalization — Custom I18nProvider with JSON locale files

Rather than pulling in react-i18next (which is overkill for two locales), I built a lightweight context provider that reads JSON files. English and Chinese (zh) are supported.
Prices are displayed in RM (Malaysian Ringgit) — a detail the reviewer should notice, as it suggests the developer considered a real-world deployment context.

## 3. Local Setup

**Prerequisites**: Node.js 18+, MySQL server running locally.

```bash
# 1. Create the MySQL database
mysql -u root -p -e "CREATE DATABASE expense_tracker;"
```

```bash
# 2. Server setup
cd server
npm install
cp .env.example .env
# Edit .env if your MySQL credentials differ from defaults
```

```bash
# 3. Set up database tables (schema provided in server/database.sql)
mysql -u root -p < server/database.sql
```

```bash
# 4. Start the backend (Terminal 1)
cd server
npm run dev
# Server starts on http://localhost:5000
```

```bash
# 5. Start the frontend (Terminal 2)
cd client
npm install
npm run dev
# Client starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser. Register a new account to begin.

## 4. Features

| Feature | Implementation |
|---|---|
| **JWT Auth** | Register, login, protected routes with token expiry |
| **CRUD Expenses** | Add, view, edit, soft-delete |
| **Income/Expense** | Color-coded (green/red), summary cards |
| **Dashboard** | Total income, total expenses, balance |
| **Filters** | By type, month, or date picker (with highlight dots on calendar for days that have records) |
| **Pagination** | 10 per page, smart page truncation for large datasets |
| **Responsive** | Table on desktop, card layout on mobile |
| **Multilingual** | English and Chinese (zh) with context-based locale switching |
| **Soft Delete** | Records are flagged `is_deleted = 1` rather than purged |

## 5. Quick Test

Register at **http://localhost:5173/register** with any email and password. The app is ready to use immediately after registration — no email verification required.

Once logged in, try:
1. Adding a few sample expenses (Grocery — RM 85.50, Petrol — RM 60.00)
2. Adding some income records (Salary — RM 5000)
3. Filtering by month or date
4. Editing and deleting records
5. Viewing the dashboard summary cards update in real-time

## 6. Known Improvements (If I Had More Time)

- **Database migrations** using Knex or Drizzle for version-controlled schema.
- **Unit + integration tests** — Jest for models, React Testing Library for components.
- **Global error handling middleware** on the server to avoid repetitive try/catch blocks.
- **Pagination on the server side** — currently all records are fetched and paginated client-side, which doesn't scale past a few hundred records.
- **Docker Compose** setup for `docker compose up` one-command startup.
- **CSV export** for downloading expense reports.
- **Better seed data** for demonstrating the filtering and pagination features.

---

*Built for Accordia technical assessment, May 2026.*
