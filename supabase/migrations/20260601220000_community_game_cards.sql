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
    'Team Games',
    'Custom Rules',
    'Icebreakers',
    'Conversation',
    'Trivia',
    'Road Trip',
    'Custom Concept'
  )
);

alter table public.game_cards
add column if not exists is_community boolean not null default false,
add column if not exists submitted_by_session_user_id uuid references auth.users(id) on delete set null,
add column if not exists likes_count integer not null default 0 check (likes_count >= 0),
add column if not exists dislikes_count integer not null default 0 check (dislikes_count >= 0),
add column if not exists is_hidden boolean not null default false,
add column if not exists activity_kind text check (
  activity_kind is null
  or activity_kind in ('BOARD_GAME', 'CARD_GAME', 'DICE_GAME', 'OTHER')
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
    'ACTIVITY'
  )
);

alter table public.game_cards
add constraint game_cards_activity_type_check
check (
  (card_type = 'ACTIVITY' and activity_kind is not null)
  or (card_type <> 'ACTIVITY' and activity_kind is null)
);

alter table public.lobbies
add column if not exists include_community_cards boolean not null default false,
add column if not exists mixed_categories text[] not null default '{}',
add column if not exists activity_kinds text[] not null default '{}';

alter table public.lobbies
add constraint lobbies_activity_kinds_check
check (
  activity_kinds <@ array['BOARD_GAME', 'CARD_GAME', 'DICE_GAME', 'OTHER']::text[]
);

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
    'Team Games',
    'Custom Rules',
    'Icebreakers',
    'Conversation',
    'Trivia',
    'Road Trip',
    'Custom Concept'
  ]::text[]
);

create table if not exists public.game_card_votes (
  id uuid primary key default gen_random_uuid(),
  game_card_id uuid not null references public.game_cards(id) on delete cascade,
  actor_session_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vote_type text not null check (vote_type in ('LIKE', 'DISLIKE')),
  created_at timestamptz not null default now(),
  unique (game_card_id, actor_session_user_id)
);

create table if not exists public.lobby_cards (
  lobby_id uuid not null references public.lobbies(id) on delete cascade,
  game_card_id uuid not null references public.game_cards(id) on delete cascade,
  position integer not null check (position >= 1),
  created_at timestamptz not null default now(),
  primary key (lobby_id, position),
  unique (lobby_id, game_card_id)
);

create index if not exists game_cards_community_recent_idx
  on public.game_cards (game_id, is_community, is_hidden, created_at desc);
create index if not exists game_card_votes_card_idx
  on public.game_card_votes (game_card_id);
create index if not exists lobby_cards_card_idx
  on public.lobby_cards (game_card_id);

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
  '10000000-0000-4000-8000-000000000006',
  'Game Night Activities',
  'Optional offline activities for a mixed Beerit lobby.',
  'Custom Concept',
  'Board games, card games, and dice games',
  'Funny',
  2,
  12,
  30,
  'Choose only activities your group has available tonight. Beerits remain fictional in-game penalty points.',
  'PUBLIC'
)
on conflict (id) do nothing;

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
    '60000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000006',
    'Play a short game of chess. The player who loses receives 5 Beerits.',
    'ACTIVITY',
    'BOARD_GAME',
    'Funny',
    5,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000006',
    'Play one quick round with a deck of cards. The loser receives 3 Beerits.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    3,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000006',
    'Each player rolls a die. The lowest roll receives 2 Beerits.',
    'ACTIVITY',
    'DICE_GAME',
    'Funny',
    2,
    3
  )
on conflict (id) do nothing;

alter table public.game_card_votes enable row level security;
alter table public.lobby_cards enable row level security;

revoke all on public.game_card_votes, public.lobby_cards from anon, authenticated;
grant select on public.game_card_votes, public.lobby_cards to authenticated;

create policy "actors can read their own card votes"
on public.game_card_votes for select
to authenticated
using (actor_session_user_id = (select auth.uid()));

create policy "lobby members can read lobby cards"
on public.lobby_cards for select
to authenticated
using (
  private.is_lobby_member(lobby_id)
  or private.is_lobby_host(lobby_id)
);

create policy "lobby members can read selected game cards"
on public.game_cards for select
to authenticated
using (
  exists (
    select 1
    from public.lobby_cards
    where lobby_cards.game_card_id = game_cards.id
      and (
        private.is_lobby_member(lobby_cards.lobby_id)
        or private.is_lobby_host(lobby_cards.lobby_id)
      )
  )
);

drop policy if exists "cards of discoverable and unlisted games are readable"
on public.game_cards;
create policy "cards of discoverable and unlisted games are readable"
on public.game_cards for select
to anon, authenticated
using (
  not is_hidden
  and exists (
    select 1
    from public.games
    where games.id = game_cards.game_id
      and games.visibility in ('PUBLIC', 'UNLISTED')
      and not games.is_hidden
  )
);

create or replace function private.refresh_game_card_vote_metrics(target_card_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  card_likes integer;
  card_dislikes integer;
begin
  select
    count(*) filter (where vote_type = 'LIKE'),
    count(*) filter (where vote_type = 'DISLIKE')
  into card_likes, card_dislikes
  from public.game_card_votes
  where game_card_id = target_card_id;

  update public.game_cards
  set
    likes_count = card_likes,
    dislikes_count = card_dislikes,
    is_hidden = is_hidden or (
      is_community
      and card_dislikes >= 5
      and card_dislikes > card_likes * 2
    )
  where id = target_card_id;
end;
$$;

create or replace function private.handle_game_card_vote_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_game_card_vote_metrics(old.game_card_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.game_card_id <> new.game_card_id then
    perform private.refresh_game_card_vote_metrics(old.game_card_id);
  end if;

  perform private.refresh_game_card_vote_metrics(new.game_card_id);
  return new;
end;
$$;

drop trigger if exists refresh_game_card_vote_metrics on public.game_card_votes;
create trigger refresh_game_card_vote_metrics
after insert or update or delete on public.game_card_votes
for each row execute procedure private.handle_game_card_vote_change();

create or replace function private.submit_community_game_card(
  p_game_id uuid,
  p_text text,
  p_intensity text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_session_id uuid := auth.uid();
  actor_submission_count integer;
  community_card_count integer;
  new_card_id uuid;
  next_position integer;
  normalized_text text := trim(p_text);
begin
  if actor_session_id is null then
    raise exception 'Sign in or start guest mode before adding a question';
  end if;

  if normalized_text is null
    or char_length(normalized_text) < 1
    or char_length(normalized_text) > 600 then
    raise exception 'Question must contain between 1 and 600 characters';
  end if;

  if p_intensity is null or p_intensity not in ('Soft', 'Funny', 'Spicy', 'Chaos') then
    raise exception 'Choose a valid intensity';
  end if;

  perform 1
  from public.games
  where id = p_game_id
    and not is_hidden
    and visibility in ('PUBLIC', 'UNLISTED')
  for update;

  if not found then
    raise exception 'Game is not available for community questions';
  end if;

  select
    count(*) filter (where submitted_by_session_user_id = actor_session_id),
    count(*)
  into actor_submission_count, community_card_count
  from public.game_cards
  where game_id = p_game_id
    and is_community;

  if actor_submission_count >= 20 then
    raise exception 'You added the maximum number of questions for this game';
  end if;

  if community_card_count >= 500 then
    raise exception 'This game reached the maximum number of community questions';
  end if;

  if exists (
    select 1
    from public.game_cards
    where game_id = p_game_id
      and is_community
      and lower(trim(text)) = lower(normalized_text)
  ) then
    raise exception 'This question already exists';
  end if;

  select coalesce(max(position), 0) + 1
  into next_position
  from public.game_cards
  where game_id = p_game_id;

  insert into public.game_cards (
    game_id,
    text,
    card_type,
    intensity,
    beerits_value,
    position,
    is_community,
    submitted_by_session_user_id
  )
  values (
    p_game_id,
    normalized_text,
    'QUESTION',
    p_intensity,
    1,
    next_position,
    true,
    actor_session_id
  )
  returning id into new_card_id;

  return new_card_id;
end;
$$;

create or replace function private.set_game_card_vote(
  p_game_card_id uuid,
  p_vote_type text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_session_id uuid := auth.uid();
  previous_vote_type text;
begin
  if actor_session_id is null then
    raise exception 'Sign in or start guest mode before voting';
  end if;

  if p_vote_type is null or p_vote_type not in ('LIKE', 'DISLIKE') then
    raise exception 'Vote must be LIKE or DISLIKE';
  end if;

  if not exists (
    select 1
    from public.game_cards
    join public.games on games.id = game_cards.game_id
    where game_cards.id = p_game_card_id
      and not game_cards.is_hidden
      and not games.is_hidden
      and (
        games.visibility in ('PUBLIC', 'UNLISTED')
        or games.creator_id = actor_session_id
        or private.is_lobby_game_member(games.id)
      )
  ) then
    raise exception 'Question is not available for voting';
  end if;

  select vote_type
  into previous_vote_type
  from public.game_card_votes
  where game_card_id = p_game_card_id
    and actor_session_user_id = actor_session_id;

  if previous_vote_type = p_vote_type then
    delete from public.game_card_votes
    where game_card_id = p_game_card_id
      and actor_session_user_id = actor_session_id;

    return null;
  end if;

  insert into public.game_card_votes (
    game_card_id,
    actor_session_user_id,
    vote_type
  )
  values (
    p_game_card_id,
    actor_session_id,
    p_vote_type
  )
  on conflict (game_card_id, actor_session_user_id) do update
  set vote_type = excluded.vote_type;

  return p_vote_type;
end;
$$;

create or replace function private.snapshot_lobby_cards(
  p_lobby_id uuid,
  p_game_id uuid,
  p_include_community_cards boolean,
  p_mixed_categories text[],
  p_activity_kinds text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  official_count integer;
begin
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

  if not p_include_community_cards then
    null;
  else
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
      select game_cards.id, game_cards.created_at, game_cards.likes_count, game_cards.dislikes_count
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
        8 + game_cards.likes_count * 2 - game_cards.dislikes_count * 3
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
    order by game_cards.created_at desc
    limit 10
  ) activities
  on conflict do nothing;
end;
$$;

insert into public.lobby_cards (lobby_id, game_card_id, position)
select
  lobbies.id,
  game_cards.id,
  row_number() over (
    partition by lobbies.id
    order by game_cards.position, game_cards.created_at, game_cards.id
  )
from public.lobbies
join public.game_cards on game_cards.game_id = lobbies.game_id
where not game_cards.is_community
  and not game_cards.is_hidden
on conflict do nothing;

drop function if exists public.create_lobby(uuid, text);
drop function if exists private.create_lobby(uuid, text);

create or replace function private.create_lobby(
  p_game_id uuid,
  p_display_name text,
  p_include_community_cards boolean,
  p_mixed_categories text[],
  p_activity_kinds text[]
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

  if coalesce(cardinality(p_mixed_categories), 0) > 13
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
        activity_kinds
      )
      values (
        new_lobby_code,
        p_game_id,
        actor_session_id,
        actor_profile_id,
        case when actor_profile_id is null then actor_display_name end,
        coalesce(p_include_community_cards, false),
        coalesce(p_mixed_categories, '{}'),
        coalesce(p_activity_kinds, '{}')
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
    coalesce(p_activity_kinds, '{}')
  );

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

create or replace function private.control_lobby(
  p_lobby_id uuid,
  p_control text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_lobby public.lobbies%rowtype;
  card_count integer;
  normalized_control text := upper(trim(p_control));
begin
  select *
  into target_lobby
  from public.lobbies
  where id = p_lobby_id
  for update;

  if target_lobby.id is null or target_lobby.host_session_user_id <> auth.uid() then
    raise exception 'Only the lobby host can control gameplay';
  end if;

  if normalized_control = 'START' then
    if target_lobby.status <> 'WAITING' then
      raise exception 'Only a waiting lobby can be started';
    end if;

    update public.lobbies
    set status = 'ACTIVE', current_card_index = 0, started_at = now(), ended_at = null
    where id = p_lobby_id;

    update public.games
    set plays_count = plays_count + 1
    where id = target_lobby.game_id;
  elsif normalized_control in ('NEXT', 'SKIP') then
    if target_lobby.status <> 'ACTIVE' then
      raise exception 'Only an active lobby can advance cards';
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
  elsif normalized_control = 'PREVIOUS' then
    if target_lobby.status <> 'ACTIVE' then
      raise exception 'Only an active lobby can move to a previous card';
    end if;

    update public.lobbies
    set current_card_index = greatest(0, current_card_index - 1)
    where id = p_lobby_id;
  elsif normalized_control = 'END' then
    if target_lobby.status = 'FINISHED' then
      return;
    end if;

    update public.lobbies
    set status = 'FINISHED', ended_at = now()
    where id = p_lobby_id;
  else
    raise exception 'Unsupported lobby control';
  end if;
end;
$$;

create or replace function public.submit_community_game_card(
  p_game_id uuid,
  p_text text,
  p_intensity text
)
returns uuid
language sql
set search_path = ''
as $$
  select private.submit_community_game_card(p_game_id, p_text, p_intensity);
$$;

create or replace function public.set_game_card_vote(
  p_game_card_id uuid,
  p_vote_type text
)
returns text
language sql
set search_path = ''
as $$
  select private.set_game_card_vote(p_game_card_id, p_vote_type);
$$;

create or replace function public.create_lobby(
  p_game_id uuid,
  p_display_name text,
  p_include_community_cards boolean,
  p_mixed_categories text[],
  p_activity_kinds text[]
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
    p_activity_kinds
  );
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.submit_community_game_card(uuid, text, text) from public, anon;
revoke execute on function public.set_game_card_vote(uuid, text) from public, anon;
revoke execute on function public.create_lobby(uuid, text, boolean, text[], text[]) from public, anon;

grant execute on function private.submit_community_game_card(uuid, text, text) to authenticated;
grant execute on function private.set_game_card_vote(uuid, text) to authenticated;
grant execute on function private.create_lobby(uuid, text, boolean, text[], text[]) to authenticated;
grant execute on function public.submit_community_game_card(uuid, text, text) to authenticated;
grant execute on function public.set_game_card_vote(uuid, text) to authenticated;
grant execute on function public.create_lobby(uuid, text, boolean, text[], text[]) to authenticated;
