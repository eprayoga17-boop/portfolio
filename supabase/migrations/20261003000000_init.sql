-- =====================================================================
-- Erik Prayoga portfolio: schema, Row Level Security, storage, audit.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.
-- =====================================================================

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------
do $$ begin
  create type public.project_category as enum ('clinic', 'beauty', 'fnb', 'service', 'side');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Admins. A row here + an aal2 (MFA-verified) session = admin.
-- Add yourself after signing up:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
     and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Same check minus MFA, used only to decide whether to show the MFA step.
create or replace function public.is_admin_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin_member() from public;
grant execute on function public.is_admin_member() to authenticated;

-- ---------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 80),
  title        text not null check (char_length(title) between 1 and 120),
  client       text not null check (char_length(client) between 1 and 160),
  category     public.project_category not null,
  year         smallint check (year between 2000 and 2100),
  region       text check (char_length(region) <= 80),
  role         text check (char_length(role) <= 120),
  services     text[] not null default '{}' check (cardinality(services) <= 12),
  summary      text not null check (char_length(summary) between 1 and 300),
  body         text not null default '' check (char_length(body) <= 6000),
  accent       text not null default '#0039C1' check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  featured     boolean not null default false,
  published    boolean not null default false,
  sort_order   integer not null default 0,
  external_url text check (external_url is null or (external_url ~ '^https://' and char_length(external_url) <= 500)),
  cover_path   text check (char_length(cover_path) <= 300),
  cover_alt    text check (char_length(cover_alt) <= 300),
  cover_width  integer check (cover_width between 1 and 12000),
  cover_height integer check (cover_height between 1 and 12000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by   uuid references auth.users (id) on delete set null
);
create index if not exists projects_published_order_idx on public.projects (published, sort_order);

create table if not exists public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path       text not null check (char_length(path) between 1 and 300),
  alt        text not null check (char_length(alt) between 1 and 300),
  width      integer not null check (width between 1 and 12000),
  height     integer not null check (height between 1 and 12000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_images_project_order_idx on public.project_images (project_id, sort_order);

-- ---------------------------------------------------------------------
-- Contact inquiries (personal data: keep minimal, purge on schedule)
-- ---------------------------------------------------------------------
create table if not exists public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 120),
  email           text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company         text check (char_length(company) <= 160),
  project_type    text not null check (project_type in ('full-time', 'freelance', 'branding', 'social', 'other')),
  message         text not null check (char_length(message) between 10 and 4000),
  consent         boolean not null check (consent),
  consent_version text not null check (char_length(consent_version) <= 40),
  ip_hash         text check (char_length(ip_hash) <= 128),
  status          text not null default 'new' check (status in ('new', 'replied', 'archived')),
  created_at      timestamptz not null default now()
);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

-- ---------------------------------------------------------------------
-- Audit log (append-only)
-- ---------------------------------------------------------------------
create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  actor      uuid,
  action     text not null check (char_length(action) <= 60),
  entity     text not null check (char_length(entity) <= 60),
  entity_id  text check (char_length(entity_id) <= 120),
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------
-- Rate limiting (fixed window), private table + service-role-only RPC
-- ---------------------------------------------------------------------
create table if not exists private.rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  count        integer not null
);

create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into private.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    count = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------
-- Retention: delete inquiries older than N days, prune rate-limit rows.
-- Called by the Vercel cron route with the service role.
-- ---------------------------------------------------------------------
create or replace function public.purge_expired_data(p_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.inquiries where created_at < now() - make_interval(days => p_days);
  get diagnostics v_deleted = row_count;
  delete from private.rate_limits where window_start < now() - interval '1 day';
  insert into public.audit_log (actor, action, entity, meta)
  values (null, 'retention_purge', 'inquiries', jsonb_build_object('deleted', v_deleted, 'days', p_days));
  return v_deleted;
end;
$$;
revoke all on function public.purge_expired_data(integer) from public, anon, authenticated;
grant execute on function public.purge_expired_data(integer) to service_role;

-- ---------------------------------------------------------------------
-- Triggers: updated_at / updated_by, and audit trail
-- ---------------------------------------------------------------------
create or replace function private.touch_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function private.touch_updated();

create or replace function private.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r jsonb;
  m jsonb := '{}'::jsonb;
begin
  if tg_op = 'DELETE' then r := to_jsonb(old); else r := to_jsonb(new); end if;
  if tg_table_name = 'projects' then
    m := jsonb_build_object('slug', r ->> 'slug', 'published', r -> 'published');
  elsif tg_table_name = 'project_images' then
    m := jsonb_build_object('project_id', r ->> 'project_id', 'path', r ->> 'path');
  elsif tg_table_name = 'inquiries' then
    m := jsonb_build_object('status', r ->> 'status'); -- never copy personal data into the log
  end if;
  insert into public.audit_log (actor, action, entity, entity_id, meta)
  values ((select auth.uid()), lower(tg_op), tg_table_name, r ->> 'id', m);
  return coalesce(new, old);
end;
$$;

drop trigger if exists projects_audit on public.projects;
create trigger projects_audit after insert or update or delete on public.projects
  for each row execute function private.audit_row();
drop trigger if exists project_images_audit on public.project_images;
create trigger project_images_audit after insert or update or delete on public.project_images
  for each row execute function private.audit_row();
drop trigger if exists inquiries_audit on public.inquiries;
create trigger inquiries_audit after update or delete on public.inquiries
  for each row execute function private.audit_row();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.admins          enable row level security;
alter table public.projects        enable row level security;
alter table public.project_images  enable row level security;
alter table public.inquiries       enable row level security;
alter table public.audit_log       enable row level security;

-- Least privilege on top of RLS: anon can only ever read.
revoke all on public.admins, public.projects, public.project_images, public.inquiries, public.audit_log from anon;
grant select on public.projects, public.project_images to anon;
revoke insert, update, delete, truncate on public.audit_log from authenticated;
revoke insert, truncate on public.inquiries from authenticated;
revoke insert, update, delete, truncate on public.admins from authenticated;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "public reads published projects" on public.projects;
create policy "public reads published projects" on public.projects
  for select to anon, authenticated using (published = true);

drop policy if exists "admin manages projects" on public.projects;
create policy "admin manages projects" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads images of published projects" on public.project_images;
create policy "public reads images of published projects" on public.project_images
  for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.published = true));

drop policy if exists "admin manages images" on public.project_images;
create policy "admin manages images" on public.project_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Inquiries are inserted by the server (service role) after validation and rate limiting.
drop policy if exists "admin reads inquiries" on public.inquiries;
create policy "admin reads inquiries" on public.inquiries
  for select to authenticated using (public.is_admin());
drop policy if exists "admin updates inquiries" on public.inquiries;
create policy "admin updates inquiries" on public.inquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin deletes inquiries" on public.inquiries;
create policy "admin deletes inquiries" on public.inquiries
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin reads audit log" on public.audit_log;
create policy "admin reads audit log" on public.audit_log
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage: public-read bucket, admin-only writes, images only, 8 MB cap
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 8388608, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio admin read" on storage.objects;
create policy "portfolio admin read" on storage.objects
  for select to authenticated using (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "portfolio admin insert" on storage.objects;
create policy "portfolio admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin() and (storage.foldername(name))[1] = 'projects');

drop policy if exists "portfolio admin update" on storage.objects;
create policy "portfolio admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin() and (storage.foldername(name))[1] = 'projects');

drop policy if exists "portfolio admin delete" on storage.objects;
create policy "portfolio admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio' and public.is_admin());
