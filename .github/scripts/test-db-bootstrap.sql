-- Minimal Supabase-compatible test fixture for PostgreSQL CI only.
-- This does not connect to or modify the remote Orion Supabase project.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
grant usage on schema auth to anon, authenticated;

create or replace function auth.uid()
returns uuid
language sql
stable
set search_path = pg_catalog
as $function$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$function$;
grant execute on function auth.uid() to public;

create table auth.users (
  id uuid primary key,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  cmd record;
  tbl name;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null and cmd.schema_name = 'public'
       and cmd.schema_name not in ('pg_catalog', 'information_schema')
       and cmd.schema_name not like 'pg_toast%'
       and cmd.schema_name not like 'pg_temp%' then
      select c.relname into tbl from pg_catalog.pg_class c where c.oid = cmd.objid;
      execute format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
    end if;
  end loop;
end;
$function$;

create event trigger ensure_rls
on ddl_command_end
when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
execute function public.rls_auto_enable();

grant usage on schema public to anon, authenticated;
