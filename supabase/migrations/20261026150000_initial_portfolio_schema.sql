-- MPOS initial schema candidate.
-- Review and validate on an isolated Supabase database before applying anywhere.
-- The application does not use service_role credentials in the browser.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  created_by uuid not null references auth.users(id),
  base_currency text not null default 'ZAR' check (base_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_memberships (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, user_id)
);

create table if not exists public.ventures (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 10000),
  venture_type text not null default 'business' check (venture_type in ('idea', 'business', 'brand', 'product', 'project', 'investment')),
  lifecycle_stage text not null default 'idea_captured'
    check (lifecycle_stage in ('idea_captured', 'validation', 'business_case', 'launch', 'stabilization', 'growth', 'portfolio_review')),
  status text not null default 'active' check (status in ('active', 'paused', 'exited', 'archived')),
  accountable_owner uuid references auth.users(id) on delete set null,
  currency_code text not null default 'ZAR' check (currency_code ~ '^[A-Z]{3}$'),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, id)
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  venture_id uuid,
  title text not null check (char_length(trim(title)) between 1 and 200),
  evidence_type text not null check (evidence_type in ('customer_interview', 'experiment', 'sales_record', 'market_research', 'competitor_research', 'financial_record', 'operational_record', 'document', 'other')),
  source_url text check (source_url is null or char_length(source_url) <= 2048),
  source_reference text check (source_reference is null or char_length(source_reference) <= 500),
  observed_at timestamptz,
  collected_at timestamptz not null default now(),
  confidence numeric(4,3) check (confidence is null or confidence between 0 and 1),
  limitations text not null default '' check (char_length(limitations) <= 5000),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, id),
  constraint evidence_venture_same_portfolio foreign key (portfolio_id, venture_id)
    references public.ventures (portfolio_id, id) on delete set null (venture_id)
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  venture_id uuid,
  title text not null check (char_length(trim(title)) between 1 and 200),
  decision_type text not null check (decision_type in ('pass', 'hold', 'revise', 'grow', 'maintain', 'repair', 'pause', 'restructure', 'sell', 'close', 'other')),
  rationale text not null check (char_length(trim(rationale)) between 1 and 10000),
  alternatives_considered text not null default '' check (char_length(alternatives_considered) <= 5000),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected', 'superseded', 'completed')),
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  review_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, id),
  constraint decisions_venture_same_portfolio foreign key (portfolio_id, venture_id)
    references public.ventures (portfolio_id, id) on delete set null (venture_id)
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_memberships_user_status_idx on public.portfolio_memberships (user_id, status);
create index if not exists ventures_portfolio_stage_idx on public.ventures (portfolio_id, lifecycle_stage, status);
create index if not exists evidence_items_portfolio_collected_idx on public.evidence_items (portfolio_id, collected_at desc);
create index if not exists evidence_items_venture_idx on public.evidence_items (venture_id);
create index if not exists decisions_portfolio_review_idx on public.decisions (portfolio_id, review_at);
create index if not exists decisions_venture_idx on public.decisions (venture_id);
create index if not exists audit_events_portfolio_created_idx on public.audit_events (portfolio_id, created_at desc);

create or replace function private.has_portfolio_role(p_portfolio_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.portfolio_memberships as membership
    where membership.portfolio_id = p_portfolio_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role = any (p_roles)
  );
$function$;

revoke all on function private.has_portfolio_role(uuid, text[]) from public, anon;
grant execute on function private.has_portfolio_role(uuid, text[]) to authenticated;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;


create or replace function private.prevent_immutable_record_fields()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  if new.id is distinct from old.id
     or new.created_at is distinct from old.created_at
     or new.created_by is distinct from old.created_by
     or new.portfolio_id is distinct from old.portfolio_id then
    raise exception 'Record identity, creator, creation time and portfolio are immutable'
      using errcode = '42501';
  end if;
  return new;
end;
$function$;

revoke all on function private.prevent_immutable_record_fields() from public, anon, authenticated;

create or replace function private.create_portfolio_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
begin
  insert into public.portfolio_memberships (portfolio_id, user_id, role, status)
  values (new.id, new.created_by, 'owner', 'active');
  return new;
end;
$function$;

create or replace function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 120), ''))
  on conflict (id) do nothing;
  return new;
end;
$function$;

create or replace function private.write_audit_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  v_portfolio_id uuid;
  v_entity_id uuid;
  v_actor uuid;
begin
  if tg_op = 'DELETE' then
    v_entity_id := old.id;
    if tg_table_name = 'portfolios' then
      v_portfolio_id := old.id;
    else
      v_portfolio_id := old.portfolio_id;
    end if;
  else
    v_entity_id := new.id;
    if tg_table_name = 'portfolios' then
      v_portfolio_id := new.id;
    else
      v_portfolio_id := new.portfolio_id;
    end if;
  end if;

  v_actor := auth.uid();
  insert into public.audit_events (portfolio_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (v_portfolio_id, v_actor, lower(tg_op), tg_table_name, v_entity_id, jsonb_build_object('source', 'database_trigger'));

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function private.prevent_immutable_record_fields() from public, anon, authenticated;
revoke all on function private.create_portfolio_owner_membership() from public, anon, authenticated;
revoke all on function private.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function private.write_audit_event() from public, anon, authenticated;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function private.touch_updated_at();

drop trigger if exists portfolios_touch_updated_at on public.portfolios;
create trigger portfolios_touch_updated_at before update on public.portfolios
for each row execute function private.touch_updated_at();

drop trigger if exists ventures_touch_updated_at on public.ventures;
create trigger ventures_touch_updated_at before update on public.ventures
for each row execute function private.touch_updated_at();

drop trigger if exists evidence_items_touch_updated_at on public.evidence_items;
create trigger evidence_items_touch_updated_at before update on public.evidence_items
for each row execute function private.touch_updated_at();

drop trigger if exists decisions_touch_updated_at on public.decisions;
create trigger decisions_touch_updated_at before update on public.decisions
for each row execute function private.touch_updated_at();

drop trigger if exists portfolios_immutable_fields on public.portfolios;
create trigger portfolios_immutable_fields before update on public.portfolios
for each row execute function private.prevent_immutable_record_fields();

drop trigger if exists ventures_immutable_fields on public.ventures;
create trigger ventures_immutable_fields before update on public.ventures
for each row execute function private.prevent_immutable_record_fields();

drop trigger if exists evidence_items_immutable_fields on public.evidence_items;
create trigger evidence_items_immutable_fields before update on public.evidence_items
for each row execute function private.prevent_immutable_record_fields();

drop trigger if exists decisions_immutable_fields on public.decisions;
create trigger decisions_immutable_fields before update on public.decisions
for each row execute function private.prevent_immutable_record_fields();

drop trigger if exists portfolios_create_owner_membership on public.portfolios;
create trigger portfolios_create_owner_membership after insert on public.portfolios
for each row execute function private.create_portfolio_owner_membership();

drop trigger if exists auth_user_create_profile on auth.users;
create trigger auth_user_create_profile after insert on auth.users
for each row execute function private.create_profile_for_new_user();

drop trigger if exists portfolios_audit on public.portfolios;
create trigger portfolios_audit after insert or update or delete on public.portfolios
for each row execute function private.write_audit_event();

drop trigger if exists ventures_audit on public.ventures;
create trigger ventures_audit after insert or update or delete on public.ventures
for each row execute function private.write_audit_event();

drop trigger if exists evidence_items_audit on public.evidence_items;
create trigger evidence_items_audit after insert or update or delete on public.evidence_items
for each row execute function private.write_audit_event();

drop trigger if exists decisions_audit on public.decisions;
create trigger decisions_audit after insert or update or delete on public.decisions
for each row execute function private.write_audit_event();

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_memberships enable row level security;
alter table public.ventures enable row level security;
alter table public.evidence_items enable row level security;
alter table public.decisions enable row level security;
alter table public.audit_events enable row level security;

-- Remove any default API grants, then grant only the operations used by the client.
revoke all on public.profiles, public.portfolios, public.portfolio_memberships,
  public.ventures, public.evidence_items, public.decisions, public.audit_events
from public, anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.portfolios to authenticated;
grant insert (name, created_by, base_currency) on public.portfolios to authenticated;
grant select on public.portfolio_memberships to authenticated;
grant select on public.ventures to authenticated;
grant insert (portfolio_id, name, description, venture_type, accountable_owner, currency_code, created_by)
  on public.ventures to authenticated;
grant update (name, description, venture_type, accountable_owner, currency_code)
  on public.ventures to authenticated;
grant select on public.evidence_items to authenticated;
grant insert (portfolio_id, venture_id, title, evidence_type, source_url, source_reference, observed_at, confidence, limitations, created_by)
  on public.evidence_items to authenticated;
grant update (venture_id, title, evidence_type, source_url, source_reference, observed_at, confidence, limitations)
  on public.evidence_items to authenticated;
grant select on public.decisions to authenticated;
grant insert (portfolio_id, venture_id, title, decision_type, rationale, alternatives_considered, review_at, created_by)
  on public.decisions to authenticated;
grant update (venture_id, title, decision_type, rationale, alternatives_considered, review_at)
  on public.decisions to authenticated;
grant select on public.audit_events to authenticated;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select to authenticated
using (id = (select auth.uid()));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists portfolios_select_member on public.portfolios;
create policy portfolios_select_member on public.portfolios for select to authenticated
using (private.has_portfolio_role(id, array['owner','admin','editor','viewer']));

drop policy if exists portfolios_insert_self on public.portfolios;
create policy portfolios_insert_self on public.portfolios for insert to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists memberships_select_self_or_admin on public.portfolio_memberships;
create policy memberships_select_self_or_admin on public.portfolio_memberships for select to authenticated
using (
  user_id = (select auth.uid())
  or private.has_portfolio_role(portfolio_id, array['owner','admin'])
);

drop policy if exists ventures_select_member on public.ventures;
create policy ventures_select_member on public.ventures for select to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor','viewer']));

drop policy if exists ventures_insert_editor on public.ventures;
create policy ventures_insert_editor on public.ventures for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_portfolio_role(portfolio_id, array['owner','admin','editor'])
);

drop policy if exists ventures_update_editor on public.ventures;
create policy ventures_update_editor on public.ventures for update to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor']))
with check (private.has_portfolio_role(portfolio_id, array['owner','admin','editor']));

drop policy if exists evidence_select_member on public.evidence_items;
create policy evidence_select_member on public.evidence_items for select to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor','viewer']));

drop policy if exists evidence_insert_editor on public.evidence_items;
create policy evidence_insert_editor on public.evidence_items for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_portfolio_role(portfolio_id, array['owner','admin','editor'])
);

drop policy if exists evidence_update_editor on public.evidence_items;
create policy evidence_update_editor on public.evidence_items for update to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor']))
with check (private.has_portfolio_role(portfolio_id, array['owner','admin','editor']));

drop policy if exists decisions_select_member on public.decisions;
create policy decisions_select_member on public.decisions for select to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor','viewer']));

drop policy if exists decisions_insert_editor on public.decisions;
create policy decisions_insert_editor on public.decisions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_portfolio_role(portfolio_id, array['owner','admin','editor'])
);

drop policy if exists decisions_update_editor on public.decisions;
create policy decisions_update_editor on public.decisions for update to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor']))
with check (private.has_portfolio_role(portfolio_id, array['owner','admin','editor']));

drop policy if exists audit_events_select_admin on public.audit_events;
create policy audit_events_select_admin on public.audit_events for select to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin']));

