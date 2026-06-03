-- Fix: in ONLY_SELECTED mode the base game cards were incorrectly excluded.
-- The ONLY_SELECTED guard now only skips the mixed-categories block so that
-- base game and community cards are always present in a lobby.
create or replace function private.snapshot_lobby_cards(
  p_lobby_id uuid,
  p_game_id uuid,
  p_include_community_cards boolean,
  p_mixed_categories text[],
  p_activity_kinds text[],
  p_activity_selection_mode text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  official_count integer := 0;
begin
  -- Always include the base game's own official cards.
  insert into public.lobby_cards (lobby_id, game_card_id, position)
  select
    p_lobby_id,
    id,
    row_number() over (order by position, created_at, id)
  from public.game_cards
  where game_id = p_game_id
    and not is_community
    and not is_hidden;

  get diagnostics official_count = row_count;

  -- Optionally include community-submitted cards for this game.
  if p_include_community_cards then
    insert into public.lobby_cards (lobby_id, game_card_id, position)
    select
      p_lobby_id,
      weighted.id,
      official_count + row_number() over (
        order by weighted.selection_score desc, weighted.created_at desc, weighted.id
      )
    from (
      select
        recent.id,
        recent.created_at,
        random() * greatest(
          1,
          8 + recent.likes_count * 2 - recent.dislikes_count * 3
        ) as selection_score
      from (
        select id, created_at, likes_count, dislikes_count
        from public.game_cards
        where game_id = p_game_id
          and is_community
          and not is_hidden
          and (dislikes_count < 5 or likes_count >= dislikes_count)
        order by created_at desc
        limit 100
      ) recent
      order by selection_score desc, created_at desc
      limit 20
    ) weighted;
  end if;

  select count(*)
  into official_count
  from public.lobby_cards
  where lobby_id = p_lobby_id;

  -- In MIXED mode only: also pull in cards from other public games in the
  -- chosen mix categories (activity-type cards excluded here; handled below).
  if p_activity_selection_mode <> 'ONLY_SELECTED' then
    insert into public.lobby_cards (lobby_id, game_card_id, position)
    select
      p_lobby_id,
      mixed.id,
      official_count + row_number() over (
        order by mixed.selection_score desc, mixed.created_at desc, mixed.id
      )
    from (
      select
        candidates.id,
        candidates.created_at,
        random() * greatest(
          1,
          8 + candidates.likes_count * 2 - candidates.dislikes_count * 3
        ) as selection_score
      from (
        select
          game_cards.id,
          game_cards.created_at,
          game_cards.likes_count + games.likes_count as likes_count,
          game_cards.dislikes_count + games.dislikes_count as dislikes_count
        from public.game_cards
        join public.games on games.id = game_cards.game_id
        where coalesce(array_length(p_mixed_categories, 1), 0) > 0
          and games.category = any(p_mixed_categories)
          and games.id <> p_game_id
          and games.visibility = 'PUBLIC'
          and not games.is_hidden
          and not game_cards.is_hidden
          and game_cards.card_type <> 'ACTIVITY'
          and (p_include_community_cards or not game_cards.is_community)
          and (game_cards.dislikes_count < 5 or game_cards.likes_count >= game_cards.dislikes_count)
        order by game_cards.created_at desc
        limit 200
      ) candidates
      order by selection_score desc, created_at desc
      limit 20
    ) mixed
    on conflict do nothing;
  end if;

  select count(*)
  into official_count
  from public.lobby_cards
  where lobby_id = p_lobby_id;

  -- Add activity-kind cards (offline games) when any kinds are selected.
  -- Applies in both MIXED and ONLY_SELECTED modes.
  insert into public.lobby_cards (lobby_id, game_card_id, position)
  select
    p_lobby_id,
    activities.id,
    official_count + row_number() over (
      order by activities.selection_score desc, activities.created_at desc, activities.id
    )
  from (
    select
      game_cards.id,
      game_cards.created_at,
      random() * greatest(
        1,
        8
          + game_cards.likes_count * 2
          + games.likes_count * 3
          - game_cards.dislikes_count * 3
          - games.dislikes_count * 4
      ) as selection_score
    from public.game_cards
    join public.games on games.id = game_cards.game_id
    where coalesce(array_length(p_activity_kinds, 1), 0) > 0
      and game_cards.activity_kind = any(p_activity_kinds)
      and game_cards.card_type = 'ACTIVITY'
      and not game_cards.is_hidden
      and games.visibility = 'PUBLIC'
      and not games.is_hidden
      and (game_cards.dislikes_count < 5 or game_cards.likes_count >= game_cards.dislikes_count)
      and (games.dislikes_count < 10 or games.likes_count >= games.dislikes_count)
    order by game_cards.created_at desc
    limit 20
  ) activities
  on conflict do nothing;
end;
$$;
