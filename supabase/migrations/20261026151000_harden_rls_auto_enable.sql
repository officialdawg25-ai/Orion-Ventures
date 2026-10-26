-- Harden the existing Supabase RLS auto-enable event-trigger function.
-- Apply only after reviewing and testing in an isolated Supabase environment.
-- The event trigger is retained; only direct execution by API roles is revoked.

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

comment on function public.rls_auto_enable() is
  'Internal event-trigger helper. Direct Data API/RPC execution is not intended; event trigger ensure_rls remains enabled.';
