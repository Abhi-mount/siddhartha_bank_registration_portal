-- Optional upgrade: only run this if you already created the older table with
-- `demo_identity_reference` from a previous version of this app.
-- For a fresh Supabase project, run 0001_initial_schema.sql only.

alter table public.registrations
  add column if not exists password_hash text,
  add column if not exists transaction_pin_hash text,
  add column if not exists nid_number text;

-- Existing pending rows cannot provide real secrets. Fill them with placeholder
-- hashes so the NOT NULL constraints can be applied safely.
update public.registrations
set password_hash = 'scrypt$' || repeat('0', 32) || '$' || repeat('0', 128)
where password_hash is null;

update public.registrations
set transaction_pin_hash = 'scrypt$' || repeat('0', 32) || '$' || repeat('0', 128)
where transaction_pin_hash is null;

alter table public.registrations
  alter column password_hash set not null,
  alter column transaction_pin_hash set not null;

alter table public.registrations
  drop constraint if exists registrations_password_hash_format,
  add constraint registrations_password_hash_format
    check (password_hash ~ '^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$');

alter table public.registrations
  drop constraint if exists registrations_pin_hash_format,
  add constraint registrations_pin_hash_format
    check (transaction_pin_hash ~ '^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$');

alter table public.registrations
  drop constraint if exists registrations_nid_format,
  add constraint registrations_nid_format
    check (nid_number is null or nid_number ~ '^[0-9]{8,20}$');

alter table public.registrations
  drop column if exists demo_identity_reference;

create index if not exists registrations_nid_idx
  on public.registrations (nid_number);

-- Base grants required by PostgREST if the original table was created without
-- Supabase's default privileges.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.registrations to authenticated;
grant all on public.registrations to service_role;
grant all on public.admin_allowlist to service_role;
grant execute on function public.is_admin() to authenticated, service_role;
