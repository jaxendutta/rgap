-- Supabase flagged every table below as "publicly accessible" because RLS
-- is off: the anon/authenticated PostgREST roles have implicit SELECT/
-- INSERT/UPDATE/DELETE grants on public-schema tables in this project (the
-- pre-Oct-2026 default), and with RLS disabled those grants are unchecked.
--
-- This app never queries through Supabase's Data API (PostgREST/GraphQL/
-- supabase-js) -- it connects directly as the `postgres` role via `pg`.
-- Postgres table owners bypass RLS by default, so enabling RLS with zero
-- policies denies the anon/authenticated API roles entirely while leaving
-- this app's direct connection untouched.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_searches ENABLE ROW LEVEL SECURITY;
