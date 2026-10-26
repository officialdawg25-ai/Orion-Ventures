\set ON_ERROR_STOP on
begin;

\set p1_id '30000000-0000-4000-8000-000000000003'
\set p2_id '40000000-0000-4000-8000-000000000004'

insert into auth.users (id, raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000001', '{"display_name":"Test One"}'::jsonb),
  ('20000000-0000-4000-8000-000000000002', '{"display_name":"Test Two"}'::jsonb)
on conflict (id) do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);
select auth.uid() as current_test_user, current_setting('request.jwt.claim.sub', true) as current_test_claim;
insert into public.portfolios (id, name, created_by) values (:'p1_id', 'Portfolio One', '10000000-0000-4000-8000-000000000001');
insert into public.ventures (portfolio_id, name) values (:'p1_id', 'Venture One') returning id \gset v1_
select exists (
  select 1 from public.portfolio_memberships
  where portfolio_id = :'p1_id'
    and user_id = '10000000-0000-4000-8000-000000000001'
    and role = 'owner' and status = 'active'
) as owner_membership_created \gset
\if :owner_membership_created
  \echo 'PASS: portfolio owner membership created automatically.'
\else
  \echo 'FAIL: owner membership was not created.'
  \quit 1
\endif

select public.create_stage_review(
  :'p1_id'::uuid,
  :'v1_id'::uuid,
  'validation',
  'The problem is plausible and requires a bounded validation experiment.',
  'One interview record is linked; evidence is early and not representative.',
  100.00,
  'ZAR',
  'Complete five target-customer interviews and record willingness-to-pay evidence.',
  'Pause if fewer than two target customers confirm the problem or the spend cap is reached.',
  now() + interval '14 days',
  array[:'e1_id'::uuid]
) as stage_review_id \gset sr_

select exists (
  select 1 from public.venture_stage_review_evidence
  where stage_review_id = :'sr_stage_review_id'
    and evidence_item_id = :'e1_id'
    and portfolio_id = :'p1_id'
) as evidence_linked \gset
\if :evidence_linked
  \echo 'PASS: stage review references a real evidence record.'
\\else
  \echo 'FAIL: stage review evidence link missing.'
  \quit 1
\\endif

update public.venture_stage_reviews
set status = 'approved', reviewed_by = '10000000-0000-4000-8000-000000000001',
    reviewed_at = now(), reviewer_notes = 'Approved for bounded validation only.'
where id = :'sr_stage_review_id';

select (lifecycle_stage = 'validation') as stage_advanced
from public.ventures where id = :'v1_id' \gset
\if :stage_advanced
  \echo 'PASS: approval applies the reviewed lifecycle-stage transition.'
\\else
  \echo 'FAIL: approved stage review did not advance the venture.'
  \quit 1
\\endif

select (applied_at is not null and status = 'approved') as review_applied
from public.venture_stage_reviews where id = :'sr_stage_review_id' \gset
\if :review_applied
  \echo 'PASS: stage approval is marked applied exactly once.'
\\else
  \echo 'FAIL: stage review was not marked applied.'
  \quit 1
\\endif

reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', false);
insert into public.portfolios (id, name, created_by) values (:'p2_id', 'Portfolio Two', '20000000-0000-4000-8000-000000000002');
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);
select exists (select 1 from public.portfolios where id = :'p2_id') as cross_portfolio_visible \gset
\if :cross_portfolio_visible
  \echo 'FAIL: user one can read user two portfolio.'
  \quit 1
\else
  \echo 'PASS: cross-portfolio SELECT is denied.'
\endif

select exists (select 1 from public.ventures where portfolio_id = :'p2_id') as cross_venture_visible \gset
\if :cross_venture_visible
  \echo 'FAIL: user one can read user two ventures.'
  \quit 1
\else
  \echo 'PASS: cross-portfolio venture SELECT is denied.'
\endif

savepoint before_cross_portfolio_insert;
\set ON_ERROR_STOP off
insert into public.ventures (portfolio_id, name) values (:'p2_id', 'Forbidden Venture');
\if :ERROR
  \echo 'PASS: cross-portfolio INSERT was rejected.'
  rollback to savepoint before_cross_portfolio_insert;
\else
  \echo 'FAIL: cross-portfolio INSERT unexpectedly succeeded.'
  \quit 1
\endif
\set ON_ERROR_STOP on

savepoint before_stage_mutation;
\set ON_ERROR_STOP off
update public.ventures set lifecycle_stage = 'growth' where id = :'v1_id';
\if :ERROR
  \echo 'PASS: direct lifecycle-stage mutation is not granted.'
  rollback to savepoint before_stage_mutation;
\else
  \echo 'FAIL: direct lifecycle-stage mutation unexpectedly succeeded.'
  \quit 1
\endif
\set ON_ERROR_STOP on

reset role;

select has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE') as authenticated_can_execute
\gset
\if :anon_can_execute
  \echo 'FAIL: anon can still execute the RLS event-trigger function.'
  \quit 1
\endif
\if :authenticated_can_execute
  \echo 'FAIL: authenticated can still execute the RLS event-trigger function.'
  \quit 1
\endif
\echo 'PASS: direct execute grants revoked from anon and authenticated.'

create table public.rls_trigger_smoke_test (id integer primary key);
select relrowsecurity as trigger_enabled_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'rls_trigger_smoke_test'
\gset
\if :trigger_enabled_rls
  \echo 'PASS: event trigger still enables RLS after execute grants are revoked.'
\else
  \echo 'FAIL: event trigger did not enable RLS after execute grants were revoked.'
  \quit 1
\endif
drop table public.rls_trigger_smoke_test;

select count(*) = 7 as all_application_tables_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and c.relname in ('profiles','portfolios','portfolio_memberships','ventures','evidence_items','decisions','audit_events')
  and c.relrowsecurity
\gset
\if :all_application_tables_rls
  \echo 'PASS: RLS is enabled on all initial application tables.'
\else
  \echo 'FAIL: one or more application tables have RLS disabled.'
  \quit 1
\endif

reset role;
commit;
