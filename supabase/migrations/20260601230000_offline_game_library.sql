alter table public.games
drop constraint if exists games_category_check;

alter table public.games
add constraint games_category_check
check (
  category in (
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
  )
);

alter table public.lobbies
add column if not exists activity_selection_mode text not null default 'MIXED';

alter table public.lobbies
drop constraint if exists lobbies_activity_selection_mode_check;

alter table public.lobbies
add constraint lobbies_activity_selection_mode_check
check (activity_selection_mode in ('MIXED', 'ONLY_SELECTED'));

alter table public.lobbies
drop constraint if exists lobbies_mixed_categories_check;

alter table public.lobbies
add constraint lobbies_mixed_categories_check
check (
  mixed_categories <@ array[
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
  ]::text[]
);

insert into public.games (
  id,
  title,
  description,
  category,
  concept,
  intensity,
  min_players,
  max_players,
  estimated_duration,
  rules,
  visibility
)
values
  (
    '10000000-0000-4000-8000-000000000007',
    'Presidenten',
    'A familiar ranking game for a standard deck of cards.',
    'Card Games',
    'Standard deck, finish-order ranking',
    'Funny',
    3,
    8,
    20,
    'Use a standard deck without jokers. Deal all cards. The starting player places one or more cards of the same value. Going clockwise, play the same number of cards at a higher value or pass. A 2 is high. When everyone passes, the last player to play starts a new pile. The first player with no cards is the President. Beerits: 1st place 0, 2nd place 1, 3rd place 2, every lower place 3, and the final player 5. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    'Pesten',
    'Fast shedding game with a standard deck and simple house rules.',
    'Card Games',
    'Standard deck, quick shedding game',
    'Funny',
    2,
    6,
    20,
    'Use a standard deck. Deal seven cards per player and place one open card beside the draw pile. On your turn, play a card with the same suit or value, or draw one card. Before starting, agree which special cards your group uses. Recommended simple rules: 2 means the next player draws two, 8 skips the next player, and jack changes suit. Beerits: 1st player out 0, 2nd place 1, 3rd place 2, every lower place 3, and the final player 4. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    'Kemps',
    'A quick team card game built around collecting four of a kind and a secret signal.',
    'Card Games',
    'Standard deck, even teams',
    'Funny',
    4,
    8,
    15,
    'Play with an even number of players in teams of two. Partners sit opposite each other and agree on a subtle signal. Deal four cards to each player and place four open cards in the middle. Everyone may swap one card at a time with the middle. Refresh the middle when nobody wants a card. Collect four of a kind, signal your partner, and let your partner call Kemps. Play best of three rounds. Beerits: winning team members receive 0, losing team members receive 3. A false Kemps call gives that team 1 extra Beerit each. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000010',
    'Toepen: Beerit Edition',
    'A short Dutch trick-taking game with fixed fictional penalty points.',
    'Card Games',
    '32-card deck, last-trick challenge',
    'Funny',
    2,
    8,
    20,
    'Use the 32 cards from 7 through ace. Deal four cards per player. The player left of the dealer leads; follow suit if possible. Card order from high to low is 10, 9, 8, 7, ace, king, queen, jack. Only the fourth and final trick determines the round winner. Normally, each losing player receives 1 Beerit. A player may knock before the final trick: players who fold receive the current amount, while players who continue risk 1 additional Beerit. Stop when someone reaches 7 Beerits. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000011',
    'Quick Chess',
    'A short chess round for groups with a board available.',
    'Board Games',
    'Chess board, short timer',
    'Soft',
    2,
    2,
    15,
    'Set up a normal chess board. Play one short game with a suggested timer of five minutes per player. Follow standard chess rules. Beerits: winner 0, loser 5, or 1 each after a draw. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000012',
    'Checkers Sprint',
    'A quick checkers round for two players.',
    'Board Games',
    'Checkers board, short round',
    'Soft',
    2,
    2,
    15,
    'Set up a standard checkers board and play one game. A player wins by capturing all opposing pieces or leaving the opponent without a valid move. Beerits: winner 0, loser 4, or 1 each after an agreed time-limit draw. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000013',
    'Four in a Row Mini Tournament',
    'A short rotating tournament for a four-in-a-row set.',
    'Board Games',
    'Four-in-a-row set, rotating tournament',
    'Funny',
    2,
    8,
    20,
    'Play short one-on-one rounds. Players alternate dropping pieces into the grid. The first player with four connected pieces horizontally, vertically, or diagonally wins the round. Rotate opponents until everyone has played at least twice. Rank players by wins, then by fewest losses. Beerits: 1st place 0, 2nd place 1, 3rd place 2, every lower place 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000014',
    'Pig Dice',
    'Press your luck with one die and decide when to bank your turn score.',
    'Dice Games',
    'One die, bank-or-roll decisions',
    'Funny',
    2,
    10,
    15,
    'Use one six-sided die. On your turn, roll repeatedly and add each result to your temporary turn total. You may stop and bank that total whenever you want. If you roll a 1, your turn ends and you bank nothing from that turn. The first player to reach 50 points wins; continue until the remaining places are clear. Beerits: 1st place 0, 2nd place 1, 3rd place 2, every lower place 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000015',
    'Ship, Captain, Crew',
    'Build a 6, 5, and 4 in order, then score the remaining dice as cargo.',
    'Dice Games',
    'Five dice, three rolls per turn',
    'Funny',
    2,
    10,
    15,
    'Use five six-sided dice. Each player gets at most three rolls. First keep a 6 for the ship, then a 5 for the captain, then a 4 for the crew. You must collect them in that order. Once you have all three, the remaining two dice are your cargo score. Reroll any dice you have not kept until your third roll. After three rounds per player, rank by total cargo. Beerits: 1st place 0, 2nd place 1, 3rd place 2, every lower place 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000016',
    'Highest Roll Ladder',
    'A simple dice ranking game that works with any number of available dice.',
    'Dice Games',
    'At least one die, five quick rounds',
    'Soft',
    2,
    12,
    10,
    'Use at least one six-sided die. Each player rolls once per round. If you have only one die, pass it around. Record the result and repeat for five rounds. Rank players by their five-roll total; tied players roll once more until the tie is broken. Beerits: 1st place 0, 2nd place 1, 3rd place 2, every lower place 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  concept = excluded.concept,
  intensity = excluded.intensity,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  estimated_duration = excluded.estimated_duration,
  rules = excluded.rules,
  visibility = excluded.visibility;

insert into public.game_cards (
  id,
  game_id,
  text,
  card_type,
  activity_kind,
  intensity,
  beerits_value,
  position
)
values
  (
    '60000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000007',
    'Play Presidenten. Rank players by finish order: 1st receives 0 Beerits, 2nd 1, 3rd 2, lower places 3, and the final player 5.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    5,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000008',
    'Play Pesten. Rank players as they empty their hands: 1st receives 0 Beerits, 2nd 1, 3rd 2, lower places 3, and the final player 4.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    4,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000009',
    'Play a best-of-three Kemps match. Winning team members receive 0 Beerits and losing team members receive 3.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000010',
    'Play Toepen until someone reaches 7 Beerits. The last-trick winner receives 0 each round; other active players receive the agreed fictional penalty.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000011',
    'Play a short game of chess. The winner receives 0 Beerits, the loser 5, or both players 1 after a draw.',
    'ACTIVITY',
    'BOARD_GAME',
    'Soft',
    5,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000012',
    'Play Checkers Sprint. The winner receives 0 Beerits, the loser 4, or both players 1 after a draw.',
    'ACTIVITY',
    'BOARD_GAME',
    'Soft',
    4,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000013',
    'Play a four-in-a-row mini tournament. Rank by wins: 1st receives 0 Beerits, 2nd 1, 3rd 2, and lower places 3.',
    'ACTIVITY',
    'BOARD_GAME',
    'Funny',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000014',
    'Play Pig Dice to 50 points. Rank players: 1st receives 0 Beerits, 2nd 1, 3rd 2, and lower places 3.',
    'ACTIVITY',
    'DICE_GAME',
    'Funny',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000015',
    'Play three rounds of Ship, Captain, Crew. Rank cargo totals: 1st receives 0 Beerits, 2nd 1, 3rd 2, and lower places 3.',
    'ACTIVITY',
    'DICE_GAME',
    'Funny',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000016',
    'Play five rounds of Highest Roll Ladder. Rank totals: 1st receives 0 Beerits, 2nd 1, 3rd 2, and lower places 3.',
    'ACTIVITY',
    'DICE_GAME',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000014',
    '10000000-0000-4000-8000-000000000006',
    'Choose a short offline activity everyone agrees on. Rank players: 1st receives 0 Beerits, 2nd 1, 3rd 2, and lower places 3.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    3,
    4
  )
on conflict (id) do update
set
  game_id = excluded.game_id,
  text = excluded.text,
  card_type = excluded.card_type,
  activity_kind = excluded.activity_kind,
  intensity = excluded.intensity,
  beerits_value = excluded.beerits_value,
  position = excluded.position;

drop function if exists public.create_lobby(uuid, text, boolean, text[], text[]);
drop function if exists private.create_lobby(uuid, text, boolean, text[], text[]);
drop function if exists private.snapshot_lobby_cards(uuid, uuid, boolean, text[], text[]);

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
  if p_activity_selection_mode <> 'ONLY_SELECTED' then
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

create or replace function private.create_lobby(
  p_game_id uuid,
  p_display_name text,
  p_include_community_cards boolean,
  p_mixed_categories text[],
  p_activity_kinds text[],
  p_activity_selection_mode text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_session_id uuid := auth.uid();
  actor_profile_id uuid;
  actor_display_name text;
  new_lobby_id uuid;
  new_lobby_code text;
  normalized_activity_selection_mode text := upper(trim(coalesce(p_activity_selection_mode, 'MIXED')));
begin
  if actor_session_id is null then
    raise exception 'Sign in before creating a lobby';
  end if;

  select id, username
  into actor_profile_id, actor_display_name
  from public.profiles
  where id = actor_session_id;

  if actor_profile_id is null then
    actor_display_name := trim(p_display_name);
  end if;

  if actor_display_name is null
    or char_length(actor_display_name) < 1
    or char_length(actor_display_name) > 40 then
    raise exception 'Display name must contain between 1 and 40 characters';
  end if;

  if normalized_activity_selection_mode not in ('MIXED', 'ONLY_SELECTED') then
    raise exception 'Choose a valid offline game mode';
  end if;

  if normalized_activity_selection_mode = 'ONLY_SELECTED'
    and coalesce(cardinality(p_activity_kinds), 0) = 0 then
    raise exception 'Choose at least one offline game type';
  end if;

  if coalesce(cardinality(p_mixed_categories), 0) > 15
    or coalesce(cardinality(p_activity_kinds), 0) > 4 then
    raise exception 'Too many lobby filters';
  end if;

  if not exists (
    select 1
    from public.games
    where id = p_game_id
      and not is_hidden
      and (
        visibility in ('PUBLIC', 'UNLISTED')
        or creator_id = actor_session_id
      )
  ) then
    raise exception 'Game is not available for a lobby';
  end if;

  loop
    new_lobby_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

    begin
      insert into public.lobbies (
        code,
        game_id,
        host_session_user_id,
        host_user_id,
        host_guest_name,
        include_community_cards,
        mixed_categories,
        activity_kinds,
        activity_selection_mode
      )
      values (
        new_lobby_code,
        p_game_id,
        actor_session_id,
        actor_profile_id,
        case when actor_profile_id is null then actor_display_name end,
        coalesce(p_include_community_cards, false),
        coalesce(p_mixed_categories, '{}'),
        coalesce(p_activity_kinds, '{}'),
        normalized_activity_selection_mode
      )
      returning id into new_lobby_id;

      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  perform private.snapshot_lobby_cards(
    new_lobby_id,
    p_game_id,
    coalesce(p_include_community_cards, false),
    coalesce(p_mixed_categories, '{}'),
    coalesce(p_activity_kinds, '{}'),
    normalized_activity_selection_mode
  );

  if not exists (
    select 1
    from public.lobby_cards
    where lobby_id = new_lobby_id
  ) then
    raise exception 'No cards match the selected offline game types';
  end if;

  insert into public.lobby_players (
    lobby_id,
    session_user_id,
    user_id,
    guest_name,
    display_name,
    is_host
  )
  values (
    new_lobby_id,
    actor_session_id,
    actor_profile_id,
    case when actor_profile_id is null then actor_display_name end,
    actor_display_name,
    true
  );

  return new_lobby_id;
end;
$$;

create or replace function public.create_lobby(
  p_game_id uuid,
  p_display_name text,
  p_include_community_cards boolean,
  p_mixed_categories text[],
  p_activity_kinds text[],
  p_activity_selection_mode text
)
returns uuid
language sql
set search_path = ''
as $$
  select private.create_lobby(
    p_game_id,
    p_display_name,
    p_include_community_cards,
    p_mixed_categories,
    p_activity_kinds,
    p_activity_selection_mode
  );
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.create_lobby(uuid, text, boolean, text[], text[], text) from public, anon;

grant execute on function private.create_lobby(uuid, text, boolean, text[], text[], text) to authenticated;
grant execute on function public.create_lobby(uuid, text, boolean, text[], text[], text) to authenticated;
