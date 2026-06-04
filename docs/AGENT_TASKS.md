# Agent Task Ownership

## Active branches

| Branch | Agent | Status | Area |
|---|---|---|---|
| `claude/zen-pasteur-NTqrT` | Claude Code | Merged/pending push | Bug fixes (Milestone 13A) |
| `claude/milestone-13b-content` | Claude Code | In progress | Docs + content (Milestone 13B prep) |

## Completed milestones

| Milestone | Branch | What changed |
|---|---|---|
| 13A | `claude/zen-pasteur-NTqrT` | Fixed cardType onChange validation; fixed ONLY_SELECTED base-card exclusion |

## Next milestones (priority order)

### 13B — Bomb Mode (Claude Code: UX; Codex: backend)
See `docs/MILESTONE_13B_BOMB_MODE.md` for the full spec.

**Claude Code tasks**
- Lobby UI: add "Bomb" card variant display (countdown ring, red pulse)
- Card editor: expose bomb-card type when game category allows it
- Responsible-play copy: "everyone can pass, no one is forced"

**Codex tasks**
- DB: add `BOMB` to `game_card_types` enum + migration
- RPC: `pass_bomb(lobby_id, from_player_id)` updates `current_bomb_holder`
- RLS: bomb-holder field readable by all lobby members

### 13C — Dark mobile redesign (Claude Code)
- Audit current Tailwind dark-mode coverage
- Apply consistent `dark:` variants across lobby, game, and card views
- Mobile-first spacing audit (min touch target 44 px)
- No logic changes, pure CSS/layout

### 13D — Physical game content expansion (Claude Code / Codex neutral)
- Add 10+ new physical game seeds covering OTHER activity kind
- Diversify existing card counts (3–6 cards per game)
- Keep all Beerit references fictional

### 13E — QA smoke-test plan (Codex)
- Write `docs/QA_SMOKE_TESTS.md`
- Cover: create account, create game, start lobby, play round, score, leave
- Cover: guest join, suggest card, like/dislike, report
- Cover: MIXED lobby, ONLY_SELECTED lobby, community cards toggle

## Division of labour

| Area | Primary agent |
|---|---|
| Supabase RLS / migrations / RPC | Codex |
| Lobby game logic, scoring | Codex |
| UI components, Tailwind, copy | Claude Code |
| Game content / seed data | Claude Code |
| QA plans, deployment readiness | Codex |
| Docs, task coordination | Claude Code |

## Conflict avoidance rules

1. Check this file before picking a task.
2. Never edit the same migration file as another open branch.
3. Never edit `src/app/lobby/actions.ts` and lobby UI components on the same branch.
4. Backend RPC changes (Codex) go in a migration; UI wiring (Claude Code) goes in a separate branch that merges after the migration branch lands.
5. Mark a task "In progress" in this table when you start it.
