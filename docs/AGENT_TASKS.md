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

- `main`: production-ready baseline. Includes Codex gameplay speed
  foundation (realtime, undo, bomb mode, evening summary).
- `codex/game-topics-schema`: Codex game topics schema work. Adds
  `game_topics`, card-topic links, topic-aware community questions, starter
  topics, and matching TypeScript/query/action support. Avoid further changes
  to those schema/data-flow files until this integration lands.
- `claude/continuous-ux-content-polish`: Claude Code continuous UX,
  copy, and content polish. Changes: toTitleCase utility, "Start je
  avond" home page, lobby status human-readable labels (Waiting room /
  Playing / Finished), scoreboard hidden on FINISHED (Evening Summary
  shows ranked list), "This round: X fictional Beerits" on cards,
  Profile Achievements card rename + dashed coming-soon badges, game
  form rules placeholder + visibility toTitleCase, lobby list status
  badges, ONLY_SELECTED client-side validation in lobby create form,
  game detail Remix button guest hint, landing page Token fictional
  clarification. No schema or mutation changes.

If Codex starts a technical implementation milestone, use a branch such as:

- `codex/milestone-13a-core-bugs`
- `codex/bomb-mode-foundation`
- `codex/random-discovery-rpc`

## Near-Term Backlog

### Milestone 13A: Stabilize Core Bugs - DONE

Owner: Codex (migration + RPC fix), Claude (UI validation).

Completed on `main` (Codex gameplay-speed-foundation + Claude
continuous-ux-content-polish):

- Card type change now resets `activityKind` and `timerSeconds` correctly.
- ONLY_SELECTED lobby mode shows a client-side error and disables submit
  when no activity kinds are checked (lobby-create-form.tsx).
- Supabase migration fixes `snapshot_lobby_cards`.

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

- Add topics per game so questions can be grouped into packs such as Football,
  Spicy, Student House, Physical Games, and Quick Categories.
- Keep cloud suggestions weighted and moderated.
- Let guests suggest questions, including topic-linked questions, without
  earning Tokens.
- Add session-only lobby questions that do not save to the cloud.
- Keep guest suggestions allowed but non-tokenized.
- Keep reports reasoned; dislikes do not require a reason.
- Keep Spicy topics opt-in for adult groups and out of default random flows
  until explicit UX support is built.

## UX/Content QA Checklist

For every UX branch:

- [ ] No raw enum values displayed to users (use toTitleCase).
- [ ] No "Tokens available" - must say "fictional points, no real-world value".
- [ ] No "Suggested value" for Beerits - use "This round: X fictional Beerits".
- [ ] Lobby status shows human-readable: Waiting room / Playing / Finished.
- [ ] Evening Summary visible on FINISHED; regular scoreboard hidden.
- [ ] Remix button shows "Remix (sign in)" for guests.
- [ ] Rules textarea has Setup/How to play/Scoring placeholder.
- [ ] Achievements section clearly marked as coming soon (dashed badges).
- [ ] Responsible play note visible on every major screen.
- [ ] ONLY_SELECTED lobby mode validates client-side before submit.

## Review Checklist

For every branch:

- Does it preserve existing Supabase and Vercel setup?
- Does it avoid secrets and generated files?
- Does it keep Beerits/Tokens safe and fictional?
- Does it avoid duplicate systems?
- Does it work for guests where required?
- Does it keep gameplay lobby-first?
- Did lint and build pass?
