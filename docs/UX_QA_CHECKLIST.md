# Beerit Live App UX QA Checklist

A fast, manual UX pass for the live app at https://beerit.vercel.app.
Run on a phone (or a narrow mobile viewport) since Beerit is mobile-first
and host-phone-first. Tick each item; note anything that fails.

## How To Use

- Test on a real phone screen width when possible.
- Use both guest mode and a registered account.
- Keep an eye on copy safety: nothing should imply real money, debts,
  gambling, settlement, payouts, or Token transfers.

## 1. Landing And Start Evening

- [ ] Landing page loads and the primary "Start playing" CTA is obvious.
- [ ] "Create and remix" benefit mentions Tokens are fictional.
- [ ] Responsible-play note is visible on the landing page.
- [ ] Home page headline reads "Start je avond" and the one-phone play
      hint is present.
- [ ] "Pick random game" is the clear primary action; Browse and Lobby
      are secondary but reachable.
- [ ] Profile card shows Tokens with "fictional points, no real-world
      value" (registered) or guest-temporary copy (guest).

## 2. Browse And Game Cards

- [ ] Filters (Hot / Top / Recent / Liked / Surprise) apply and clear.
- [ ] Game cards show players, duration, plays, likes, dislikes, cards.
- [ ] Primary CTA on a game card reads "Play" with an icon; secondary is
      "View details".
- [ ] No raw enum values (e.g. ALL_CAPS_WITH_UNDERSCORES) appear anywhere.
- [ ] Empty search result shows the "No games match" empty state.

## 3. Game Detail

- [ ] Category, intensity, and (if not public) a Title Case visibility
      badge appear.
- [ ] Topics section: spicy topics show a flame icon and read as opt-in.
- [ ] Rules render with line breaks preserved; beginner guide link opens
      in a new tab when present.
- [ ] "Create lobby" is primary; "Remix game" / "Remix (sign in)" reflects
      auth state.
- [ ] Card preview shows "This round: X fictional Beerits".
- [ ] Community questions section: empty state invites the first
      suggestion; existing questions show like/dislike.

## 4. Lobby Create

- [ ] One-phone-ready and Guests-welcome chips are visible.
- [ ] "Only selected offline games" + nothing checked disables submit and
      shows the inline error with a red fieldset border.
- [ ] Checking at least one game type re-enables submit.

## 5. Lobby Room (Gameplay)

- [ ] Status badge reads "Waiting room" / "Playing" / "Finished" (no raw
      enum).
- [ ] Lobby code is easy to copy from the header.
- [ ] Waiting room lists everyone in the room with initials and an
      Online / Away indicator that updates as people join or leave.
- [ ] "Share invite" opens the native share sheet (mobile) or copies the
      invite link (desktop); the link is /lobby?code=XXXXXX.
- [ ] Opening a shared /lobby?code=XXXXXX link prefills the join form and
      shows the "code was shared with you" hint.
- [ ] The scoreboard only appears once the game is Playing (it is not
      duplicated in the waiting room).
- [ ] Current card is the visual focus; quick result, navigation
      (Prev / Skip / Stop / Next), and scoreboard are clear.
- [ ] Chat reads as secondary (muted title/background) below gameplay.
- [ ] Timer cards start/pause/reset and reaching zero does not crash.
- [ ] Beerits language stays fictional throughout.

## 6. Post-Game / Evening Summary

- [ ] FINISHED shows the Evening summary with ranked players and a crown
      on the leader; the regular scoreboard is hidden to avoid duplicates.
- [ ] No-debts / no-settlement language is present.
- [ ] Post-game actions: Rematch, Other game, Stop de avond, and an
      optional "Suggest a question" are all clear.

## 7. Profile, Friends, Settings

- [ ] Achievements card is clearly "coming soon" (dashed, muted badges).
- [ ] Creator rewards explains Tokens are fictional and non-transferable.
- [ ] Own empty profile reads "No games yet. Publish one to see it here."
- [ ] Friends copy compares fictional Beerits with no stakes or debts.
- [ ] Settings shows guest-mode limits for guests; profile form for
      registered users.

## 8. States And Resilience

- [ ] Slow load shows the "taking a little longer" state with retry.
- [ ] A missing page shows the not-found card with a way home.
- [ ] A thrown error shows the error card with "Try again" and "Back to
      start".
- [ ] Browse failure shows the "Games are taking longer to load" card.

## 9. Guest vs Registered

- [ ] Guests can play, like, dislike, report, and suggest questions.
- [ ] Guests are blocked from creating permanent games and earning Tokens,
      with clear "Create an account" prompts.
- [ ] No screen offers Token transfers, wagers, debts, settlement, or
      real-world rewards.

## Reporting Template

- Date / environment:
- Device / viewport:
- Account type (guest / registered / admin):
- Failures found:
- Copy-safety issues:
- Follow-up:
