# Supabase RLS Audit Plan

Use this plan before merging Supabase migrations, RPC changes, lobby mutation
changes, voting/reporting changes, or friend-score changes.

## Scope

Audit these areas:

- Auth and guest behavior.
- Profiles and registered-user restrictions.
- Game creation and creator-only edits.
- Community questions and card votes.
- Game votes, reports, saves, and creator Token adjustments.
- Lobby creation, lobby card snapshots, chat, scores, and controls.
- Friend requests and shared fictional Beerits history.
- Admin moderation.

## Non-Negotiable Product Safety

- Beerits are fictional in-game penalty points only.
- Tokens are fictional creator reward points with no real-world value.
- Guests can play, like, dislike, report, and suggest questions.
- Guests cannot earn Tokens or create permanent creator profiles.
- No gambling, alcohol redemption, real-money rewards, creator payouts, Token
  transfers, Token wagers, debts, settlement, or winner payouts.

## Current Architecture Notes

- Browser sessions use Supabase Auth, including anonymous guest users.
- Sensitive writes are mostly routed through RPC functions.
- Tables have RLS enabled.
- Realtime is used for lobby presence, chat, scoreboard, and current-card
  updates.
- Lobby cards are snapshotted into `lobby_cards` so active lobbies remain
  stable after new community content is submitted.

## High-Priority Audit Checks

### 1. Table Exposure

For every table in `public`:

- RLS is enabled.
- `anon` and `authenticated` grants are intentional.
- Browser clients cannot directly write sensitive tables when an RPC should be
  used instead.
- Generated or internal tables are not exposed accidentally.

Sensitive tables:

- `profiles`
- `games`
- `game_cards`
- `game_votes`
- `game_card_votes`
- `game_reports`
- `saved_games`
- `lobbies`
- `lobby_cards`
- `lobby_players`
- `lobby_messages`
- `token_transactions`
- `friendships`

### 2. RPC Surface

For every public RPC:

- `anon` execution is revoked unless explicitly safe.
- `authenticated` execution is granted only where needed.
- The function validates `auth.uid()`.
- The function rejects anonymous users where registered users are required.
- The function uses `set search_path = ''`.
- The function does not trust user-submitted IDs without ownership checks.

Key RPCs:

- `create_lobby`
- `join_lobby_by_code`
- `control_lobby`
- `adjust_lobby_beerits`
- `score_lobby_player_and_advance`
- `send_lobby_message`
- `leave_lobby`
- `set_game_vote`
- `set_game_card_vote`
- `submit_game_report`
- `submit_community_game_card`
- `toggle_saved_game`
- `moderate_game`
- `send_friend_request`
- `respond_friend_request`
- `remove_friendship`
- `get_friend_standings`

### 3. Private Function Grants

Some private helper or mutation functions are granted to `authenticated`.
That can be acceptable only when every function performs its own authorization.

Audit question:

- Does any private function become callable by a regular browser session in a
  way that bypasses the intended public wrapper or ownership check?

Preferred rule:

- Grant public wrappers where possible.
- Keep private helpers uncallable unless there is a clear reason.
- If a private function is executable by authenticated users, document why.

### 4. Guest Restrictions

Guests must be able to:

- Play.
- Join and host lobbies.
- Like/dislike games.
- Like/dislike cards.
- Report games.
- Suggest community questions.

Guests must not be able to:

- Create profile rows.
- Create public creator games.
- Earn Tokens.
- Save games as permanent profile data.
- Access friends features.
- Become admin.

Test both:

- anonymous Supabase Auth user
- registered Supabase Auth user

### 5. Token Safety

Tokens must remain fictional creator reward points.

Audit checks:

- Token writes are not exposed to browser clients.
- Guests cannot receive Tokens.
- Tokens are not transferred between users.
- No function accepts a "stake", "wager", "payout", "settlement", or "debt"
  parameter.
- UI copy never implies money, alcohol, debt, or payout.

### 6. Beerits Safety

Beerits are game/session score only.

Audit checks:

- Lobby Beerits changes require lobby host or safe gameplay RPC.
- Beerits cannot become negative unless a future feature explicitly allows
  fictional signed balances with safe copy.
- Friend standings are derived from finished lobbies, not payment records.
- No function treats Beerits as money or redeemable value.

### 7. Lobby Snapshot Integrity

Audit checks:

- `create_lobby` either creates a valid lobby with at least one card or cleans
  up completely on failure.
- Offline-only mode does not leave orphan lobbies if no cards match.
- Normal mode can create lobbies without physical equipment selected.
- `lobby_cards` uses stable positions.
- `NEXT`, `SKIP`, and quick-score logic counts `lobby_cards`, not base
  `game_cards`.
- Active lobbies do not change order after new community submissions.

Known issue to verify in Milestone 13A:

- Offline-only selected activity filters can fail after lobby insert when no
  matching activity card exists. The fix should prevent or clean up orphan
  lobbies and return a clear user-facing error.

### 8. Community Content Moderation

Audit checks:

- Community question submissions have per-actor and per-game limits.
- Hidden cards are excluded from lobby snapshots.
- Strongly disliked cards lose selection weight or are hidden.
- Reports require a reason.
- Dislikes do not require a reason.
- Admin moderation checks database-backed admin role.

### 9. Friend Standings

Audit checks:

- Friend requests require registered users.
- Users can only respond to incoming pending requests.
- Users can only remove friendships they participate in.
- `get_friend_standings` returns only the actor's friendships.
- Shared Beerits totals only include finished lobbies where both registered
  users participated.
- Copy says there are no stakes, debts, settlement, or payouts.

## Migration Review Checklist

Before applying a new migration:

- Migration is additive where possible.
- Destructive changes have explicit approval.
- Constraints match TypeScript validation.
- New enum/check values are reflected in `src/types/database.ts`.
- New columns are backfilled or nullable with safe defaults.
- RLS is added for every new table.
- Grants are explicit.
- Realtime publication changes are intentional.
- Seed changes are idempotent.
- Rollout order is safe for deployed app code.

## SQL Inspection Queries

Use in Supabase SQL editor when auditing a hosted project.

List public table RLS state:

```sql
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

List policies:

```sql
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

List function execution grants:

```sql
select
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  r.rolname as grantee
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a on true
join pg_roles r on r.oid = a.grantee
where n.nspname in ('public', 'private')
  and a.privilege_type = 'EXECUTE'
order by n.nspname, p.proname, r.rolname;
```

Find potentially direct write grants:

```sql
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
order by table_name, grantee, privilege_type;
```

## Branch Review Output

Every Supabase/RLS review should report:

- Branch:
- Migration files changed:
- RPC functions changed:
- New grants:
- New policies:
- Tables exposed to Realtime:
- Guest behavior affected:
- Registered-user behavior affected:
- Admin behavior affected:
- Token/Beerits safety notes:
- Manual SQL applied:
- Lint/build result:
- Remaining risks:
