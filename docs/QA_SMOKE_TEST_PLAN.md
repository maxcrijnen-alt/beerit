# Beerit QA Smoke Test Plan

Run this plan before merging core gameplay, Supabase, auth, or lobby changes.
Use local development, Vercel preview, or production depending on the branch.

## Command Checks

```bash
npm run lint
npm run build
```

Expected result:

- Both commands pass.
- No secrets are printed.
- No generated folders are staged.

## Route Health Checks

Run these after starting the app locally, after a Vercel preview deploy, and
after production deploys:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/
curl http://localhost:3000/browse
curl "http://localhost:3000/browse?intent=random"
```

For production, replace `http://localhost:3000` with
`https://beerit.vercel.app`.

Expected result:

- `/api/health` returns HTTP 200 and JSON with `app: "beerit"`.
- In configured environments, `checks.supabasePublicConfig` is `configured`.
- Landing and browse routes return HTTP 200.
- No route stays stuck on only `Loading Beerit...`.
- No secret values are returned by the health endpoint.

## Git Safety Check

```bash
git status --short
git ls-files .env .env.local .vercel .next node_modules dist coverage
```

Expected result:

- Only intentional source/doc files are changed.
- The second command prints nothing.

## Auth Smoke Tests

### Guest Mode

1. Open `/auth`.
2. Start guest mode.
3. Confirm app reaches a guest-friendly home screen.
4. Confirm guest can open `/browse`.
5. Confirm guest cannot access permanent creator/profile-only features.

Expected result:

- Guest can play, like, dislike, report, and suggest questions.
- Guest cannot create public creator games or earn Tokens.

### Registered User

1. Sign in with a test registered account.
2. Open `/settings`.
3. Confirm profile data loads.
4. Open `/create`.

Expected result:

- Registered user can access creator features.
- Token copy states Tokens have no real-world value.

## Create Game Smoke Tests

Run after Milestone 13A or any game form work.

### Basic Question Game

1. Open `/create`.
2. Create a public game with one QUESTION card.
3. Leave Activity empty and Timer empty.
4. Submit.

Expected result:

- Game is created.
- Redirects to `/games/[id]`.
- Card preview shows the created card.

### Type Switching

1. Add a card.
2. Change card type from ACTIVITY to QUESTION.
3. Confirm activity kind is cleared or ignored.
4. Change card type from TIMED_EVENT to QUESTION.
5. Confirm timer is cleared or ignored.
6. Submit.

Expected result:

- No validation error from stale `activityKind` or `timerSeconds`.

### Existing Game Add Cards

1. Open creator-owned `/games/[id]/edit`.
2. Add a QUESTION card.
3. Add an ACTIVITY card.
4. Add a TIMED_EVENT card.
5. Switch one type before submitting.

Expected result:

- Valid dependent fields are saved.
- Invalid stale dependent fields are cleaned up before validation.

## Lobby Smoke Tests

### Normal Lobby

1. Open a public game detail page.
2. Create a lobby with Normal mix.
3. Leave offline equipment unchecked.
4. Start the lobby.
5. Advance through at least two cards.
6. End the lobby.

Expected result:

- Lobby creates successfully.
- One-phone play works.
- Current card and scoreboard update.
- The card progress bar advances as cards change.
- Scoreboard lists the player with the FEWEST Beerits first (lower is
  better); subtitle reads "Fewest fictional Beerits leads".
- On End, the Evening summary crowns the player with the fewest Beerits as
  rank #1 (not the most-penalised player); a tie shows tie copy.
- End screen shows replay, choose another game, home, and optional question
  contribution.

### Quick Result Undo

Run after gameplay-speed or lobby mutation changes.

1. Start a lobby with at least two cards.
2. As host, tap a losing or selected player in quick score.
3. Confirm that player's Beerits increase and the lobby advances immediately.
4. Tap "Undo last quick result".
5. Confirm the Beerits adjustment is removed and the previous card returns.
6. Quick score again, then use Skip, Previous, Next, manual plus/minus, or Stop
   the evening before undoing.

Expected result:

- Undo only reverses the latest quick-result score-and-advance action.
- Later host controls or manual score edits make the previous undo unavailable.
- If quick score finishes the final card, undo reopens the lobby at that final
  card.
- Stop the evening is definitive and clears quick-result undo.
- Friend standings still count only finished lobbies where both players used
  registered profiles.

### Offline-Only Card Games

1. Open a game detail page.
2. Create a lobby with "Only selected offline games".
3. Check only card games.
4. Start the lobby.

Expected result:

- Snapshot contains card-game activity cards only.
- Board, dice, and normal prompt cards are excluded.
- If no matching cards exist, no orphan lobby is left behind and the user gets
  a clear error.

### ONLY_SELECTED Client Validation

1. Open a public game detail page.
2. Create a lobby, select "Only selected offline games".
3. Leave all activity checkboxes unchecked.
4. Confirm the "Create lobby" button is disabled.
5. Confirm a red border and inline error appear on the activity fieldset.
6. Check at least one activity kind.
7. Confirm the button enables.

Expected result:

- Cannot submit an ONLY_SELECTED lobby with zero activity kinds checked.
- Error is visible and clear before hitting the server.

### Mixed Physical Filters

1. Create a lobby with Normal mix.
2. Check Card Games and Dice Games.
3. Include community questions.
4. Start and inspect first few cards.

Expected result:

- Base game cards remain available.
- Selected physical activity cards may appear as extras.
- Community questions may appear only when included.

## Timed Gameplay Smoke Tests

1. Open Rapid Fire Timer.
2. Create a lobby.
3. Start the lobby.
4. Confirm timer card shows a timer.
5. Start, pause, reset, and let timer reach zero.
6. Tap a losing player in quick score.

Expected result:

- Timer does not crash on card changes.
- Quick score adds Beerits and advances immediately.
- Beerits remain fictional penalty points.

## Social And Community Smoke Tests

### Game Votes

1. As guest, like a public game.
2. Toggle the same like off.
3. Dislike the game.

Expected result:

- One actor has at most one active vote.
- Guest can vote but does not earn Tokens.

### Card Votes

1. Open a game detail page.
2. Like and dislike individual cards/questions.
3. Repeat inside active lobby on the current card.

Expected result:

- Vote state updates without interrupting gameplay.
- Strong dislikes reduce future selection weight.

### Community Question

1. As guest, add a question to a public game.
2. Create a lobby with recent community questions included.

Expected result:

- Question can be submitted.
- Guest earns no Tokens.
- New lobby can include recent community questions.

## Friends Smoke Tests

1. Sign in as registered user A.
2. Send friend request to registered user B.
3. Accept as user B.
4. Finish a lobby where both registered users participate.
5. Open `/friends`.

Expected result:

- Shared standings show historical fictional Beerits.
- Copy does not imply debts, payment, settlement, or payouts.

## Moderation Smoke Tests

1. Submit a report with a reason.
2. Confirm duplicate reports from the same actor are blocked.
3. As an admin test user, open `/admin/moderation`.
4. Hide and unhide a game.

Expected result:

- Reports are protected by RPC/RLS.
- Admin-only moderation works.
- Hidden games disappear from public discovery.

## Regression Notes Template

For each tested branch, report:

- Branch:
- Commit:
- Environment:
- Checks run:
- Routes tested:
- Supabase changes applied:
- Pass/fail:
- Known risks:
- Follow-up:
