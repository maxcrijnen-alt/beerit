# Beerit Project Instructions

Beerit is a mobile-first social party game platform. Preserve the existing app;
do not rebuild it from scratch.

## Required Workflow

- Inspect the existing code before editing.
- Work in small milestones and keep changes scoped.
- Prefer existing project patterns over new abstractions.
- Do not duplicate systems that already exist.
- Do not delete existing files or overwrite Supabase/Vercel setup unless the
  user explicitly approves it.
- Run lint and build checks before finalizing changes.
- Summarize changed files, checks, risks, and follow-up items.

## Stack Rules

- Use TypeScript everywhere.
- Keep the UI mobile-first.
- Use Tailwind CSS and shadcn/ui-style primitives for the interface.
- Use lucide-react for icons.
- Use React Hook Form and Zod for forms and validation.
- Use Supabase for auth, Postgres data storage, RLS, and realtime updates.
- Use Supabase SQL migrations and seed files for database changes.
- Use Supabase Realtime for lobby presence, chat, scoreboard, and current-card
  updates where practical.
- Use TanStack Query for client-side server-state fetching where useful.
- Use Zustand only for lightweight client-side state such as filters, guest
  session state, and temporary UI state.

## Safety Rules

- Beerits are fictional in-game penalty points only.
- Tokens are fictional creator reward points with no real-world value.
- Guests can play, like, dislike, report, and suggest questions.
- Guests cannot earn Tokens or create permanent creator profiles.
- Do not implement real gambling.
- Do not implement alcohol redemption.
- Do not implement real-money rewards.
- Do not implement creator payouts.
- Do not implement Token transfers, Token wagers, debts, settlement, or winner
  payouts.
- Do not expose service-role keys, management tokens, Vercel tokens, or private
  credentials.
- Keep responsible-play language visible in the product.

## Git And Deployment

- Keep `.env`, `.env.local`, `.vercel`, `.next`, `node_modules`, and other
  generated or secret files out of Git.
- Preserve the local Vercel project link unless there is a clear reason not to.
- Work on feature branches after the initial project setup.
- Do not force push unless the user explicitly approves it.
