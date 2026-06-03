# Beerit MVP Implementation Plan

Beerit is a mobile-first social party game platform. Beerits are fictional
in-game penalty points. Tokens are creator reward points with no real-world
value. The MVP must not include gambling, alcohol redemption, real-money
rewards, or creator payouts.

## Milestone 1: Project foundation and database

Goal: establish a Vercel-ready Next.js project and a secure Supabase schema
before building product screens.

Status: completed.

- Set up Next.js, TypeScript, Tailwind CSS, ESLint, and shadcn/ui.
- Add Supabase browser, server, and session-refresh clients.
- Add `.env.example` and project-specific `AGENTS.md`.
- Document local setup, Supabase setup, seeding, and Vercel deployment.
- Add a SQL migration with tables, indexes, grants, RLS policies, triggers,
  moderation thresholds, vote handling, Token handling, and lobby mutations.
- Add starter seed data for exactly five public games.
- Verify lint and production build.

Exit criteria:

- The project installs and builds without Supabase keys.
- Supabase configuration has a clear setup path.
- Every public-schema table has RLS enabled.
- Data API grants are explicit and limited by role.
- Starter data can be loaded after the migration.

## Milestone 2: Authentication and profiles

Goal: support registered users and guest sessions.

Status: completed.

- Build `/auth` with email/password registration and login.
- Add guest mode with anonymous Supabase Auth and a lightweight name cookie.
- Create profiles for registered users.
- Add profile and settings pages with Token and badge placeholders.
- Protect creation features from guest access.
- Add an RLS guard so anonymous auth users cannot create profiles, games, or
  saved games.

Exit criteria:

- A guest can enter the app without registering.
- A registered user can create and update a profile.
- Guest-only restrictions are clearly explained in the interface.

## Milestone 3: Games

Goal: let users browse, inspect, create, and remix games.

Status: completed.

- Build landing, home, browse, and game-detail routes.
- Add sorting and filters for category, intensity, and player count.
- Add registered-user game creation with React Hook Form and Zod.
- Add card editing, ordering, visibility, and remix support.
- Add loading, empty, and error states.

Exit criteria:

- Seeded public games are browsable.
- A registered user can create a private, unlisted, or public game.
- A registered user can remix a public game into an editable copy.

## Milestone 4: Lobby and gameplay

Goal: implement the primary playable flow through lobbies, including one-phone
play.

Status: completed.

- Create lobby, join-by-code, waiting-room, and play routes.
- Add registered and guest players.
- Add host-only start, advance, skip, previous, and end actions.
- Add Beerits controls and final scoreboard.
- Add lobby chat.
- Use Supabase Realtime for lobby presence, chat, scoreboard, and current-card
  updates where practical.

Exit criteria:

- A host can create a lobby for any playable game.
- Guests can join with a display name.
- Players can complete a game and view the final scoreboard.

## Milestone 5: Social and moderation

Goal: add safe community mechanics and creator rewards.

Status: completed.

- Add like, dislike, and report actions.
- Use safe server-side or database logic for counters and Token changes.
- Ensure guests can vote and report but cannot earn Tokens.
- Add automatic hiding for moderation thresholds.
- Add a basic admin moderation page.

Exit criteria:

- One actor has at most one vote per game.
- Like changes adjust creator Tokens correctly.
- Reported or heavily disliked games can be hidden from discovery.

## Milestone 6: Polish and release checks

Goal: prepare the MVP for GitHub and Vercel deployment.

Status: completed.

- Add ad placeholders outside active gameplay.
- Confirm responsible-play language is visible.
- Check mobile navigation and responsive layouts.
- Run lint, production build, and browser verification of the primary flow.
- Update README with final included and deferred features.

Exit criteria:

- The main mobile flow works end to end.
- Active gameplay never contains ad placeholders.
- Lint and production build pass.

## Milestone 7: Creator editing

Goal: let creators grow existing games and describe ideas outside preset
categories.

Status: completed.

- Add an optional free-form concept field to games.
- Include creator concepts in game cards, detail pages, and Browse search.
- Add an owner-only management route for existing games.
- Let owners add multiple questions, dares, votes, rules, challenges, or
  manual-scoring cards to an existing game.
- Keep card additions protected by the existing registered-creator RLS rules.

Exit criteria:

- A registered creator can add cards to their own existing game.
- Other users and guests cannot add cards to someone else's game.
- A creator can use their own concept text instead of relying only on preset
  categories.

## Milestone 8: Community cards and mixed lobbies

Goal: let a group build a varied evening from multiple game sources while
keeping community questions useful.

Status: completed.

- Let guests and registered users suggest questions for discoverable games.
- Add per-card likes and dislikes through protected database functions.
- Reduce the selection chance of disliked questions and hide strongly disliked
  community questions automatically.
- Snapshot lobby cards when a room is created so active games remain stable.
- Let hosts include recent community questions and mix extra public
  categories.
- Add optional board-game, card-game, dice-game, and other-activity filters for
  items available that evening.
- Add starter activity cards for chess, a card round, and a dice round.

Exit criteria:

- New community submissions cannot change the order of an active lobby.
- A guest can submit and vote on questions without receiving Tokens.
- A host can create one lobby containing cards from several categories.
- Offline activity suggestions appear only when the host opts into their
  activity kind.

## Milestone 9: Offline game library

Goal: support evenings built entirely around the physical games a group has
available.

Status: completed.

- Add an offline-only lobby mode alongside the normal Beerit mix.
- Let hosts choose only card games, only board games, only dice games, or a
  combination.
- Let hosts leave all activity types unchecked in normal mode when no physical
  equipment is available.
- Add browsable Board Games and Dice Games categories beside Card Games.
- Add starter rules and fictional Beerits scoring for familiar card, board,
  and dice games.
- Keep creator-added offline games as normal cloud items with likes, dislikes,
  and weighted random discovery.

Exit criteria:

- A lobby created with offline-only card games contains no board-game,
  dice-game, or normal prompt cards.
- Card Games, Board Games, and Dice Games can be selected directly in Browse.
- Each starter offline game explains the physical setup, play flow, and
  fictional Beerits outcome.
- Liked creator games gain a higher chance of appearing in random discovery
  and random offline lobby snapshots; dislikes reduce that chance.

## Milestone 10: Cleaner gameplay and timed rounds

Goal: make active play faster and beginner-friendly.

Status: completed.

- Add full-rules links for familiar offline games.
- Add creator-configurable timed-event cards.
- Add a Rapid Fire Timer starter game with trivia, personal, and category
  prompts.
- Add an atomic host action that awards fictional Beerits and advances to the
  next card immediately.
- Keep like and dislike controls available in a compact gameplay layout.
- Ask players for a future community question after a lobby finishes.

## Milestone 11: Safe friend standings

Goal: let registered friends compare play history without turning Tokens into
stakes, payouts, or debts.

Status: completed.

- Add registered-user friend requests, acceptance, removal, and cancellation.
- Derive shared Beerits totals from finished cloud lobby rooms.
- Keep Tokens non-transferable and limited to creator rewards.
- Do not add wagers, settlement, winner payouts, or balance transfers.

## Milestone 12: Mobile app polish

Goal: make the installed mobile experience feel smoother and remove friction
after gameplay.

Status: completed.

- Add safe-area spacing for installed mobile layouts.
- Add subtle page and card transitions with reduced-motion support.
- Increase common tap targets and add touch feedback.
- Make the post-game question contribution optional.
- Add direct post-game actions for replay, Browse, and Home.
