# Beerit ChatGPT Project Context

Use this file to discuss and refine product requirements before Codex or Claude
Code starts the next implementation milestones.

## Product Summary

Beerit is a mobile-first social party game platform for groups of friends.
Players browse or create games, start a lobby, join with friends or guests, and
play through prompts, questions, challenges, timed events, and offline physical
game suggestions.

Every gameplay session must happen through a lobby, including one-phone play.

Live app: https://beerit.vercel.app

## Non-Negotiable Safety Rules

- Do not implement real gambling.
- Do not implement real-money rewards.
- Do not implement alcohol redemption.
- Do not implement creator payouts.
- Do not implement Token wagers, Token transfers, debts, settlement, or winner
  payouts.
- Beerits are fictional in-game penalty points only.
- Tokens are fictional creator reward points with no real-world value.
- Guests can play, like, dislike, report, and suggest questions.
- Guests cannot earn Tokens or create permanent creator profiles.
- Keep responsible-play language visible.

## Preferred Tech Stack

- Next.js App Router
- TypeScript everywhere
- React
- Tailwind CSS
- shadcn/ui-style components with Radix primitives
- lucide-react icons
- React Hook Form and Zod for forms and validation
- Supabase Auth
- Supabase Postgres with RLS
- Supabase Realtime for lobby presence, chat, scoreboard, and current card
  updates where practical
- Supabase SQL migrations and seed files
- TanStack Query for client-side server-state fetching where useful
- Zustand only for lightweight client state such as filters or temporary UI
  state
- Vercel deployment

## What Has Already Been Built

The project foundation is complete:

- Next.js, React, TypeScript, Tailwind, ESLint, and shadcn/ui setup.
- Supabase browser, server, admin, and session refresh clients.
- `.env.example`, `AGENTS.md`, `README.md`, and phased implementation plan.
- Supabase SQL migrations and seed data.
- Vercel production deployment.

Authentication and profiles are complete:

- Email/password sign up and login.
- Anonymous guest sessions through Supabase Auth.
- Guest display-name cookie.
- Profile and settings pages.
- Token balance display for registered users.
- Guest restrictions explained in the UI.

Game browsing and creation are complete:

- Landing page, home page, browse page, game detail pages.
- Search and filters for category, intensity, player count, and physical game
  types.
- Registered-user game creation.
- Free-form game concepts, not only preset templates.
- Owner-only edit page for adding cards/questions to existing games.
- Remix flow that copies a public game into a new creator-owned version.

Community mechanics are complete:

- Like, dislike, save, and report games.
- Guests and registered users can suggest questions for discoverable games.
- Each question/card can be liked or disliked.
- Disliked community questions appear less often and can be hidden after strong
  negative feedback.
- Game discovery and random selection are weighted by likes and dislikes.
- Reports and heavy dislike ratios can hide games from discovery.
- Creator Tokens can be adjusted by protected database logic when games receive
  likes, but Tokens have no real-world value.

Lobby and gameplay flow are complete:

- Lobby creation for any playable game.
- Join-by-code.
- Waiting room.
- One-phone play.
- Host controls to start, advance, skip, go previous, and end.
- Lobby chat.
- Presence.
- Current-card updates.
- Scoreboard with fictional Beerits.
- Final scoreboard.
- Safe database functions for lobby actions.

Offline and physical game support is complete:

- Card Games, Board Games, and Dice Games categories.
- Offline-only lobby mode.
- Hosts can select only card games, only board games, only dice games, or a
  combination.
- If a group has no physical games, they can leave those filters off.
- Starter physical games include rules, beginner guidance, and fictional
  Beerits scoring.
- Physical games are not played digitally inside Beerit; Beerit provides rules,
  prompts, scoring, and assignment.
- Creator-added offline games can be published to the cloud, liked, disliked,
  and randomly selected with weighting.

Timed and fast gameplay is complete:

- Rapid Fire Timer starter game.
- Trivia, personal, and category timed prompts.
- Timed cards can award a fictional Beerit to the loser.
- Quick score buttons can award Beerits and move immediately to the next
  question/game.

Friend system foundation is complete:

- Registered users can send, accept, cancel, and remove friend requests.
- Friends can view shared historical fictional Beerits from finished cloud
  lobby rooms.
- This is deliberately not a money, payout, settlement, or debt system.

Mobile app polish is complete:

- Installable web-app manifest.
- Mobile safe-area layout.
- Bottom navigation.
- Larger tap targets.
- Smoother button/card/page transitions.
- Reduced-motion support.
- Better loading and recovery screens.
- Post-game actions: play again, choose another game, go home.
- Optional post-game question suggestion with a skip option.

## Current Main Routes

- `/` landing page
- `/auth` login, registration, and guest mode
- `/home` home dashboard
- `/browse` searchable game catalog
- `/games/[id]` game detail page
- `/games/[id]/edit` owner-only card/question editor
- `/games/[id]/remix` remix editor
- `/create` create a game
- `/lobby` join-by-code and lobby overview
- `/lobby/create/[gameId]` create lobby for a selected game
- `/lobby/[id]` waiting room, gameplay, chat, and scoreboard
- `/friends` friend requests and shared Beerits history
- `/settings` profile settings
- `/admin/moderation` admin moderation queue

## Database State

Supabase migrations exist for:

- Initial schema, RLS, indexes, grants, moderation thresholds, vote handling,
  Token handling, and lobby basics.
- Guest profile guards.
- Unlisted direct-link games.
- Safe lobby gameplay RPC functions.
- Safe social and moderation RPC functions.
- RLS cleanup for social writes.
- Creator free-form game concepts.
- Community cards and card votes.
- Offline game library.
- Beginner guides and timed rounds.
- Friend requests and shared Beerits history.

Seed data exists for starter games and offline activities.

## Important Product Direction

Beerit should prioritize a working, playable MVP over perfect design.

The strongest product idea so far:

- The app should help a group decide what to play next.
- Likes and dislikes should affect how often games/questions appear in random
  selection.
- People should be able to add content to existing games.
- Physical card, board, and dice games should be supported through rules and
  scoring, not by programming the full games digitally.
- The experience should feel fast on a phone during a party or student evening.

## Open Requirements To Refine With ChatGPT

Refine these before the next coding milestone:

1. Exact home screen structure
   - What should users see first?
   - Should the primary CTA be "Start lobby", "Random game", or "Browse"?

2. Browse and random selection
   - What filters matter most?
   - Should random selection prefer high-liked content strongly or only
     slightly?
   - Should new content get a temporary boost?

3. Game and question contribution flow
   - Should every game detail page show "Add question" immediately?
   - Should question suggestions require approval, or appear immediately with
     ranking/moderation?
   - Should users be able to edit or delete their own suggestions?

4. Like/dislike UX
   - Where should likes and dislikes appear during gameplay?
   - Should players vote on the current card without interrupting the game?
   - Should dislikes need a reason?

5. Physical games
   - Which card games, board games, and dice games should be seeded next?
   - How detailed should the rules be inside Beerit versus linking out?
   - How should winner, second place, third place, and loser scoring work per
     game?

6. Timed events
   - How long should default timed rounds be?
   - Should the loser always get a Beerit?
   - Should timed rounds support teams?

7. Friends and long-term scores
   - Should friend scores reset per night, per group, or never?
   - Should there be friend groups?
   - What should "even again" mean using only fictional Beerits, not Tokens or
     debts?

8. Tokens
   - Should Tokens only reward creators for popular games?
   - What should Tokens unlock if they cannot be money, payouts, alcohol, or
     transferable stakes?
   - Possible safe uses: badges, profile cosmetics, creator levels, visibility
     boosts, or unlockable themes.

9. Moderation
   - What content should be blocked or reported?
   - Should reports hide content immediately after a threshold?
   - Should there be admin review before public visibility?

10. Mobile app feel
    - Should the app feel more playful, cleaner, darker, more student-like, or
      more like a utility?
    - Should the lobby screen be simplified further?
    - Should there be haptics-like feedback through visual effects only?

## Suggested Next Milestones

Milestone 13: Product UX cleanup

- Simplify home, browse, and lobby entry.
- Make "start random game" easier.
- Make physical-game filters clearer.
- Improve copy and empty states.

Milestone 14: Contribution and moderation polish

- Better add-question flow on every game page.
- Better voting UI for cards/questions.
- Own-submission management.
- Cleaner admin moderation queue.

Milestone 15: More physical game content

- Add more card games, board games, and dice games.
- Add beginner-friendly rule pages or structured guide sections.
- Add scoring templates for first, second, third, and loser outcomes.

Milestone 16: Friends and groups

- Friend groups.
- Group history.
- Night/session summaries.
- Fictional Beerits leaderboards with no stakes, payouts, or settlement.

Milestone 17: App quality

- Better visual design pass.
- More loading, error, and offline states.
- End-to-end smoke tests for auth, browse, lobby, voting, and friends.
- Accessibility check.

## Agent Collaboration Proposal

Use separate agents for separate areas:

- Product Agent: requirements, flows, UX copy, and roadmap.
- UI/App Agent: mobile-first screens, design system, navigation, animations.
- Gameplay Agent: lobby flow, card progression, scoring, timed rounds.
- Supabase Agent: schema, RLS, RPC functions, Realtime, seed data.
- Community Agent: questions, votes, reports, moderation.
- Friends Agent: friend requests, groups, shared Beerits history.
- QA/Deploy Agent: lint, build, route checks, deployment, regression notes.

Best workflow:

1. Refine requirements with ChatGPT.
2. Convert them into small milestones.
3. Let one agent implement one milestone on one branch.
4. Let another agent review the result.
5. Run lint and build.
6. Deploy only after the milestone is verified.

## Credentials Warning

Do not paste Supabase service-role keys, management tokens, Vercel tokens, or
other secrets into ChatGPT for product discussion. Requirements can be refined
without credentials.
