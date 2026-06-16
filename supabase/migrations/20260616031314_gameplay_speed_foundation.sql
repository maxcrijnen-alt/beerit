create table private.lobby_quick_result_undos (
  lobby_id uuid primary key references public.lobbies(id) on delete cascade,
  player_id uuid not null references public.lobby_players(id) on delete cascade,
  delta integer not null check (delta between 1 and 20),
  previous_card_index integer not null check (previous_card_index >= 0),
  next_card_index integer not null check (next_card_index >= 0),
  previous_status text not null check (previous_status in ('WAITING', 'ACTIVE', 'FINISHED')),
  next_status text not null check (next_status in ('WAITING', 'ACTIVE', 'FINISHED')),
  previous_ended_at timestamptz,
  next_ended_at timestamptz,
  created_by_session_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

revoke all on private.lobby_quick_result_undos from public, anon, authenticated;

create or replace function private.clear_lobby_quick_result_undo(p_lobby_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from private.lobby_quick_result_undos
  where lobby_id = p_lobby_id;
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

create or replace function private.adjust_lobby_beerits(
  p_lobby_id uuid,
  p_player_id uuid,
  p_delta integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_lobby_host(p_lobby_id) then
    raise exception 'Only the lobby host can adjust Beerits';
  end if;

  if p_delta < -20 or p_delta > 20 or p_delta = 0 then
    raise exception 'Beerits adjustment must be between -20 and 20';
  end if;

  if not exists (
    select 1
    from public.lobbies
    where id = p_lobby_id
      and status = 'ACTIVE'
  ) then
    raise exception 'Beerits can only be changed during active gameplay';
  end if;

  update public.lobby_players
  set beerits = greatest(0, beerits + p_delta)
  where id = p_player_id
    and lobby_id = p_lobby_id;

  if not found then
    raise exception 'Lobby player not found';
  end if;

  perform private.clear_lobby_quick_result_undo(p_lobby_id);
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

  select count(*)
  into card_count
  from public.lobby_cards
  where lobby_id = p_lobby_id;

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

create or replace function private.undo_last_lobby_quick_result(p_lobby_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_lobby public.lobbies%rowtype;
  undo_row private.lobby_quick_result_undos%rowtype;
begin
  select *
  into target_lobby
  from public.lobbies
  where id = p_lobby_id
  for update;

  if target_lobby.id is null or target_lobby.host_session_user_id <> auth.uid() then
    raise exception 'Only the lobby host can undo quick results';
  end if;

  select *
  into undo_row
  from private.lobby_quick_result_undos
  where lobby_id = p_lobby_id
  for update;

  if undo_row.lobby_id is null then
    raise exception 'No quick result is available to undo';
  end if;

  if target_lobby.status <> undo_row.next_status
    or target_lobby.current_card_index <> undo_row.next_card_index then
    delete from private.lobby_quick_result_undos
    where lobby_id = p_lobby_id;

    raise exception 'The last quick result can no longer be undone';
  end if;

  update public.lobby_players
  set beerits = greatest(0, beerits - undo_row.delta)
  where id = undo_row.player_id
    and lobby_id = p_lobby_id;

  if not found then
    delete from private.lobby_quick_result_undos
    where lobby_id = p_lobby_id;

    raise exception 'Scored player is no longer in this lobby';
  end if;

  update public.lobbies
  set
    status = undo_row.previous_status,
    current_card_index = undo_row.previous_card_index,
    ended_at = undo_row.previous_ended_at
  where id = p_lobby_id;

  delete from private.lobby_quick_result_undos
  where lobby_id = p_lobby_id;
end;
$$;

create or replace function public.undo_last_lobby_quick_result(p_lobby_id uuid)
returns void
language sql
set search_path = ''
as $$
  select private.undo_last_lobby_quick_result(p_lobby_id);
$$;

revoke execute on function public.undo_last_lobby_quick_result(uuid) from public, anon;
grant execute on function private.clear_lobby_quick_result_undo(uuid) to authenticated;
grant execute on function private.undo_last_lobby_quick_result(uuid) to authenticated;
grant execute on function public.undo_last_lobby_quick_result(uuid) to authenticated;
