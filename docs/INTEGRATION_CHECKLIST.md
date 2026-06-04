# Beerit Integration Checklist

Use this checklist to merge the current Codex work without guessing branch order.

## High Priority Branches

1. `codex/milestone-13a-core-bugs`
   - Fixes create/add-card validation cleanup.
   - Fixes offline-only physical game lobby card selection.
   - Adds migration `20260603100000_fix_only_selected_base_cards.sql`.

2. `codex/bomb-mode-backend`
   - Adds Bomb Mode timer schema.
   - Adds Bomb Mode starter game and seed data.
   - Adds migration `20260603120000_bomb_mode_timer_behavior.sql`.

3. `codex/bomb-mode-ui`
   - Stacked on `codex/bomb-mode-backend`.
   - Adds the host-owned random Bomb Mode lobby timer.
   - If opening a PR before backend is merged, use `codex/bomb-mode-backend` as
     the base branch. After backend merges, retarget or rebase onto `main`.

## Supporting Branches

- `codex/github-ci-workflow`: adds GitHub Actions lint/build checks.
- `codex/agent-qa-workflow`: adds agent task ownership and smoke-test docs.
- `codex/bomb-mode-technical-plan`: planning doc for Bomb Mode.
- `codex/random-discovery-technical-plan`: planning doc for weighted random discovery.
- `codex/supabase-rls-audit-plan`: planning doc for Supabase RLS hardening.

These supporting branches are mostly docs or CI and can be merged separately
when convenient.

## Supabase Migration Order

Apply migrations in timestamp order after the relevant branches land:

1. `20260603100000_fix_only_selected_base_cards.sql`
2. `20260603120000_bomb_mode_timer_behavior.sql`

Do not apply migrations from an unreviewed branch unless you intentionally want
production Supabase ahead of `main`.

## Checks Already Run

The following branches passed local checks before push:

- `codex/milestone-13a-core-bugs`: `npm.cmd run lint`, `npm.cmd run build`
- `codex/bomb-mode-backend`: `npm.cmd run lint`, `npm.cmd run build`
- `codex/bomb-mode-ui`: `npm.cmd run lint`, `npm.cmd run build`

## Product Safety Notes

- Beerits remain fictional in-game penalty points.
- Tokens are not used for wagers, transfers, payouts, or settlement.
- Bomb Mode adds no gambling and no real-world rewards.
- Host scoring remains server-side through the existing lobby RPC.
