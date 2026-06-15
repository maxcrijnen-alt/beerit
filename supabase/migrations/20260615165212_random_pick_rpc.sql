create or replace function public.pick_random_game(
  p_categories text[] default '{}',
  p_intensities text[] default '{}',
  p_player_count integer default null,
  p_duration_max_minutes integer default null,
  p_content_mode text default 'BOTH',
  p_pool text default 'HOT',
  p_excluded_game_ids uuid[] default '{}',
  p_query text default ''
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  normalized_categories text[] := coalesce(p_categories, '{}');
  normalized_intensities text[] := coalesce(p_intensities, '{}');
  normalized_content_mode text := upper(trim(coalesce(p_content_mode, 'BOTH')));
  normalized_pool text := upper(trim(coalesce(p_pool, 'HOT')));
  normalized_excluded_game_ids uuid[] := coalesce(p_excluded_game_ids, '{}');
  normalized_query text := lower(trim(coalesce(p_query, '')));
  valid_categories constant text[] := array[
    'Truth or Dare',
    'Never Have I Ever',
    'Most Likely To',
    'Would You Rather',
    'Challenges',
    'Card Games',
    'Board Games',
    'Dice Games',
    'Team Games',
    'Custom Rules',
    'Icebreakers',
    'Conversation',
    'Trivia',
    'Road Trip',
    'Custom Concept'
  ];
  valid_intensities constant text[] := array['Soft', 'Funny', 'Spicy', 'Chaos'];
  physical_categories constant text[] := array[
    'Card Games',
    'Board Games',
    'Dice Games'
  ];
  picked_game_id uuid;
begin
  if coalesce(cardinality(normalized_categories), 0) > 15
    or not normalized_categories <@ valid_categories then
    raise exception 'Choose valid game categories';
  end if;

  if coalesce(cardinality(normalized_intensities), 0) > 4
    or not normalized_intensities <@ valid_intensities then
    raise exception 'Choose valid game intensities';
  end if;

  if normalized_content_mode not in ('BOTH', 'DIGITAL', 'PHYSICAL') then
    raise exception 'Choose a valid content mode';
  end if;

  if normalized_pool not in ('HOT', 'TOP', 'RECENT', 'MOST_LIKED', 'SURPRISE') then
    raise exception 'Choose a valid discovery pool';
  end if;

  if p_player_count is not null and (p_player_count < 1 or p_player_count > 100) then
    raise exception 'Choose a valid player count';
  end if;

  if p_duration_max_minutes is not null
    and (p_duration_max_minutes < 1 or p_duration_max_minutes > 240) then
    raise exception 'Choose a valid duration';
  end if;

  if coalesce(cardinality(normalized_excluded_game_ids), 0) > 50 then
    raise exception 'Too many recent games were provided';
  end if;

  with candidates as (
    select
      games.id,
      games.category,
      games.created_at,
      games.dislikes_count,
      games.estimated_duration,
      games.likes_count,
      games.plays_count,
      games.reports_count,
      greatest(
        0,
        extract(epoch from (now() - games.created_at)) / 86400
      ) as age_days
    from public.games
    where games.visibility = 'PUBLIC'
      and not games.is_hidden
      and (
        coalesce(cardinality(normalized_categories), 0) = 0
        or games.category = any(normalized_categories)
      )
      and (
        coalesce(cardinality(normalized_intensities), 0) = 0
        or games.intensity = any(normalized_intensities)
      )
      and (
        p_player_count is null
        or (
          games.min_players <= p_player_count
          and (games.max_players is null or games.max_players >= p_player_count)
        )
      )
      and (
        p_duration_max_minutes is null
        or (
          games.estimated_duration is not null
          and games.estimated_duration <= p_duration_max_minutes
        )
      )
      and (
        normalized_content_mode = 'BOTH'
        or (
          normalized_content_mode = 'PHYSICAL'
          and games.category = any(physical_categories)
        )
        or (
          normalized_content_mode = 'DIGITAL'
          and games.category <> all(physical_categories)
        )
      )
      and games.id <> all(normalized_excluded_game_ids)
      and (
        normalized_query = ''
        or lower(
          games.title || ' ' ||
          coalesce(games.description, '') || ' ' ||
          games.category || ' ' ||
          coalesce(games.concept, '')
        ) like '%' || normalized_query || '%'
      )
  ),
  weighted as (
    select
      candidates.id,
      case
        when candidates.dislikes_count >= 10
          and candidates.dislikes_count > candidates.likes_count * 2
          then 0.25
        when normalized_pool = 'HOT' then greatest(
          1,
          (
            candidates.likes_count
            - candidates.dislikes_count
            + candidates.plays_count * 0.2
            - candidates.reports_count * 3
          )
          + (
            candidates.plays_count * greatest(0.1, 1 - candidates.age_days / 30) * 2
            + candidates.likes_count * greatest(0.1, 1 - candidates.age_days / 30) * 3
          )
          + 10
        )
        when normalized_pool = 'RECENT' then greatest(
          1,
          10
            + greatest(0, 5 - candidates.age_days * 0.25) * 3
            + candidates.likes_count
            - candidates.dislikes_count * 4
        )
        when normalized_pool = 'MOST_LIKED' then greatest(
          1,
          10
            + candidates.likes_count * 5
            - candidates.dislikes_count * 3
            - candidates.reports_count * 8
        )
        when normalized_pool = 'SURPRISE' then greatest(
          1,
          sqrt(greatest(
            1,
            10
              + candidates.likes_count * 3
              + least(candidates.plays_count, 100) * 0.25
              + greatest(0, 5 - candidates.age_days * 0.25)
              - candidates.dislikes_count * 4
              - candidates.reports_count * 8
          )) + 3
        )
        else greatest(
          1,
          10
            + candidates.likes_count * 3
            + least(candidates.plays_count, 100) * 0.25
            + greatest(0, 5 - candidates.age_days * 0.25)
            - candidates.dislikes_count * 4
            - candidates.reports_count * 8
        )
      end as weight
    from candidates
  )
  select weighted.id
  into picked_game_id
  from weighted
  order by -ln(greatest(random(), 0.000001)) / weighted.weight asc
  limit 1;

  return picked_game_id;
end;
$$;

revoke execute on function public.pick_random_game(
  text[],
  text[],
  integer,
  integer,
  text,
  text,
  uuid[],
  text
) from public;

grant execute on function public.pick_random_game(
  text[],
  text[],
  integer,
  integer,
  text,
  text,
  uuid[],
  text
) to anon, authenticated;
