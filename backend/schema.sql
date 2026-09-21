-- Esquema completo para una instalación NUEVA.
-- Si ya tienes la tabla users creada, usa las migraciones de backend/migrations/.

-- Ejecutar en Supabase: SQL Editor > New query

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  name text not null,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  constraint users_role_check check (role in ('admin', 'user'))
);

-- RLS activado sin políticas: la anon key no puede leer ni escribir.
-- El backend usa la service_role key, que ignora RLS.
alter table public.users enable row level security;

-- Siempre debe quedar al menos un admin (ver el porqué en migrations/001_add_role.sql).
create or replace function public.prevent_last_admin_loss()
returns trigger
language plpgsql
as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin') then
    perform pg_advisory_xact_lock(hashtext('public.users.admin_guard'));

    if not exists (
      select 1 from public.users where role = 'admin' and id <> old.id
    ) then
      raise exception 'LAST_ADMIN';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists users_prevent_last_admin_loss on public.users;

create trigger users_prevent_last_admin_loss
  before update of role or delete on public.users
  for each row execute function public.prevent_last_admin_loss();

-- Instalación nueva: nadie se registra como admin, así que promueve tu primera cuenta a mano:
--   update public.users set role = 'admin' where email = 'tu-email@ejemplo.com';
