# Milestone 13B — Bomb Mode

## What it is

Bomb Mode is a card variant in which one player holds a "bomb" that gets passed
around before a timer expires. When time runs out the player holding the bomb
receives Beerits. It is purely fictional — no real penalty, no alcohol required.

## Responsible-play constraints (non-negotiable)

- Players can always pass. Nobody is forced to keep the bomb.
- The host can defuse the bomb at any time via the existing host controls.
- Copy must read: "Pass any time. The bomb is just for fun."

## Scope of Milestone 13B

Split into two parallel workstreams so backend and frontend can land separately.

### 13B-backend (Codex)

1. **Migration**: add `'BOMB'` to the `game_card_types` check constraint.
2. **`game_cards` schema**: `timer_seconds` is required for `BOMB` cards (same
   rule as `TIMED_EVENT`, reuse existing validation path).
3. **`lobbies` table**: add `current_bomb_holder_player_id uuid references
   lobby_players(id) on delete set null`.
4. **RPC `pass_bomb(p_lobby_id uuid, p_to_player_id uuid)`**:
   - Only callable by the current bomb holder or the host.
   - Updates `current_bomb_holder_player_id`.
   - Broadcast via existing Supabase Realtime channel (no new channel needed).
5. **RPC `detonate_bomb(p_lobby_id uuid)`**:
   - Only callable by the host.
   - Awards `beerits_value` from the current bomb card to the holder.
   - Clears `current_bomb_holder_player_id`.
   - Calls existing `advance_lobby` logic to move to the next card.
6. **RLS**: `current_bomb_holder_player_id` readable by all players in the lobby.

### 13B-frontend (Claude Code)

1. **Game card editor** (`game-card-editor.tsx`):
   - Add `BOMB` to the card-type select options.
   - When `BOMB` is selected, enforce a timer (same UX as `TIMED_EVENT` — show
     the timer input, hide it for other types).
   - Zod schema already covers TIMED_EVENT timer rule; extend it to BOMB.
2. **Active lobby card display** (`lobby-card.tsx` or equivalent):
   - Detect `card_type === 'BOMB'` and render a bomb visual (red background,
     countdown ring using existing timer component if available).
   - Show "Pass bomb →" button for the current holder; show "Waiting…" for others.
   - Show "Defuse" button for the host only.
3. **Scoreboard / Beerits chip**: highlight the bomb holder with a small bomb
   icon next to their name.
4. **Responsible-play copy**: visible beneath every bomb card.

## UX flow

```
Card drawn → card_type === 'BOMB'
  → lobby sets current_bomb_holder = card dealer (host determines first holder)
  → timer starts (countdown ring visible to all)
  → holder sees [Pass →] button; others see [Waiting for pass…]
  → on pass: RPC updates holder, Realtime pushes new state
  → timer expires (client-side): host sees [Detonate] button
  → host taps Detonate → holder gets Beerits → lobby advances
```

## Data model additions (summary)

```sql
-- game_card_types: add 'BOMB'
-- lobbies: add current_bomb_holder_player_id
-- new RPCs: pass_bomb, detonate_bomb
```

## Not in scope

- Automatic detonation (server-side timers): deferred to a later milestone.
- Multiple simultaneous bombs.
- Token rewards tied to bomb outcomes.

## Recommended branch names

| Workstream | Branch |
|---|---|
| Backend | `codex/bomb-mode-backend` |
| Frontend | `claude/bomb-mode-frontend` |

Frontend branch should merge only after the backend migration is live.
