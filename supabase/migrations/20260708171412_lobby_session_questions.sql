-- Session-only custom questions: added during a lobby, used only in that
-- lobby, never saved to the cloud game. No Tokens are involved.

create table public.lobby_session_questions (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies(id) on delete cascade,
  submitted_by_session_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  text text not null check (char_length(text) between 1 and 600),
  intensity text not null check (intensity in ('Soft', 'Funny', 'Spicy', 'Chaos')),
  beerits_value integer not null default 1 check (beerits_value between 0 and 20),
  created_at timestamptz not null default now()
);

create index lobby_session_questions_lobby_order_idx
on public.lobby_session_questions (lobby_id, created_at, id);

alter table public.lobby_session_questions enable row level security;

create policy "lobby members can read session questions"
on public.lobby_session_questions
for select
to authenticated
using (
  private.is_lobby_member(lobby_id)
  or private.is_lobby_host(lobby_id)
);

create policy "hosts and submitters can delete session questions"
on public.lobby_session_questions
for delete
to authenticated
using (
  submitted_by_session_user_id = auth.uid()
  or private.is_lobby_host(lobby_id)
);

-- Total playable cards in a lobby: snapshot cards plus session questions.
create or replace function private.lobby_total_card_count(p_lobby_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.lobby_cards where lobby_id = p_lobby_id)
    + (select count(*) from public.lobby_session_questions where lobby_id = p_lobby_id);
$$;

grant execute on function private.lobby_total_card_count(uuid) to authenticated;

create or replace function public.add_lobby_session_question(
  p_lobby_id uuid,
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
  normalized_text text := trim(coalesce(p_text, ''));
  normalized_intensity text := initcap(lower(trim(coalesce(p_intensity, ''))));
  target_lobby public.lobbies%rowtype;
  actor_display_name text;
  lobby_question_count integer;
  actor_question_count integer;
  new_question_id uuid;
begin
  if actor_session_id is null then
    raise exception 'Sign in or start guest mode before adding a question';
  end if;

  if char_length(normalized_text) < 1 or char_length(normalized_text) > 600 then
    raise exception 'Question must contain between 1 and 600 characters';
  end if;

  if normalized_intensity not in ('Soft', 'Funny', 'Spicy', 'Chaos') then
    raise exception 'Choose a valid intensity';
  end if;

  select *
  into target_lobby
  from public.lobbies
  where id = p_lobby_id
  for update;

  if target_lobby.id is null
    or not (
      private.is_lobby_member(p_lobby_id)
      or private.is_lobby_host(p_lobby_id)
    ) then
    raise exception 'Join the lobby before adding a question';
  end if;

  if target_lobby.status = 'FINISHED' then
    raise exception 'This lobby already finished';
  end if;

  select display_name
  into actor_display_name
  from public.lobby_players
  where lobby_id = p_lobby_id
    and session_user_id = actor_session_id
  limit 1;

  if actor_display_name is null then
    raise exception 'Join the lobby before adding a question';
  end if;

  select
    count(*),
    count(*) filter (where submitted_by_session_user_id = actor_session_id)
  into lobby_question_count, actor_question_count
  from public.lobby_session_questions
  where lobby_id = p_lobby_id;

  if actor_question_count >= 10 then
    raise exception 'You added the maximum number of session questions';
  end if;

  if lobby_question_count >= 30 then
    raise exception 'This lobby reached the maximum number of session questions';
  end if;

  insert into public.lobby_session_questions (
    lobby_id,
    submitted_by_session_user_id,
    display_name,
    text,
    intensity
  )
  values (
    p_lobby_id,
    actor_session_id,
    actor_display_name,
    normalized_text,
    normalized_intensity
  )
  returning id into new_question_id;

  return new_question_id;
end;
$$;

grant execute on function public.add_lobby_session_question(uuid, text, text) to authenticated;

-- Card advancement now counts session questions as playable cards.
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

    perform private.clear_lobby_quick_result_undo(p_lobby_id);

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

    perform private.clear_lobby_quick_result_undo(p_lobby_id);

    card_count := private.lobby_total_card_count(p_lobby_id);

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

    perform private.clear_lobby_quick_result_undo(p_lobby_id);

    update public.lobbies
    set current_card_index = greatest(0, current_card_index - 1)
    where id = p_lobby_id;
  elsif normalized_control = 'END' then
    if target_lobby.status = 'FINISHED' then
      return;
    end if;

    perform private.clear_lobby_quick_result_undo(p_lobby_id);

    update public.lobbies
    set status = 'FINISHED', ended_at = now()
    where id = p_lobby_id;
  else
    raise exception 'Unsupported lobby control';
  end if;
end;
$$;

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
  next_card_index integer;
  next_status text := 'ACTIVE';
  next_ended_at timestamptz := null;
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

  card_count := private.lobby_total_card_count(p_lobby_id);

  if target_lobby.current_card_index + 1 >= card_count then
    next_card_index := target_lobby.current_card_index;
    next_status := 'FINISHED';
    next_ended_at := now();

    update public.lobbies
    set status = next_status, ended_at = next_ended_at
    where id = p_lobby_id;
  else
    next_card_index := target_lobby.current_card_index + 1;

    update public.lobbies
    set current_card_index = next_card_index
    where id = p_lobby_id;
  end if;

  insert into private.lobby_quick_result_undos (
    lobby_id,
    player_id,
    delta,
    previous_card_index,
    next_card_index,
    previous_status,
    next_status,
    previous_ended_at,
    next_ended_at,
    created_by_session_user_id
  )
  values (
    p_lobby_id,
    p_player_id,
    p_delta,
    target_lobby.current_card_index,
    next_card_index,
    target_lobby.status,
    next_status,
    target_lobby.ended_at,
    next_ended_at,
    auth.uid()
  )
  on conflict (lobby_id) do update
  set
    player_id = excluded.player_id,
    delta = excluded.delta,
    previous_card_index = excluded.previous_card_index,
    next_card_index = excluded.next_card_index,
    previous_status = excluded.previous_status,
    next_status = excluded.next_status,
    previous_ended_at = excluded.previous_ended_at,
    next_ended_at = excluded.next_ended_at,
    created_by_session_user_id = excluded.created_by_session_user_id,
    created_at = now();
end;
$$;

grant select, delete on public.lobby_session_questions to authenticated;

alter table public.lobby_session_questions replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.lobby_session_questions;
exception when duplicate_object then null;
end;
$$;
