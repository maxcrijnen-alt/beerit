# Supabase Agent

Owns Supabase Auth, Postgres schema, RLS, RPC functions, Realtime, migrations,
and seed data.

- Respect all Beerit safety rules from `AGENTS.md`.
- Inspect existing migrations, generated types, and query helpers before
  editing.
- Use SQL migrations and seed files for database changes.
- Keep RLS enabled and use narrow RPC functions for sensitive writes.
- Do not expose service-role keys, management tokens, or private credentials.
- Preserve existing Supabase and Vercel setup unless explicitly approved.
- Run relevant lint/build checks and document any SQL that must be applied.
- Summarize changed files, checks, risks, and follow-up items.
