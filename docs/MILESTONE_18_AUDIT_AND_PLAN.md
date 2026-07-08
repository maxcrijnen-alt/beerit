# Milestone 18 Audit And Plan

## Current State Snapshot

Beerit is a mobile-first social party game app built with Next.js, TypeScript, Tailwind, shadcn-style primitives, Supabase Auth/Postgres/RLS/Realtime, TanStack Query, and small Zustand stores.

Current product model:
- All gameplay happens through lobbies, including one-phone play.
- Beerits are fictional in-game penalty points.
- Tokens are fictional creator/status/cosmetic points with no real-world value.
- Guests can play, like, dislike, report, and suggest questions.
- Guests cannot earn Tokens or create permanent creator/friend history.
- The app must not add gambling, alcohol redemption, real-money rewards, payouts, token wagers, debts, settlement, or transfer logic.

## Inspected Areas

Codex inspected the existing implementation before editing:
- Game creation validation and card normalization.
- Add-card/community-question flows.
- Lobby creation defaults and offline activity selection.
- Random game picker client flow and Supabase RPC shape.
- Lobby realtime room, current card, scoreboard, quick result, undo, chat, session questions, and post-game actions.
- Bomb mode and timed event components.
- Friend Balance helper and finished-lobby summary copy.
- Relevant Supabase migrations for lobby cards, random picking, gameplay speed, topics, reports, session questions, and starter content.

## Milestone 18A Findings

Already handled or mostly handled:
- Physical games can exist without prompt cards when rules/activity guidance is present.
- Activity/timer/bomb card field normalization exists in shared validation.
- `ONLY_SELECTED` offline activity mode includes the base physical game plus matching shared activity cards through the existing Supabase snapshot migration.
- Random picker excludes hidden games and supports weighted pools, recent exclusions, categories, intensities, player counts, duration, and content mode.
- Lobby flow already has quick score, undo last quick result, stop evening, post-game actions, session-only questions, and public community question suggestions.

Low-risk fixes made in this branch:
- Finished evening summary now ranks players by fewest Beerits first, matching the copy and Friend Balance placement logic.
- Session question deletion now includes `lobby_id` in the delete filter, so the action is scoped to the intended lobby as well as the question id.

## Milestone 18B: Start Avond Flow

Owner split:
- Claude Code: UX, wording, layout, onboarding clarity.
- Codex: server action/data flow, validation, QA, route smoke checks.

Goal:
A new user should be able to start an evening from Home in under 60 seconds.

Recommended implementation:
1. Change the primary Home CTA from generic random game language to `Start avond`.
2. Add a mobile-first setup surface with these inputs:
   - player count or quick player names,
   - available materials: none, cards, dice, board games, mixed,
   - vibe/intensity,
   - time available,
   - spicy/18+ opt-in off by default.
3. Reuse the existing random picker first instead of building a second random system.
4. Pass setup choices into the existing lobby creation route as query defaults.
5. Keep Browse and Create Game available, but secondary.
6. Add empty/loading/error states for “no matching game found”.

Avoid for this milestone:
- New DB schema unless needed after UX proves the setup flow.
- Friend Balance changes.
- Any Token economy logic.

Acceptance checks:
- Home can start a random playable lobby in under 60 seconds.
- Users with no materials can choose prompt-only games.
- Users with only cards/dice/board games are not assigned incompatible physical games.
- Spicy/18+ content only appears after explicit opt-in.

## Milestone 18C: Random Engine Improvements

Owner split:
- Codex: random selection logic, validation, no-repeat safeguards, QA.
- Claude Code: filter copy, explanation UI, category/topic content.

Current foundation:
- `pick_random_game` RPC exists.
- Client fallback exists.
- Zustand tracks recent random game ids.
- Game ranking includes likes, dislikes, plays, reports, newness, and pool strategy.

Recommended implementation:
1. Add a clear setup-to-random DTO shared by Home setup and Browse random filters.
2. Add explicit material fit modes:
   - no materials,
   - cards only,
   - dice only,
   - board games only,
   - mixed materials,
   - anything.
3. Preserve existing content mode but make copy clearer: prompt-only, physical-only, both.
4. Add a “why this was picked” explanation after random selection:
   - category match,
   - materials match,
   - liked/recent/hot signal,
   - not recently shown on this device.
5. Keep hard exclusions server-side for hidden content.
6. Treat heavily reported/disliked content as lower weight first; only hide automatically when moderation rules mark it hidden.
7. Add route-level smoke checks for random browse and lobby-create URLs.

Potential future DB change, not for the first pass:
- A small table for account/session-level random history if device-only no-repeat becomes too weak.

Acceptance checks:
- No hidden games are returned by random.
- Recent picks repeat less often.
- Highly liked games appear more often but do not fully dominate.
- Disliked/reported games appear less often.
- Material filters behave exactly as the setup text promises.

## Milestone 18D: Gameplay And Bomb Mode Polish

Owner split:
- Codex: state transitions, timer behavior, quick result reliability, undo QA.
- Claude Code: mobile layout, button wording, timer presentation, beginner instructions.

Current foundation:
- Lobby room supports current card, quick scoring, undo, stop evening, scoreboard, chat, session questions, and post-game actions.
- Bomb mode timer exists with hidden countdown and BOOM state.
- Timed event timer exists for fixed timed rounds.

Recommended implementation:
1. Make the current card area visually dominant on mobile.
2. Keep chat secondary in a sheet/drawer.
3. Make quick result one-tap for host-phone play.
4. Add clearer disabled copy for bomb mode before BOOM.
5. Add optional timer visibility for hosts:
   - hidden timer default,
   - visible countdown option for beginner groups.
6. Add post-game “skip adding a question” path that cleanly offers:
   - home,
   - rematch,
   - choose another game.
7. Keep undo limited to the last quick-result action only.

Avoid for this milestone:
- Sound effects unless explicitly requested later.
- Online implementations of physical games, dice, chess, or cards.
- Friend Balance schema changes.

Acceptance checks:
- Host can tap the loser/winner and immediately advance.
- Undo restores only the latest quick result.
- Bomb mode cannot quick-score until BOOM.
- Finished summary shows the fewest Beerits first.
- Post-game flow never traps the user into adding a question.

## Coordination Plan For Codex And Claude Code

Codex should continue with technical/backend/QA tasks:
- server action safety,
- Supabase migrations/RLS review,
- random picker correctness,
- lobby state transitions,
- build/lint/smoke checks,
- deployment readiness.

Claude Code should continue with UX/content/UI tasks:
- Start Avond setup copy and layout,
- gameplay screen polish,
- physical game instructions,
- topic/pack copy,
- mobile empty/loading/error states.

Rules for both:
- Work on separate feature branches.
- Do not edit the same files at the same time if avoidable.
- Codex reviews Claude for data/safety risks.
- Claude reviews Codex for flow clarity and mobile usability.
- Run lint and build before finalizing.
- No force-push.

## Prompt To Send To ChatGPT Or Claude

Use this prompt when asking for the next product/UX review:

```text
We are building Beerit: a mobile-first social party game platform for students and friend groups. The goal is to make it the default way groups start and run game nights.

Current app state:
- Next.js + TypeScript + Tailwind.
- Supabase Auth/Postgres/RLS/Realtime.
- Mobile-first lobby gameplay.
- Guests can play, vote, report, and suggest questions.
- All gameplay happens through lobbies, including one-phone play.
- Beerits are fictional in-game penalty points.
- Tokens are fictional creator/status/cosmetic points with no real-world value.
- No gambling, alcohol redemption, real-money rewards, creator payouts, token transfers, wagers, debts, settlement, or payout mechanics.

Implemented foundations:
- Game browser with categories, intensities, duration/player filters, and random picker.
- Physical games such as card, board, and dice categories with rules/instructions.
- Community questions can be suggested for games.
- Games/cards can be liked, disliked, and reported.
- Lobbies support current card, scoreboard, chat, quick score, undo last quick result, stop evening, post-game actions, timed events, bomb mode, and session-only questions.
- Random game selection weights likes/dislikes/plays/reports/newness and avoids recent picks locally.
- Spicy/18+ content should be opt-in only.

Current planned milestones:
1. Start Avond Flow: make Home start a whole evening quickly with players, materials, vibe, time, and spicy opt-in.
2. Random Engine Improvements: better material fit, no-repeat safeguards, explanation of why a game was picked, clearer prompt/physical/both filters.
3. Gameplay Polish: make current card dominant, quick result smoother, chat secondary, bomb mode clearer, and post-game choices cleaner.
4. Topics/Packs: topics per game, beginner-friendly packs, questions weighted by likes/dislikes/reports.
5. Beta Readiness: route smoke tests, analytics without sensitive content, moderator/admin workflow, strong starter packs.

Please review this as a product strategist for student game nights. Suggest the highest-impact next improvements, point out confusing mechanics, and help refine the Start Avond + Random + Gameplay flow without adding gambling, real-money, alcohol redemption, payouts, debts, or token transfers.
```

## Manual Live App Tests

After merging/deploying this branch, manually test:
1. Open Home on mobile width.
2. Start or join a lobby.
3. Add two or more players.
4. Score a player through quick result.
5. Undo the last quick result.
6. Stop the evening.
7. Confirm the summary lists the player with the fewest Beerits first.
8. Add a session-only question.
9. Remove that session-only question as host or submitter.
10. Confirm public browse and random still load.