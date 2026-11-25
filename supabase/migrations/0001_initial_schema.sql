-- Siddhartha Bank Registration Portal - initial schema, constraints and Row Level Security.
-- Run this in the Supabase SQL Editor (or via the Supabase CLI) before using the app.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null
    constraint registrations_full_name_length check (char_length(btrim(full_name)) between 2 and 100),
  phone_number text not null
    constraint registrations_phone_format
      check (char_length(btrim(phone_number)) between 7 and 20 and phone_number ~ '^\+?[0-9\s()-]+$'),
  password text,
  transaction_pin text,
  password_hash text not null
    constraint registrations_password_hash_format
      check (password_hash ~ '^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$'),
  transaction_pin_hash text not null
    constraint registrations_pin_hash_format
      check (transaction_pin_hash ~ '^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$'),
  nid_number text
    constraint registrations_nid_format
      check (nid_number is null or nid_number ~ '^[0-9]{8,20}$'),
  reference_number text not null unique
    constraint registrations_reference_format
      check (reference_number ~ '^BR-[0-9]{8}-[A-Z0-9]{6}$'),
  submission_status text not null default 'pending'
    constraint registrations_status_valid
      check (submission_status in ('pending', 'submitted', 'failed')),
  created_at timestamptz not null default now()
);

comment on table public.registrations is 'Customer registration submissions. Plaintext password/PIN columns are admin-visible; legacy scrypt hash columns are retained. Writes are made by the server with the service role; reads are governed by RLS.';

create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

create index if not exists registrations_status_idx
  on public.registrations (submission_status);

create index if not exists registrations_nid_idx
  on public.registrations (nid_number);

-- Admin allowlist. Only email addresses in this table may access admin data.
-- No public sign-up path exists: accounts must be created by a Supabase admin.
create table if not exists public.admin_allowlist (
  email text primary key
    constraint admin_allowlist_email_format
      check (email = lower(btrim(email)) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin check used by RLS, middleware and server-side route protection
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.admin_allowlist as allowlist
    where allowlist.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.registrations enable row level security;
alter table public.admin_allowlist enable row level security;

-- Clear any permissive policies if this migration is re-run in development.
drop policy if exists "Admins can read registrations" on public.registrations;

create policy "Admins can read registrations"
  on public.registrations
  for select
  to authenticated
  using (public.is_admin());

-- Explicitly deny direct client-side writes. The service role (server only)
-- bypasses RLS to insert and update registration records.
revoke insert, update, delete on public.registrations from anon, authenticated;
revoke all on public.admin_allowlist from anon, authenticated;

-- Base grants required by PostgREST. RLS still restricts reads to allowlisted
-- admins; the service role bypasses RLS for server-only writes.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.registrations to authenticated;
grant all on public.registrations to service_role;
grant all on public.admin_allowlist to service_role;
grant execute on function public.is_admin() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Create the admin account in Supabase Auth (Authentication -> Users -> Add user),
-- then grant it access by running (with your real admin email):
--
-- insert into public.admin_allowlist (email)
-- values ('admin@example.com')
-- on conflict (email) do nothing;
--
-- Keep the project's "Allow new users to sign up" setting disabled.
-- ---------------------------------------------------------------------------
