# Random Discovery Technical Plan

Milestone 14 improves random game discovery, filters, and repeat prevention.
This document is implementation planning only.

## Goals

- Make "play a random game" a first-class flow.
- Let users choose filters before random selection.
- Use likes, dislikes, recency, and plays as weighting signals.
- Give new content a light temporary boost.
- Penalize heavily disliked content quickly.
- Avoid repeating recently played games in the same session or lobby.
- Keep all gameplay lobby-first.

## Product Safety

- Random selection must not become gambling.
- No stakes, wagers, Token transfer, payout, debt, settlement, or real-world
  reward.
- Beerits remain fictional in-game penalty points.
- Tokens remain fictional creator reward points with no real-world value.

## Existing Implementation

Current client-side files:

- `src/stores/game-filters.ts`
- `src/components/games/game-filters.tsx`
- `src/components/games/game-browser.tsx`
- `src/lib/games/ranking.ts`
- `src/lib/games/queries.ts`

Current behavior:

- Browse fetches public games.
- Client filters by category, intensity, players, and search query.
- Random sort is a weighted random ordering in the browser.
- Likes increase score.
- Dislikes and reports reduce score.

Current limitations:

- No direct random CTA that creates or selects a game.
- No Hot/Top/Recent/Surprise preset model.
- No duration filter.
- No physical/digital/both filter.
- No session repeat prevention.
- Random order is client-only and not shared with lobby creation.

## Recommended Model

Use a two-level approach:

1. Keep client-side Browse sorting for fast UI.
2. Add a server/database-backed random pick for "Start random game" and lobby
   creation.

Why:

- Browse can stay responsive.
- Direct random CTA can be consistent and auditable.
- Server-side selection can avoid repeats and respect hidden/moderated content.

## Filter Shape

Add a typed filter object:

```ts
interface RandomDiscoveryFilters {
  categories: GameCategory[];
  intensities: GameIntensity[];
  playerCount: number | null;
  durationMaxMinutes: number | null;
  contentMode: "DIGITAL" | "PHYSICAL" | "BOTH";
  pool: "HOT" | "TOP" | "RECENT" | "MOST_LIKED" | "SURPRISE";
  excludedGameIds: string[];
}
```

Notes:

- Empty `categories` means all categories.
- Empty `intensities` means all intensities.
- `excludedGameIds` should come from lobby/session history.

## Weighting Formula

Start simple and predictable:

```text
base = 10
likes = likes_count * 3
plays = min(plays_count, 100) * 0.25
dislikes = dislikes_count * 4
reports = reports_count * 8
new_boost = max(0, 5 - age_in_days * 0.25)
weight = max(1, base + likes + plays + new_boost - dislikes - reports)
```

Pool modifiers:

- `HOT`: use trending score with recency and plays.
- `TOP`: use all-time score.
- `RECENT`: stronger new boost, lower plays weight.
- `MOST_LIKED`: prioritize likes but still penalize reports/dislikes.
- `SURPRISE`: flatten weights so lower-known safe games can appear.

Heavily disliked content:

- If `dislikes_count >= 10` and `dislikes_count > likes_count * 2`, exclude or
  nearly exclude from random discovery.
- Already hidden content must never appear.

## Physical/Digital Classification

Current categories can infer physical content:

Physical:

- `Card Games`
- `Board Games`
- `Dice Games`

Digital/prompt:

- All other categories, unless future schema adds explicit content mode.

MVP implementation can infer from category.

Future implementation can add:

```sql
content_mode text not null default 'DIGITAL'
```

Do not add this until the inferred category approach becomes limiting.

## Repeat Prevention

MVP:

- Store recent random picks in Zustand/local storage.
- Exclude recent IDs when selecting another random game in the same browser.
- Also exclude games already used in the same lobby if random cards are added
  later.

Suggested client state:

```ts
recentRandomGameIds: string[]
addRecentRandomGameId(gameId: string): void
clearRecentRandomGameIds(): void
```

Keep only the last 10 to 20 IDs.

Server-side later:

- Add a `lobby_random_history` table only if multi-device synchronized random
  history becomes necessary.

## Server RPC Option

For a direct random CTA, add an RPC later:

```sql
public.pick_random_game(
  p_categories text[],
  p_intensities text[],
  p_player_count integer,
  p_duration_max_minutes integer,
  p_content_mode text,
  p_pool text,
  p_excluded_game_ids uuid[]
)
returns uuid
```

Rules:

- Authenticated including anonymous guest users can execute.
- Exclude hidden games.
- Include `PUBLIC` games only for discovery.
- Respect player count and duration.
- Reject invalid filter values.
- Use weighted random selection.
- Return null or raise clear error if no match.

This RPC should not create a lobby by itself. It should only select a game.
Lobby creation remains through `create_lobby` so every gameplay session stays
lobby-first.

## UI Flow

Recommended flow:

1. Home shows "Start random game".
2. User opens a compact filter sheet/page.
3. User chooses quick presets:
   - Hot
   - Top
   - Recent
   - Most liked
   - Surprise me
4. User can select all/unselect all categories.
5. User can choose physical, digital, or both.
6. User taps "Pick a game".
7. App routes to `/lobby/create/[gameId]` or game detail with a clear CTA.

For MVP, route to game detail or lobby-create page. Do not auto-start gameplay.

## Implementation Milestones

### 14.1 Client Filter Store

- Extend `src/stores/game-filters.ts`.
- Add content mode, duration max, pool, and recent IDs.
- Keep existing filters backward compatible.

Checks:

- Browse still works with default filters.
- Clear filters resets new fields too.

### 14.2 Browse UI

- Add preset buttons.
- Add select all/unselect all categories.
- Add duration and physical/digital/both filter.
- Improve random sort copy.

Checks:

- Mobile layout remains usable.
- Existing category quick buttons still work or are replaced cleanly.

### 14.3 Random Pick Action

- Add a server action or RPC wrapper for direct random pick.
- Return clear empty-state copy if no match.
- Route to lobby creation or game detail.

Checks:

- Guest can pick random games.
- Hidden games never appear.
- Recent picks are excluded.

### 14.4 Optional SQL RPC

- Add SQL migration for `pick_random_game`.
- Keep RLS/grants explicit.
- Add tests through manual SQL and browser smoke tests.

Checks:

- Invalid enum values are rejected.
- Anonymous auth users can use it.
- No private games are returned.

## QA Checklist

- Random with no filters returns a public visible game.
- Random with Card Games only returns card-game content.
- Random with Board Games only returns board-game content.
- Random with Dice Games only returns dice-game content.
- Random with a player count respects min/max players.
- Random with a duration cap respects estimated duration.
- Random excludes recently picked games.
- Random handles no-match cases without crashing.
- Likes increase selection chance.
- Dislikes and reports reduce selection chance.
- Hidden games never appear.
- Gameplay still starts through a lobby.

## Risks

- Client-only random can be inconsistent between users. This is acceptable for
  Browse ordering but not ideal for a shared "start random game" button.
- Too many filters can create empty states. The UI needs a clear reset action.
- Overweighting likes can bury new games. Keep a temporary new-content boost.
- Random selection should never imply stakes or reward odds.
