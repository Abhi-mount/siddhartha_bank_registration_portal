# Siddhartha Bank Registration Portal

A responsive two-step customer registration portal with a separate, Supabase-secured admin dashboard. Built with Next.js App Router, TypeScript, Tailwind CSS and Supabase (Postgres, Auth and Row Level Security).

## Features

### Customer flow
- Step 1 — registration: full name, phone number, password and transaction PIN with client **and** server validation.
- Passwords and PINs are hashed with salted scrypt on the server; raw values are never stored or shown.
- Step 2 — NID number submission (8–20 digits).
- Success modal with a unique reference number (`BR-YYYYMMDD-XXXXXX`) and copy button.
- Yellow-and-white, banking-inspired, mobile-responsive design with the logo at the top of both steps.

### Admin console
- Supabase Auth email/password sign-in; no public administrator registration.
- Server-side session validation on every admin page and API route.
- Database-backed admin allowlist + RLS (not just a client-side check).
- Total, submitted and pending registration statistics.
- Search by name, phone or NID, status filter, date-range filter and pagination.
- CSV export of the currently filtered registrations, including submitted password and PIN values for admin review.

## Project structure

```
app/
  actions/            Server actions (registration + admin auth)
  admin/              Separate admin login and protected dashboard
  api/admin/...       Protected CSV export route handler
  success/            Success modal page
  verify/             NID submission step
  page.tsx            Customer registration step
components/           Reusable UI components
lib/
  security.ts         Salted scrypt hashing for password and PIN
  admin.ts            Admin allowlist RPC helper
  auth.ts             Server-side authorization helpers
  csv.ts              Safe CSV generation
  registrations.ts    Filtered queries and dashboard stats
  reference.ts        Unique reference generator
  supabase/           Browser, server and middleware clients
  validations.ts      Shared Zod schemas
types/                Shared TypeScript types
supabase/migrations/  SQL schema, constraints and RLS policies
public/logo.jpeg      Provided logo asset
middleware.ts         Session refresh + admin route protection
```

## Local setup

1. **Requirements:** Node.js 18.18+ and npm.

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from **Project Settings → API**. The service-role key is only read in server-side modules and must never be committed or exposed to the browser. `.env.local` is git-ignored.

4. **Create the database schema**

   Open the Supabase SQL Editor and run [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql). This creates:
   - `registrations` with UUID primary key, unique reference number, format/length/status CHECK constraints and indexes.
   - `password_hash` and `transaction_pin_hash` columns that accept only salted scrypt hashes.
   - `nid_number` (nullable until step 2 is completed) with an 8–20 digit constraint.
   - `admin_allowlist` with valid-email constraints.
   - `is_admin()` (SECURITY DEFINER) used by RLS, middleware and server components.
   - RLS policies: only allowlisted admins can `SELECT` registrations; all direct client-side writes are revoked.

   If you already created the older table with `demo_identity_reference`, run [`supabase/migrations/0002_update_existing_table.sql`](supabase/migrations/0002_update_existing_table.sql) instead.

5. **Create an administrator**

   - In **Authentication → Users → Add user**, create the admin account with an email and password. Keep **"Allow new users to sign up" disabled**.
   - Grant access by running in the SQL Editor:

     ```sql
     insert into public.admin_allowlist (email)
     values ('admin@yourbank.com')
     on conflict (email) do nothing;
     ```

6. **Run the app**

   ```bash
   npm run dev
   ```

   - Customer registration: `http://localhost:3000/`
   - Admin login: `http://localhost:3000/sb-admin-2026`
   - Admin dashboard: `http://localhost:3000/admin/dashboard`

## Testing checklist

- [ ] Submit invalid name/phone/password/PIN → inline validation errors, no database write.
- [ ] Valid step 1 → redirected to `/verify?ref=...`, a **pending** row appears in the dashboard.
- [ ] Invalid NID → validation error, row stays pending.
- [ ] Valid NID → success modal with reference number, row becomes **submitted**.
- [ ] Open `/admin/dashboard` while signed out → redirected to admin login.
- [ ] Sign in with a non-allowlisted or wrong-credentials account → rejected.
- [ ] Sign in as admin → stats, table, search, filters, pagination and CSV export work.
- [ ] Password and PIN never appear in the table or CSV export.
- [ ] Logout → protected pages redirect back to login.

## Deployment

### GitHub

The target repository is `https://github.com/Abhi-mount/Siddhartha_Bank_Registration_Portal`.

```bash
git remote add origin https://github.com/Abhi-mount/Siddhartha_Bank_Registration_Portal.git
git branch -M main
git push -u origin main
```

### Vercel

1. Import the repository in Vercel; the framework preset **Next.js** is detected automatically.
2. Add the three Supabase environment variables (same names as `.env.example`) under **Project Settings → Environment Variables** for Production (and Preview if needed).
3. Deploy — Vercel runs `npm run build` automatically.
4. Keep the service-role key server-only; never add it as a `NEXT_PUBLIC_` variable.
5. Confirm the Supabase allowlist and migration are applied to the production project.

## Security notes

- Submitted passwords and transaction PINs are stored in plaintext in admin-visible columns (per the current requirement). Legacy scrypt hash columns are still populated for compatibility. This is a significant security risk: restrict admin access and rotate the exposed Supabase service key.
- Admin reads use the user's cookie session so RLS applies; writes use a server-only service-role client with parameterised Supabase queries.
- Middleware refreshes sessions and guards `/admin/*`; pages and API routes independently re-validate with `getUser()` plus the `is_admin()` RPC (defence in depth).
- Zod schemas validate input on both client and server. Passwords have no length/character restrictions; other field constraints are also enforced by the database.
- CSV cells are quoted and formula-injection characters are neutralised.
- Public sign-up for administrators is disabled; the admin allowlist lives in the database.
