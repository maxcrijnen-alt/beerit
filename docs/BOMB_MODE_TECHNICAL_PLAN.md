# Bomb Mode Technical Plan

Milestone 13B adds a Bomb Mode / Hot Potato style timed round. This document is
implementation planning only. It does not change product code.

## Product Boundaries

- Bomb Mode is a party timer mechanic, not gambling.
- No stakes, wagers, payouts, debts, settlement, Token transfer, or real-world
  reward.
- The losing/current-holder player receives fictional Beerits only.
- Hosts stay responsible for selecting the loser after the timer ends.
- Players can skip uncomfortable prompts.

## Target Player Flow

1. Host creates a lobby for a Bomb Mode-capable game.
2. Host starts the lobby.
3. A Bomb Mode card appears.
4. Timer starts automatically.
5. Timer duration is random per round.
6. When time ends, the UI shows a clear BOOM state.
7. Host taps the loser/current holder.
8. Selected player receives Beerits.
9. Lobby advances immediately to the next card.

Default random range:

- Minimum: 20 seconds.
- Maximum: 180 seconds.

Future presets:

- Short: 20 to 45 seconds.
- Medium: 45 to 90 seconds.
- Long: 90 to 180 seconds.
- Chaos: 20 to 180 seconds.

## Recommended Data Model

Use a small Supabase migration that extends `game_cards` instead of building a
separate timer system.

Add columns:

```sql
timer_behavior text not null default 'FIXED'
timer_min_seconds integer
timer_max_seconds integer
```

Allowed behavior:

```text
FIXED
RANDOM_BOMB
```

Rules:

- Existing `TIMED_EVENT` cards keep `timer_behavior = 'FIXED'`.
- Fixed timers continue using existing `timer_seconds`.
- Bomb Mode cards use `timer_behavior = 'RANDOM_BOMB'`.
- Bomb Mode cards require `timer_min_seconds` and `timer_max_seconds`.
- `timer_min_seconds` must be at least 5.
- `timer_max_seconds` must be at most 300.
- `timer_max_seconds` must be greater than or equal to `timer_min_seconds`.

Why this shape:

- Preserves existing Rapid Fire behavior.
- Avoids a duplicate timer table.
- Allows creator-configurable timers later.
- Keeps the lobby card snapshot model intact.

## TypeScript Updates

Update:

- `src/types/database.ts`
- `src/lib/validation/games.ts`

New type:

```ts
export const TIMER_BEHAVIORS = ["FIXED", "RANDOM_BOMB"] as const;
```

Validation:

- `FIXED` requires `timerSeconds`.
- `RANDOM_BOMB` requires `timerMinSeconds` and `timerMaxSeconds`.
- Non-timed cards must not carry timer fields.

## UI Components

Existing timer files:

- `src/components/lobbies/timed-event-timer.tsx`
- `src/components/lobbies/lobby-room.tsx`
- `src/components/games/current-game-card.tsx`

Recommended component split:

```text
TimedEventTimer
BombModeTimer
```

`TimedEventTimer` stays simple and fixed.

`BombModeTimer` owns:

- random duration generation
- auto-start on mount/card change
- countdown
- BOOM state
- reset/re-roll for host if needed

The random duration should be generated client-side when the card mounts. It is
party utility state, not security-sensitive. The actual Beerits change remains
server-side through the existing quick-score RPC.

## Lobby Logic

Existing safe RPC:

- `score_lobby_player_and_advance`

Keep using it after BOOM:

1. Timer reaches zero on the host device.
2. Host sees "Who held it when it exploded?"
3. Host taps a player.
4. Existing RPC adds Beerits and advances.

No Token changes. No balance transfers.

## Starter Content

Add a starter public game:

```text
Title: Bomb Mode
Category: Challenges or Custom Rules
Concept: Hot potato random timer
Min players: 2
Max players: 20
Intensity: Funny
```

Example cards:

- Pass the phone around while naming snacks. No repeats.
- Pass the phone while naming cities.
- Pass the phone while saying things you find in a student house.
- Pass the phone while naming songs everyone knows.
- Pass the phone while giving harmless compliments.
- Pass the phone while naming board/card/dice games.

Each card:

- `card_type = TIMED_EVENT`
- `timer_behavior = RANDOM_BOMB`
- default range 20 to 180 seconds
- `beerits_value = 1`

## Implementation Milestones

### 13B.1 Schema And Types

- Add migration for timer behavior fields.
- Update database types.
- Preserve existing fixed timer cards.
- Add seed content for Bomb Mode.

Checks:

- Existing Rapid Fire cards still validate.
- Existing build passes.

### 13B.2 Timer UI

- Add `BombModeTimer`.
- Auto-start random duration.
- Show BOOM state.
- Keep reduced-motion support.
- Keep large mobile tap targets.

Checks:

- Timer resets on card change.
- Timer does not continue after component unmount.
- Fixed Rapid Fire timer still works.

### 13B.3 Gameplay Integration

- Render `BombModeTimer` when current card has `timer_behavior = RANDOM_BOMB`.
- After BOOM, show clear host action copy.
- Host taps loser/current holder to use existing quick-score-and-next.
- Non-hosts can see timer state but cannot score.

Checks:

- Host can award Beerits and advance.
- Non-host cannot score.
- Finished lobby still shows post-game options.

### 13B.4 QA

Manual smoke tests:

- Create Bomb Mode lobby.
- Start lobby.
- Confirm timer auto-starts.
- Wait for BOOM.
- Tap loser.
- Confirm Beerits increase and next card appears.
- Confirm no Token changes.

## Risks

- Realtime timer synchronization: host and non-host timers may not match exactly
  if generated independently. For MVP, host-owned timer is acceptable. Later,
  store the generated end time in lobby state if synchronized timers become
  required.
- Current `TimedEventTimer` is local state only. Bomb Mode should keep scoring
  server-side but can keep countdown local for MVP.
- Adding timer fields requires keeping Supabase SQL, `src/types/database.ts`,
  and validation schemas in sync.

## Non-Goals

- No online hot potato physics.
- No real-time custody tracking of who holds the phone.
- No wagers or Token stake.
- No payout or settlement.
- No push notifications.
