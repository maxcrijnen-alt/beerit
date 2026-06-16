# Beerit

Beerit is a mobile-first social party game platform where friends can browse,
play, create, and remix party games. Every game runs through a lobby, including
one-phone play.

Beerits are fictional in-game penalty points. They do not require alcohol.
Tokens are creator reward points with no real-world value. Beerit does not
include gambling, alcohol redemption, real-money rewards, or creator payouts.

Live MVP: [https://beerit.vercel.app](https://beerit.vercel.app)

> Beerit is a party game platform. Beerits are fictional penalty points and do
> not require alcohol. Play responsibly and follow local laws.

## Current milestone

This repository currently contains milestones 1 through 12: the project
foundation, database setup, authentication, profiles, game catalog, and
playable lobby flow, social and moderation actions, and release polish.

Included:

- Next.js App Router, React, TypeScript, Tailwind CSS, and ESLint
- shadcn/ui configuration with Radix primitives, Lucide icons, and theme tokens
- React Hook Form, Zod, TanStack Query, and Zustand dependencies
- Supabase browser, server, admin, and session-refresh clients
- Email/password registration and login through Supabase Auth
- Anonymous Supabase Auth guest sessions with a lightweight display-name cookie
- Mobile-first landing, auth, home, profile, and settings pages
- Guest restrictions for permanent profiles, game creation, and creator Tokens
- Profile editing, Token balance display, and badge placeholders
- Mobile-first browse page with search, filters, ranking, weighted random sort,
  game cards, empty states, and a future native-ad placeholder
- Game detail pages with metadata, rules, interactive social actions, and card
  previews
- Registered-user game creation with React Hook Form, Zod, visibility controls,
  and an ordered card editor
- Creator-defined free-form concepts that appear on game cards and in search
- Owner-only game management for adding questions and other cards to an
  existing game
- Community question submissions and per-card likes or dislikes for guests and
  registered users
- Lobby snapshots that can mix the base game with recent community questions,
  extra public categories, and available offline activities
- Built-in board-game, card-game, and dice-game activity examples, including a
  short chess activity
- Optional offline-only lobby mode, including card-games-only, board-games-only,
  and dice-games-only evenings
- Browsable offline game library with rules and fictional Beerits scoring for
  familiar card, board, and dice games
- Cloud publishing for creator-added offline games. Weighted random discovery
  favors liked games and reduces the chance of disliked games.
- Beginner-rule links for offline games and a Rapid Fire Timer game with
  trivia, personal, and category prompts
- Active-lobby quick score buttons that award fictional Beerits and continue
  to the next card in one action
- Last quick-result undo so a host can recover from one accidental tap
- End-of-game question submissions for future lobbies
- Registered friend requests and persistent shared Beerits statistics derived
  from finished cloud lobby rooms
- App-like mobile polish with safe areas, larger tap targets, subtle
  transitions, and an optional post-game contribution flow
- Remix flow that copies game details and cards into an independently ranked
  creator game
- Lobby creation, join-by-code, waiting room, one-phone play, gameplay controls,
  final scoreboard, and lobby chat
- Supabase Realtime subscriptions for lobby presence, chat, Beerits scoreboard,
  and current-card updates
- Safe database functions for lobby writes, with direct lobby table writes
  removed from browser sessions
- Likes, dislikes, saved games, guest reports, creator Token adjustments, and
  a database-protected admin moderation page
- Safe database functions for social writes, with direct vote, report, and
  saved-game writes removed from browser sessions
- SQL migration with tables, indexes, RLS, explicit Data API grants, triggers,
  Realtime publication, vote counters, report thresholds, and creator Tokens
- Follow-up RLS migration that distinguishes guests from permanent users using
  the Supabase `is_anonymous` JWT claim
- Seed SQL with exactly five starter games and eight cards per game
- Vercel-ready environment configuration
- Mobile safe-area support for the fixed navigation bar
- Global loading and recovery screens
- Installable mobile web-app manifest
- Production deployment at [beerit.vercel.app](https://beerit.vercel.app)

Not built yet:

- Real ads, public comments, custom domains, bar partnerships, settlements, or
  payouts

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the phased roadmap.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4 and shadcn/ui
- Supabase Auth, Postgres, Row Level Security, and Realtime
- TanStack Query for client-side server-state caching
- React Hook Form and Zod for forms and validation
- Zustand for small client-only state such as filters and guest UI state
- Vercel for deployment

## Install

Requirements:

- Node.js 22 or newer
- npm
- A Supabase project

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in the public project values from
the Supabase dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

For new Supabase projects, prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
`NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported as a legacy fallback. Only one of
those two public keys is required.

`SUPABASE_SERVICE_ROLE_KEY` is optional. Add it only for trusted server jobs
that need to bypass RLS. Never expose it with a `NEXT_PUBLIC_` prefix.

The app intentionally builds without Supabase keys so the project foundation
can be checked before external configuration is complete.

## Supabase setup

1. Create a Supabase project.
2. Enable anonymous sign-ins in the Supabase Auth settings. Guests will use
   anonymous Supabase Auth sessions for lobby Realtime access.
3. Open the Supabase SQL editor.
4. Apply all SQL files in [`supabase/migrations`](./supabase/migrations) in
   filename order.
5. Run [`supabase/seed.sql`](./supabase/seed.sql).
6. Add the environment variables to `.env.local`.
7. For a trusted moderation account, set `profiles.role` to `ADMIN` manually
   in the SQL editor. The app does not expose role changes to browsers.

The migration grants Data API access explicitly. This matters for Supabase
projects created after the April 28, 2026 Data API exposure change. RLS remains
enabled on every table in the exposed `public` schema.

The lobby tables are added to the `supabase_realtime` publication:

- `lobbies`
- `lobby_players`
- `lobby_messages`

The lobby UI subscribes to presence, chat, scoreboard, and current-card
updates.

### Optional local Supabase CLI flow

The SQL files use the standard Supabase layout:

```text
supabase/
  config.toml
  migrations/
    20260601130000_initial_schema.sql
    20260601150000_guest_profile_guards.sql
    20260601170000_unlisted_direct_links.sql
    20260601180000_lobby_gameplay_rpc.sql
    20260601190000_social_moderation_rpc.sql
    20260601200000_social_rls_cleanup.sql
    20260601210000_add_game_concept.sql
    20260601220000_community_game_cards.sql
    20260601230000_offline_game_library.sql
    20260601240000_game_guides_and_timed_rounds.sql
    20260601250000_friendships.sql
  seed.sql
```

When the Supabase CLI is available, the same migration and seed can be applied
through a normal local reset workflow. For a hosted project, the SQL editor
steps above are the direct setup path.

## Database safety model

- Registered users and guests use authenticated Supabase sessions. Guest
  sessions are anonymous auth users and do not receive profile rows.
- Guests can play, like, dislike, and report. They cannot create public games
  or earn Tokens.
- Guests and registered users can suggest questions for discoverable games and
  vote on individual cards. Per-session and per-game limits reduce spam.
- Registered creators earn one Token when their game receives a like. Removing
  the like subtracts that Token.
- Vote, report, and saved-game totals are updated by private database triggers.
- Games are hidden from discovery after five reports, or after ten dislikes
  when dislikes are more than twice the likes.
- Token writes are not exposed to browser clients.
- Lobby rows, players, and messages are protected by RLS. Lobby writes use
  narrow database functions, while Realtime keeps presence, chat, scores, and
  active cards synchronized.
- Each lobby receives a stable card snapshot. Optional lobby filters can add
  recent community questions, cards from several public categories, and only
  the offline activities available to the group that evening.
- A host can switch to an offline-only lobby. Selecting only card games, for
  example, guarantees that the snapshot contains only card-game activities.
- Public creator games can be liked or disliked like starter games. Weighted
  random Browse ordering and offline lobby activity selection both use those
  popularity signals.
- Friend standings are historical fictional Beerits totals only. Beerit does
  not support stakes, debts, settlement, Token transfers, or winner payouts.
- Vote, report, and saved-game writes use narrow database functions instead of
  browser table writes. Creators cannot vote on their own games.
- Admin moderation uses the same pattern and checks the database-backed
  `ADMIN` role before changing visibility.

## Available routes

- `/` - landing page
- `/auth` - login, registration, and guest mode
- `/home` - authenticated home dashboard
- `/profile/[username]` - public creator profile
- `/settings` - registered profile editor or guest account limits
- `/browse` - searchable and filterable public game catalog
- `/games/[id]` - game metadata, rules, card preview, and lobby CTA
- `/games/[id]/remix` - registered-user remix editor
- `/games/[id]/edit` - owner-only concept editor and add-cards flow
- `/create` - registered-user game editor or guest restriction
- `/lobby` - join-by-code and recent lobby rooms
- `/lobby/create/[gameId]` - create a lobby for a selected game
- `/lobby/[id]` - waiting room, gameplay, scoreboard, presence, and chat
- `/friends` - friend requests and shared fictional Beerits history
- `/admin/moderation` - admin-only review queue for reports and dislikes
- `/api/health` - deployment health JSON for smoke checks; it reports whether
  public Supabase config is present without exposing secret values

## Deploy to Vercel

The current MVP is deployed at
[https://beerit.vercel.app](https://beerit.vercel.app).

Recommended setup:

1. Keep this repository on GitHub.
2. Connect the Vercel project to the GitHub repository.
3. Let Vercel build production deployments from the `main` branch.
4. Keep `.vercel` as local CLI metadata only. It is intentionally ignored by
   Git and should not be committed.
5. Store real environment variable values in Vercel and `.env.local`, never in
   the repository.

For a fresh Vercel project:

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables from `.env.local`.
4. Deploy. Vercel detects the Next.js project automatically.
5. Apply the Supabase migration and seed before testing product flows.

## Working on feature branches

Use branches for Codex, Claude Code, and future agents:

```bash
git checkout main
git pull
git checkout -b codex/short-task-name
```

Keep each branch focused on one milestone or bug fix. Before asking another
agent to review or continue, run:

```bash
npm run lint
npm run build
```

Do not force push or overwrite another agent's work unless the owner explicitly
approves it.

## Checks

Run before finalizing changes:

```bash
npm run lint
npm run build
```

Optional route smoke check after starting the app or deploying:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/
curl http://localhost:3000/browse
curl "http://localhost:3000/browse?intent=random"
```
