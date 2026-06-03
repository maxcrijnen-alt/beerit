drop policy if exists "public games are readable" on public.games;
create policy "discoverable and unlisted games are readable"
on public.games for select
to anon, authenticated
using (
  visibility in ('PUBLIC', 'UNLISTED')
  and not is_hidden
);

drop policy if exists "cards of public games are readable" on public.game_cards;
create policy "cards of discoverable and unlisted games are readable"
on public.game_cards for select
to anon, authenticated
using (
  exists (
    select 1
    from public.games
    where games.id = game_cards.game_id
      and games.visibility in ('PUBLIC', 'UNLISTED')
      and not games.is_hidden
  )
);
