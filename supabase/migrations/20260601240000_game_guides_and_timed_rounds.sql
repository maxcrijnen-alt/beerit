alter table public.games
add column if not exists rules_url text check (
  rules_url is null
  or rules_url ~ '^https://'
);

alter table public.game_cards
add column if not exists timer_seconds integer check (
  timer_seconds is null
  or timer_seconds between 5 and 300
);

alter table public.game_cards
drop constraint if exists game_cards_card_type_check;

alter table public.game_cards
add constraint game_cards_card_type_check
check (
  card_type in (
    'QUESTION',
    'DARE',
    'VOTE',
    'CHALLENGE',
    'RULE',
    'MANUAL_SCORING_ACTION',
    'ACTIVITY',
    'TIMED_EVENT'
  )
);

alter table public.game_cards
add constraint game_cards_timer_type_check
check (
  (card_type = 'TIMED_EVENT' and timer_seconds is not null)
  or (card_type <> 'TIMED_EVENT' and timer_seconds is null)
);

update public.games
set rules_url = 'https://www.pagat.com/climbing/president.html'
where id = '10000000-0000-4000-8000-000000000007';

update public.games
set rules_url = 'https://www.regels.nl/spelletjes/pesten/'
where id = '10000000-0000-4000-8000-000000000008';

update public.games
set rules_url = 'https://www.pagat.com/commerce/kemps.html'
where id = '10000000-0000-4000-8000-000000000009';

update public.games
set rules_url = 'https://www.pagat.com/last/toepen.html'
where id = '10000000-0000-4000-8000-000000000010';

update public.games
set rules_url = 'https://www.chess.com/learn-how-to-play-chess'
where id = '10000000-0000-4000-8000-000000000011';

update public.games
set rules_url = 'https://www.britannica.com/topic/checkers'
where id = '10000000-0000-4000-8000-000000000012';

update public.games
set rules_url = 'https://instructions.hasbro.com/en-sg/instruction/connect-4-game-instructions'
where id = '10000000-0000-4000-8000-000000000013';

update public.games
set rules_url = 'https://www.dicegamedepot.com/dice-n-games-blog/pig-dice-game-rules/'
where id = '10000000-0000-4000-8000-000000000014';

update public.games
set rules_url = 'https://www.dicegamedepot.com/ship-captain-and-crew-dice-game-rules/'
where id = '10000000-0000-4000-8000-000000000015';

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
values (
  '10000000-0000-4000-8000-000000000017',
  'Rapid Fire Timer',
  'Fast questions with a short timer. The first player who hesitates, repeats, or answers incorrectly receives 1 Beerit.',
  'Trivia',
  'Quick timed trivia, personal prompts, and categories',
  'Funny',
  2,
  12,
  15,
  'Read the card and start the timer. Take turns answering in a circle. Answers must be new and fit the prompt. The first player who cannot answer before time runs out, repeats an answer, or gives an incorrect trivia answer receives 1 fictional Beerit. Tap that player to score and continue immediately. Keep personal answers friendly; players may skip uncomfortable prompts.',
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
  intensity,
  beerits_value,
  timer_seconds,
  position
)
values
  (
    '60000000-0000-4000-8000-000000000015',
    '10000000-0000-4000-8000-000000000017',
    'Name countries in Europe. Go around the group without repeating an answer. The first player who hesitates or repeats loses the round.',
    'TIMED_EVENT',
    'Soft',
    1,
    20,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000016',
    '10000000-0000-4000-8000-000000000017',
    'Name things you could pack for a weekend away. Go around the group without repeating an answer.',
    'TIMED_EVENT',
    'Soft',
    1,
    20,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000017',
    '10000000-0000-4000-8000-000000000017',
    'Name films or series with at least two words in the title. Go around the group without repeating an answer.',
    'TIMED_EVENT',
    'Funny',
    1,
    20,
    3
  ),
  (
    '60000000-0000-4000-8000-000000000018',
    '10000000-0000-4000-8000-000000000017',
    'Name something you appreciate about another player. Keep it friendly and go around the group without repeating an answer.',
    'TIMED_EVENT',
    'Soft',
    1,
    25,
    4
  ),
  (
    '60000000-0000-4000-8000-000000000019',
    '10000000-0000-4000-8000-000000000017',
    'Name capital cities. Go around the group without repeating an answer. The group checks whether each answer is correct.',
    'TIMED_EVENT',
    'Funny',
    1,
    20,
    5
  ),
  (
    '60000000-0000-4000-8000-000000000020',
    '10000000-0000-4000-8000-000000000017',
    'Name foods you would serve at a party. Go around the group without repeating an answer.',
    'TIMED_EVENT',
    'Funny',
    1,
    20,
    6
  ),
  (
    '60000000-0000-4000-8000-000000000021',
    '10000000-0000-4000-8000-000000000017',
    'Name animals that live in or near water. Go around the group without repeating an answer.',
    'TIMED_EVENT',
    'Soft',
    1,
    20,
    7
  ),
  (
    '60000000-0000-4000-8000-000000000022',
    '10000000-0000-4000-8000-000000000017',
    'Name a positive memory from your student time in one short sentence. Players may skip uncomfortable prompts.',
    'TIMED_EVENT',
    'Soft',
    1,
    30,
    8
  )
on conflict (id) do update
set
  game_id = excluded.game_id,
  text = excluded.text,
  card_type = excluded.card_type,
  intensity = excluded.intensity,
  beerits_value = excluded.beerits_value,
  timer_seconds = excluded.timer_seconds,
  position = excluded.position;

create or replace function private.score_lobby_player_and_advance(
  p_lobby_id uuid,
  p_player_id uuid,
  p_delta integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_lobby public.lobbies%rowtype;
  card_count integer;
begin
  select *
  into target_lobby
  from public.lobbies
  where id = p_lobby_id
  for update;

  if target_lobby.id is null or target_lobby.host_session_user_id <> auth.uid() then
    raise exception 'Only the lobby host can score and advance gameplay';
  end if;

  if target_lobby.status <> 'ACTIVE' then
    raise exception 'Quick scoring is only available during active gameplay';
  end if;

  if p_delta < 1 or p_delta > 20 then
    raise exception 'Beerits adjustment must be between 1 and 20';
  end if;

  update public.lobby_players
  set beerits = beerits + p_delta
  where id = p_player_id
    and lobby_id = p_lobby_id;

  if not found then
    raise exception 'Lobby player not found';
  end if;

  select count(*)
  into card_count
  from public.lobby_cards
  where lobby_id = p_lobby_id;

  if target_lobby.current_card_index + 1 >= card_count then
    update public.lobbies
    set status = 'FINISHED', ended_at = now()
    where id = p_lobby_id;
  else
    update public.lobbies
    set current_card_index = current_card_index + 1
    where id = p_lobby_id;
  end if;
end;
$$;

create or replace function public.score_lobby_player_and_advance(
  p_lobby_id uuid,
  p_player_id uuid,
  p_delta integer
)
returns void
language sql
set search_path = ''
as $$
  select private.score_lobby_player_and_advance(p_lobby_id, p_player_id, p_delta);
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.score_lobby_player_and_advance(uuid, uuid, integer) from public, anon;
grant execute on function private.score_lobby_player_and_advance(uuid, uuid, integer) to authenticated;
grant execute on function public.score_lobby_player_and_advance(uuid, uuid, integer) to authenticated;
