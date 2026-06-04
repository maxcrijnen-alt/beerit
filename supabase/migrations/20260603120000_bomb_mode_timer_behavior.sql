alter table public.game_cards
add column if not exists timer_behavior text,
add column if not exists timer_min_seconds integer,
add column if not exists timer_max_seconds integer;

update public.game_cards
set timer_behavior = 'FIXED'
where timer_behavior is null;

alter table public.game_cards
alter column timer_behavior set default 'FIXED',
alter column timer_behavior set not null;

alter table public.game_cards
drop constraint if exists game_cards_timer_behavior_check;

alter table public.game_cards
add constraint game_cards_timer_behavior_check
check (timer_behavior in ('FIXED', 'RANDOM_BOMB'));

alter table public.game_cards
drop constraint if exists game_cards_timer_range_check;

alter table public.game_cards
add constraint game_cards_timer_range_check
check (
  (
    timer_min_seconds is null
    or timer_min_seconds between 5 and 300
  )
  and (
    timer_max_seconds is null
    or timer_max_seconds between 5 and 300
  )
  and (
    timer_min_seconds is null
    or timer_max_seconds is null
    or timer_max_seconds >= timer_min_seconds
  )
);

alter table public.game_cards
drop constraint if exists game_cards_timer_type_check;

alter table public.game_cards
add constraint game_cards_timer_type_check
check (
  (
    card_type = 'TIMED_EVENT'
    and (
      (
        timer_behavior = 'FIXED'
        and timer_seconds is not null
        and timer_min_seconds is null
        and timer_max_seconds is null
      )
      or (
        timer_behavior = 'RANDOM_BOMB'
        and timer_seconds is null
        and timer_min_seconds is not null
        and timer_max_seconds is not null
      )
    )
  )
  or (
    card_type <> 'TIMED_EVENT'
    and timer_behavior = 'FIXED'
    and timer_seconds is null
    and timer_min_seconds is null
    and timer_max_seconds is null
  )
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
values (
  '10000000-0000-4000-8000-000000000090',
  'Bomb Mode',
  'Hot-potato category rounds with a random timer. Whoever holds the phone when time runs out receives 1 fictional Beerit.',
  'Challenges',
  'Hot potato random timer',
  'Funny',
  2,
  20,
  15,
  'Pass the phone around the circle while answering the prompt on the card. Answers must be new and fit the category. When the timer ends, the host taps the player holding the phone to add 1 fictional Beerit and move to the next card. Players may skip uncomfortable prompts. No wagers, payouts, or real-world rewards are involved.',
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
  timer_behavior,
  timer_min_seconds,
  timer_max_seconds,
  position
)
values
  (
    '60000000-0000-4000-8000-000000000090',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming snacks. No repeats.',
    'TIMED_EVENT',
    'Soft',
    1,
    'RANDOM_BOMB',
    20,
    180,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000091',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming cities. The group may reject unclear answers.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000092',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming things you find in a student house.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    3
  ),
  (
    '60000000-0000-4000-8000-000000000093',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming songs most people know.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    4
  ),
  (
    '60000000-0000-4000-8000-000000000094',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while giving harmless compliments. No repeating compliments.',
    'TIMED_EVENT',
    'Soft',
    1,
    'RANDOM_BOMB',
    20,
    180,
    5
  ),
  (
    '60000000-0000-4000-8000-000000000095',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming board, card, or dice games.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    6
  )
on conflict (id) do update
set
  game_id = excluded.game_id,
  text = excluded.text,
  card_type = excluded.card_type,
  intensity = excluded.intensity,
  beerits_value = excluded.beerits_value,
  timer_behavior = excluded.timer_behavior,
  timer_min_seconds = excluded.timer_min_seconds,
  timer_max_seconds = excluded.timer_max_seconds,
  position = excluded.position;
