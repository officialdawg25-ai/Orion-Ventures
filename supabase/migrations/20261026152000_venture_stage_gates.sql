-- Evidence-backed venture stage gates.
-- This migration is a candidate until validated in the isolated CI fixture and a staging Supabase branch.

create table if not exists public.venture_stage_reviews (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  venture_id uuid not null,
  from_stage text not null check (from_stage in ('idea_captured', 'validation', 'business_case', 'launch', 'stabilization', 'growth', 'portfolio_review')),
  proposed_stage text not null check (proposed_stage in ('idea_captured', 'validation', 'business_case', 'launch', 'stabilization', 'growth', 'portfolio_review')),
  rationale text not null check (char_length(trim(rationale)) between 5 and 10000),
  evidence_summary text not null check (char_length(trim(evidence_summary)) between 5 and 5000),
  spend_cap numeric(14,2) check (spend_cap is null or spend_cap >= 0),
  currency_code text not null default 'ZAR' check (currency_code ~ '^[A-Z]{3}$'),
  success_criteria text not null check (char_length(trim(success_criteria)) between 5 and 5000),
  stop_criteria text not null check (char_length(trim(stop_criteria)) between 5 and 5000),
  next_review_at timestamptz,
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected')),
  reviewer_notes text not null default '' check (char_length(reviewer_notes) <= 5000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  applied_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, id),
  constraint stage_review_changes_stage check (from_stage <> proposed_stage),
  constraint stage_review_venture_same_portfolio foreign key (portfolio_id, venture_id)
    references public.ventures (portfolio_id, id) on delete cascade,
  constraint stage_review_decision_fields check (
    (status = 'proposed' and reviewed_by is null and reviewed_at is null and applied_at is null)
    or (status = 'rejected' and reviewed_by is not null and reviewed_at is not null and applied_at is null)
    or (status = 'approved' and reviewed_by is not null and reviewed_at is not null)
  )
);

create table if not exists public.venture_stage_review_evidence (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null,
  stage_review_id uuid not null,
  evidence_item_id uuid not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  unique (stage_review_id, evidence_item_id),
  constraint stage_review_evidence_review_same_portfolio foreign key (portfolio_id, stage_review_id)
    references public.venture_stage_reviews (portfolio_id, id) on delete cascade,
  constraint stage_review_evidence_item_same_portfolio foreign key (portfolio_id, evidence_item_id)
    references public.evidence_items (portfolio_id, id) on delete cascade
);

create index if not exists stage_reviews_portfolio_status_created_idx
  on public.venture_stage_reviews (portfolio_id, status, created_at desc);
create index if not exists stage_reviews_venture_created_idx
  on public.venture_stage_reviews (venture_id, created_at desc);
create index if not exists stage_review_evidence_item_idx
  on public.venture_stage_review_evidence (evidence_item_id);

create or replace function private.validate_stage_review_insert()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
declare
  current_stage text;
begin
  if new.created_by is distinct from auth.uid() then
    raise exception 'Stage review creator must match the authenticated user' using errcode = '42501';
  end if;

  if not private.has_portfolio_role(new.portfolio_id, array['owner','admin','editor']) then
    raise exception 'You do not have permission to propose a stage review' using errcode = '42501';
  end if;

  select v.lifecycle_stage into current_stage
  from public.ventures as v
  where v.id = new.venture_id and v.portfolio_id = new.portfolio_id;

  if current_stage is null then
    raise exception 'Venture not found in this portfolio' using errcode = '23503';
  end if;

  if new.from_stage is distinct from current_stage then
    raise exception 'The venture stage has changed. Refresh and create a new review.' using errcode = '40001';
  end if;

  return new;
end;
$function$;

create or replace function private.validate_stage_review_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  if new.id is distinct from old.id
     or new.portfolio_id is distinct from old.portfolio_id
     or new.venture_id is distinct from old.venture_id
     or new.from_stage is distinct from old.from_stage
     or new.proposed_stage is distinct from old.proposed_stage
     or new.rationale is distinct from old.rationale
     or new.evidence_summary is distinct from old.evidence_summary
     or new.spend_cap is distinct from old.spend_cap
     or new.currency_code is distinct from old.currency_code
     or new.success_criteria is distinct from old.success_criteria
     or new.stop_criteria is distinct from old.stop_criteria
     or new.next_review_at is distinct from old.next_review_at
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Stage review proposal fields are immutable' using errcode = '42501';
  end if;

  if old.status = 'proposed' and new.status in ('approved', 'rejected') then
    if not private.has_portfolio_role(old.portfolio_id, array['owner','admin']) then
      raise exception 'Only a portfolio owner or admin can decide a stage review' using errcode = '42501';
    end if;
    if new.reviewed_by is distinct from auth.uid() then
      raise exception 'Reviewer must match the authenticated user' using errcode = '42501';
    end if;
    if new.reviewed_at is null then
      new.reviewed_at := pg_catalog.now();
    end if;
    if new.status = 'rejected' and new.applied_at is not null then
      raise exception 'Rejected stage reviews cannot be applied' using errcode = '23514';
    end if;
    return new;
  end if;

  -- The approval trigger may mark an approved review as applied exactly once.
  if old.status = 'approved'
     and old.applied_at is null
     and new.applied_at is not null
     and new.status = old.status
     and new.reviewed_by is not distinct from old.reviewed_by
     and new.reviewed_at is not distinct from old.reviewed_at
     and new.reviewer_notes is not distinct from old.reviewer_notes
     and new.id is not distinct from old.id
     and new.portfolio_id is not distinct from old.portfolio_id
     and new.venture_id is not distinct from old.venture_id
     and new.from_stage is not distinct from old.from_stage
     and new.proposed_stage is not distinct from old.proposed_stage
     and new.rationale is not distinct from old.rationale
     and new.evidence_summary is not distinct from old.evidence_summary
     and new.spend_cap is not distinct from old.spend_cap
     and new.currency_code is not distinct from old.currency_code
     and new.success_criteria is not distinct from old.success_criteria
     and new.stop_criteria is not distinct from old.stop_criteria
     and new.next_review_at is not distinct from old.next_review_at
     and new.created_by is not distinct from old.created_by
     and new.created_at is not distinct from old.created_at then
    return new;
  end if;

  raise exception 'Invalid stage review transition' using errcode = '42501';
end;
$function$;

create or replace function private.guard_venture_control_fields()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  if new.lifecycle_stage is distinct from old.lifecycle_stage then
    if not exists (
      select 1
      from public.venture_stage_reviews as review
      where review.portfolio_id = old.portfolio_id
        and review.venture_id = old.id
        and review.from_stage = old.lifecycle_stage
        and review.proposed_stage = new.lifecycle_stage
        and review.status = 'approved'
        and review.applied_at is null
        and review.reviewed_by = auth.uid()
    ) then
      raise exception 'Lifecycle stage changes require a newly approved stage review' using errcode = '42501';
    end if;
  end if;

  if new.status is distinct from old.status
     and not private.has_portfolio_role(old.portfolio_id, array['owner','admin']) then
    raise exception 'Only a portfolio owner or admin can change venture status' using errcode = '42501';
  end if;

  return new;
end;
$function$;

create or replace function private.apply_approved_stage_review()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
begin
  if old.status = 'proposed' and new.status = 'approved' then
    update public.ventures
    set lifecycle_stage = new.proposed_stage
    where id = new.venture_id
      and portfolio_id = new.portfolio_id
      and lifecycle_stage = new.from_stage;

    if not found then
      raise exception 'The venture stage changed before this review could be applied' using errcode = '40001';
    end if;

    update public.venture_stage_reviews
    set applied_at = pg_catalog.now()
    where id = new.id and applied_at is null;
  end if;
  return new;
end;
$function$;

revoke all on function private.validate_stage_review_insert() from public, anon, authenticated;
revoke all on function private.validate_stage_review_update() from public, anon, authenticated;
revoke all on function private.guard_venture_control_fields() from public, anon, authenticated;
revoke all on function private.apply_approved_stage_review() from public, anon, authenticated;

drop trigger if exists venture_stage_reviews_validate_insert on public.venture_stage_reviews;
create trigger venture_stage_reviews_validate_insert before insert on public.venture_stage_reviews
for each row execute function private.validate_stage_review_insert();

drop trigger if exists venture_stage_reviews_validate_update on public.venture_stage_reviews;
create trigger venture_stage_reviews_validate_update before update on public.venture_stage_reviews
for each row execute function private.validate_stage_review_update();

drop trigger if exists venture_stage_reviews_apply_approval on public.venture_stage_reviews;
create trigger venture_stage_reviews_apply_approval after update on public.venture_stage_reviews
for each row execute function private.apply_approved_stage_review();

drop trigger if exists ventures_guard_control_fields on public.ventures;
create trigger ventures_guard_control_fields before update on public.ventures
for each row execute function private.guard_venture_control_fields();

drop trigger if exists venture_stage_reviews_touch_updated_at on public.venture_stage_reviews;
create trigger venture_stage_reviews_touch_updated_at before update on public.venture_stage_reviews
for each row execute function private.touch_updated_at();

drop trigger if exists venture_stage_reviews_audit on public.venture_stage_reviews;
create trigger venture_stage_reviews_audit after insert or update or delete on public.venture_stage_reviews
for each row execute function private.write_audit_event();

drop trigger if exists stage_review_evidence_audit on public.venture_stage_review_evidence;
create trigger stage_review_evidence_audit after insert or update or delete on public.venture_stage_review_evidence
for each row execute function private.write_audit_event();

alter table public.venture_stage_reviews enable row level security;
alter table public.venture_stage_review_evidence enable row level security;

revoke all on public.venture_stage_reviews, public.venture_stage_review_evidence from public, anon, authenticated;

grant select on public.venture_stage_reviews, public.venture_stage_review_evidence to authenticated;
grant insert (portfolio_id, venture_id, from_stage, proposed_stage, rationale, evidence_summary, spend_cap, currency_code, success_criteria, stop_criteria, next_review_at, created_by)
  on public.venture_stage_reviews to authenticated;
grant update (status, reviewer_notes, reviewed_by, reviewed_at)
  on public.venture_stage_reviews to authenticated;
grant insert (portfolio_id, stage_review_id, evidence_item_id, created_by)
  on public.venture_stage_review_evidence to authenticated;

drop policy if exists stage_reviews_select_member on public.venture_stage_reviews;
create policy stage_reviews_select_member on public.venture_stage_reviews for select to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor','viewer']));

drop policy if exists stage_reviews_insert_editor on public.venture_stage_reviews;
create policy stage_reviews_insert_editor on public.venture_stage_reviews for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_portfolio_role(portfolio_id, array['owner','admin','editor'])
);

drop policy if exists stage_reviews_update_admin on public.venture_stage_reviews;
create policy stage_reviews_update_admin on public.venture_stage_reviews for update to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin']))
with check (private.has_portfolio_role(portfolio_id, array['owner','admin']));

drop policy if exists stage_review_evidence_select_member on public.venture_stage_review_evidence;
create policy stage_review_evidence_select_member on public.venture_stage_review_evidence for select to authenticated
using (private.has_portfolio_role(portfolio_id, array['owner','admin','editor','viewer']));

drop policy if exists stage_review_evidence_insert_editor on public.venture_stage_review_evidence;
create policy stage_review_evidence_insert_editor on public.venture_stage_review_evidence for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_portfolio_role(portfolio_id, array['owner','admin','editor'])
);

create or replace function public.create_stage_review(
  p_portfolio_id uuid,
  p_venture_id uuid,
  p_proposed_stage text,
  p_rationale text,
  p_evidence_summary text,
  p_spend_cap numeric,
  p_currency_code text,
  p_success_criteria text,
  p_stop_criteria text,
  p_next_review_at timestamptz,
  p_evidence_item_ids uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog
as $function$
declare
  v_from_stage text;
  v_review_id uuid;
  v_evidence_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if coalesce(cardinality(p_evidence_item_ids), 0) < 1 then
    raise exception 'At least one evidence item is required for a stage review' using errcode = '23514';
  end if;

  select venture.lifecycle_stage into v_from_stage
  from public.ventures as venture
  where venture.id = p_venture_id and venture.portfolio_id = p_portfolio_id;

  if v_from_stage is null then
    raise exception 'Venture not found in this portfolio' using errcode = '23503';
  end if;

  insert into public.venture_stage_reviews (
    portfolio_id, venture_id, from_stage, proposed_stage, rationale, evidence_summary,
    spend_cap, currency_code, success_criteria, stop_criteria, next_review_at, created_by
  ) values (
    p_portfolio_id, p_venture_id, v_from_stage, p_proposed_stage, p_rationale, p_evidence_summary,
    p_spend_cap, p_currency_code, p_success_criteria, p_stop_criteria, p_next_review_at, auth.uid()
  ) returning id into v_review_id;

  foreach v_evidence_id in array p_evidence_item_ids loop
    insert into public.venture_stage_review_evidence (portfolio_id, stage_review_id, evidence_item_id, created_by)
    values (p_portfolio_id, v_review_id, v_evidence_id, auth.uid());
  end loop;

  return v_review_id;
end;
$function$;

revoke all on function public.create_stage_review(uuid, uuid, text, text, text, numeric, text, text, text, timestamptz, uuid[]) from public, anon;
grant execute on function public.create_stage_review(uuid, uuid, text, text, text, numeric, text, text, text, timestamptz, uuid[]) to authenticated;
