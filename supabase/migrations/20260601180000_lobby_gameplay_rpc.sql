create or replace function private.is_lobby_game_member(target_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lobbies
    where game_id = target_game_id
      and (
        host_session_user_id = auth.uid()
        or exists (
          select 1
          from public.lobby_players
          where lobby_players.lobby_id = lobbies.id
            and lobby_players.session_user_id = auth.uid()
        )
      )
  );
$$;

create or replace function private.create_lobby(
  p_game_id uuid,
  p_display_name text
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
        host_guest_name
      )
      values (
        new_lobby_code,
        p_game_id,
        actor_session_id,
        actor_profile_id,
        case when actor_profile_id is null then actor_display_name end
      )
      returning id into new_lobby_id;

      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

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

create or replace function private.join_lobby_by_code(
  p_code text,
  p_display_name text
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
  target_lobby_id uuid;
begin
  if actor_session_id is null then
    raise exception 'Sign in before joining a lobby';
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

  select id
  into target_lobby_id
  from public.lobbies
  where code = upper(trim(p_code))
    and status = 'WAITING';

  if target_lobby_id is null then
    raise exception 'Waiting lobby not found';
  end if;

  insert into public.lobby_players (
    lobby_id,
    session_user_id,
    user_id,
    guest_name,
    display_name
  )
  values (
    target_lobby_id,
    actor_session_id,
    actor_profile_id,
    case when actor_profile_id is null then actor_display_name end,
    actor_display_name
  )
  on conflict (lobby_id, session_user_id) do update
  set display_name = excluded.display_name;

  return target_lobby_id;
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
    from public.game_cards
    where game_id = target_lobby.game_id;

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
end;
$$;

create or replace function private.send_lobby_message(
  p_lobby_id uuid,
  p_message text,
  p_display_name text
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
  new_message_id uuid;
  normalized_message text := trim(p_message);
begin
  if actor_session_id is null
    or not (
      private.is_lobby_member(p_lobby_id)
      or private.is_lobby_host(p_lobby_id)
    ) then
    raise exception 'Join the lobby before sending messages';
  end if;

  if normalized_message is null
    or char_length(normalized_message) < 1
    or char_length(normalized_message) > 500 then
    raise exception 'Message must contain between 1 and 500 characters';
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

  insert into public.lobby_messages (
    lobby_id,
    sender_session_user_id,
    user_id,
    guest_name,
    display_name,
    message
  )
  values (
    p_lobby_id,
    actor_session_id,
    actor_profile_id,
    case when actor_profile_id is null then actor_display_name end,
    actor_display_name,
    normalized_message
  )
  returning id into new_message_id;

  return new_message_id;
end;
$$;

create or replace function private.leave_lobby(p_lobby_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.lobbies
    where id = p_lobby_id
      and host_session_user_id = auth.uid()
  ) then
    raise exception 'The host cannot leave their own lobby';
  end if;

  delete from public.lobby_players
  where lobby_id = p_lobby_id
    and session_user_id = auth.uid()
    and exists (
      select 1
      from public.lobbies
      where id = p_lobby_id
        and status = 'WAITING'
    );

  if not found then
    raise exception 'Only players in a waiting lobby can leave';
  end if;
end;
$$;

create or replace function public.create_lobby(
  p_game_id uuid,
  p_display_name text
)
returns uuid
language sql
set search_path = ''
as $$
  select private.create_lobby(p_game_id, p_display_name);
$$;

create or replace function public.join_lobby_by_code(
  p_code text,
  p_display_name text
)
returns uuid
language sql
set search_path = ''
as $$
  select private.join_lobby_by_code(p_code, p_display_name);
$$;

create or replace function public.control_lobby(
  p_lobby_id uuid,
  p_control text
)
returns void
language sql
set search_path = ''
as $$
  select private.control_lobby(p_lobby_id, p_control);
$$;

create or replace function public.adjust_lobby_beerits(
  p_lobby_id uuid,
  p_player_id uuid,
  p_delta integer
)
returns void
language sql
set search_path = ''
as $$
  select private.adjust_lobby_beerits(p_lobby_id, p_player_id, p_delta);
$$;

create or replace function public.send_lobby_message(
  p_lobby_id uuid,
  p_message text,
  p_display_name text
)
returns uuid
language sql
set search_path = ''
as $$
  select private.send_lobby_message(p_lobby_id, p_message, p_display_name);
$$;

create or replace function public.leave_lobby(p_lobby_id uuid)
returns void
language sql
set search_path = ''
as $$
  select private.leave_lobby(p_lobby_id);
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.create_lobby(uuid, text) from public, anon;
revoke execute on function public.join_lobby_by_code(text, text) from public, anon;
revoke execute on function public.control_lobby(uuid, text) from public, anon;
revoke execute on function public.adjust_lobby_beerits(uuid, uuid, integer) from public, anon;
revoke execute on function public.send_lobby_message(uuid, text, text) from public, anon;
revoke execute on function public.leave_lobby(uuid) from public, anon;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_registered_user() to authenticated;
grant execute on function private.is_lobby_member(uuid) to authenticated;
grant execute on function private.is_lobby_host(uuid) to authenticated;
grant execute on function private.is_lobby_game_member(uuid) to authenticated;
grant execute on function private.create_lobby(uuid, text) to authenticated;
grant execute on function private.join_lobby_by_code(text, text) to authenticated;
grant execute on function private.control_lobby(uuid, text) to authenticated;
grant execute on function private.adjust_lobby_beerits(uuid, uuid, integer) to authenticated;
grant execute on function private.send_lobby_message(uuid, text, text) to authenticated;
grant execute on function private.leave_lobby(uuid) to authenticated;

grant execute on function public.create_lobby(uuid, text) to authenticated;
grant execute on function public.join_lobby_by_code(text, text) to authenticated;
grant execute on function public.control_lobby(uuid, text) to authenticated;
grant execute on function public.adjust_lobby_beerits(uuid, uuid, integer) to authenticated;
grant execute on function public.send_lobby_message(uuid, text, text) to authenticated;
grant execute on function public.leave_lobby(uuid) to authenticated;

revoke insert, update on public.lobbies from authenticated;
revoke insert, update, delete on public.lobby_players from authenticated;
revoke insert on public.lobby_messages from authenticated;

create policy "lobby members can read lobby games"
on public.games for select
to authenticated
using (private.is_lobby_game_member(id));

create policy "lobby members can read lobby game cards"
on public.game_cards for select
to authenticated
using (private.is_lobby_game_member(game_id));
