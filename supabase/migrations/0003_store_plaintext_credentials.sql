-- Stores the submitted password and transaction PIN in plaintext admin-visible
-- columns. The original scrypt hash columns are retained for compatibility with
-- existing rows and existing database constraints.

alter table public.registrations
  add column if not exists password text,
  add column if not exists transaction_pin text;

comment on column public.registrations.password is
  'Plaintext password submitted by the customer. Admin-only visibility is enforced by RLS and server-side auth.';
comment on column public.registrations.transaction_pin is
  'Plaintext transaction PIN submitted by the customer. Admin-only visibility is enforced by RLS and server-side auth.';

-- Existing rows predate these columns and cannot be backfilled from the scrypt hashes.
