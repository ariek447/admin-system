-- 001_add_role.sql
-- Ejecutar en Supabase: SQL Editor > New query. Es idempotente (se puede repetir sin error).
--
-- Qué hace:
--   1. Añade users.role ('admin' | 'user', por defecto 'user', NOT NULL) con un CHECK.
--   2. Crea un trigger que impide eliminar o degradar al último admin.
--   3. Si no existe ningún admin, promueve al usuario más antiguo (el primer admin).

begin;

-- 1. Columna + CHECK ----------------------------------------------------------
-- Con DEFAULT, las filas existentes se rellenan con 'user' automáticamente.
alter table public.users
  add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_role_check' and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_role_check check (role in ('admin', 'user'));
  end if;
end $$;

-- 2. Regla: siempre debe quedar al menos un admin --------------------------------
-- Vive en la base de datos (no solo en el backend) por dos motivos:
--   * Es atómica: el advisory lock serializa operaciones concurrentes. Si dos admins
--     se degradaran a la vez, una comprobación en el backend vería "queda otro admin"
--     en ambas peticiones y el sistema se quedaría sin admins.
--   * Se aplica también a cambios hechos a mano desde el SQL Editor.
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
      -- El backend reconoce este mensaje y responde 409.
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

-- 3. Primer admin -----------------------------------------------------------------
-- Tras la migración todos serían 'user' y nadie podría promover a nadie.
-- Solo actúa si no existe ya ningún admin.
update public.users
set role = 'admin'
where id = (select id from public.users order by created_at asc, id asc limit 1)
  and not exists (select 1 from public.users where role = 'admin');

commit;

-- Reversa (no ejecutar salvo que quieras deshacer la migración):
--   drop trigger if exists users_prevent_last_admin_loss on public.users;
--   drop function if exists public.prevent_last_admin_loss();
--   alter table public.users drop constraint if exists users_role_check;
--   alter table public.users drop column if exists role;
