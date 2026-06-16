# Beerit Agent Tasks

Use this file to coordinate Codex, Claude Code, and future agents. Keep work
small, branch-based, and easy to review.

## Standing Rules

- Work on feature branches, not directly on `main`.
- Pull latest `main` before starting a new branch.
- Do not edit files that another active agent is likely editing.
- Do not commit `.env.local`, `.vercel`, `.next`, `node_modules`, tokens, or
  private credentials.
- Run `npm run lint` and `npm run build` before finalizing coding work.
- Push the branch and summarize changed files, checks, risks, and next steps.
- Do not force push without explicit approval.

## Product Safety

- Beerits are fictional in-game penalty points only.
- Tokens are fictional creator reward points with no real-world value.
- Guests can play, like, dislike, report, and suggest questions.
- Guests cannot earn Tokens or create permanent creator profiles.
- Do not implement gambling, alcohol redemption, real-money rewards, creator
  payouts, Token transfers, Token wagers, debts, settlement, or winner payouts.

## Agent Ownership

### Codex

Primary ownership:

- Technical implementation.
- Supabase schema, RLS, RPC functions, migrations, and seed safety.
- Lobby logic, realtime behavior, score handling, and bug fixes.
- QA, build readiness, and deployment checks.

Avoid while Claude is actively editing:

- Broad copy rewrites.
- Large visual redesigns.
- Game content expansion unless explicitly assigned.

### Claude Code

Primary ownership:

- UX flow, copy, UI polish, and mobile app feel.
- Game content, beginner guides, physical game instructions.
- Product clarity and screen-level interaction design.

Avoid while Codex is actively editing:

- Supabase migrations.
- RLS/RPC changes.
- Core lobby mutation logic.
- Auth/session infrastructure.

## Current Branches

- `main`: production-ready baseline.
- `chore/project-audit`: audit branch with no feature changes.
- `codex/agent-qa-workflow`: Codex QA and coordination docs.
- `claude/physical-game-content`: Claude Code — eight new physical games
  (arm wrestling, thumb war, rock-paper-scissors, staring contest, coin
  flip, snap race, tic-tac-toe, three dice bingo) with beginner guides;
  also beginner guides for the original ten offline games. No shared
  files touched.
- `claude/gameplay-speed-ux`: Claude Code — Milestone B gameplay UX
  polish. Evening summary on finished lobby, "Stop de avond" / "Rematch"
  copy, fictional Beerits / no-debts language, navigation control labels
  (Undo / Skip / Stop / Next), toTitleCase utility for enum displays,
  lobby status human-readable labels, game form rules placeholder,
  Achievements card polish, ONLY_SELECTED client validation,
  configurable TimedEventTimer label ("Round timer" for timed cards),
  and beginner guides for Rapid Fire Timer / Bomb Mode / Game Night
  Activities. No schema changes; no mutation logic changes.

If Codex starts a technical implementation milestone, use a branch such as:

- `codex/milestone-13a-core-bugs`
- `codex/bomb-mode-foundation`
- `codex/random-discovery-rpc`

## Near-Term Backlog

### Milestone 13A: Stabilize Core Bugs — DONE

Owner: Codex (migration + RPC fix), Claude (UI validation).

Completed work on `claude/gameplay-speed-ux` and Codex migrations:

- Card type change now resets `activityKind` and `timerSeconds` correctly
  via onChange handler in `GameCardEditor` (game-card-editor.tsx).
- ONLY_SELECTED lobby mode shows a client-side error and disables submit
  when no activity kinds are checked (lobby-create-form.tsx).
- Supabase migration fixes `snapshot_lobby_cards` so base game cards
  always appear regardless of activity selection mode.

### Milestone 13B: Bomb Mode Foundation

Owner: Codex for timer/gameplay logic, Claude for UX copy and animation plan.

Non-conflicting prep tasks:

- Define card type or mode shape.
- Decide whether Bomb Mode is a game, card type, or lobby mode.
- Define random duration behavior, default 20 to 180 seconds.
- Define host action after BOOM: select loser/current holder and award Beerits.

### Milestone 13C: Dark Mobile Redesign

Owner: Claude for UX/design, Codex for implementation support after design is
approved.

Non-conflicting prep tasks:

- Define visual direction.
- Identify affected layout files.
- Keep current flows intact.
- Avoid database changes.

### Milestone 14: Random Discovery And Filters

Owner: Codex for selection logic, Claude for filter UX.

Technical direction:

- Add direct random game CTA.
- Add filter presets such as Hot, Top, Recent, Most liked, Surprise me.
- Avoid repeats within the same session/lobby.
- Add light temporary boost for new content.
- Penalize heavily disliked content quickly.

### Milestone 15: Contribution And Custom Questions

Owner: split between Community Agent and Gameplay Agent.

Technical direction:

- Keep cloud suggestions weighted and moderated.
- Add session-only lobby questions that do not save to the cloud.
- Keep guest suggestions allowed but non-tokenized.
- Keep reports reasoned; dislikes do not require a reason.

## Review Checklist

For every branch:

- Does it preserve existing Supabase and Vercel setup?
- Does it avoid secrets and generated files?
- Does it keep Beerits/Tokens safe and fictional?
- Does it avoid duplicate systems?
- Does it work for guests where required?
- Does it keep gameplay lobby-first?
- Did lint and build pass?
