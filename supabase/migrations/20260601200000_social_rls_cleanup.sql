drop policy if exists "actors can insert their own vote" on public.game_votes;
drop policy if exists "actors can update their own vote" on public.game_votes;
drop policy if exists "actors can delete their own vote" on public.game_votes;
drop policy if exists "actors can submit one report" on public.game_reports;
drop policy if exists "registered users can save games" on public.saved_games;
drop policy if exists "registered users can remove saved games" on public.saved_games;

drop policy if exists "actors can read their own vote" on public.game_votes;
create policy "actors can read their own vote"
on public.game_votes for select
to authenticated
using (actor_session_user_id = (select auth.uid()));

drop policy if exists "admins can read reports" on public.game_reports;
drop policy if exists "actors can read their own report" on public.game_reports;
create policy "actors and admins can read reports"
on public.game_reports for select
to authenticated
using (
  actor_session_user_id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists "users can read their saved games" on public.saved_games;
create policy "users can read their saved games"
on public.saved_games for select
to authenticated
using (user_id = (select auth.uid()));
