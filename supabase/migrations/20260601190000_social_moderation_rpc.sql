create or replace function private.set_game_vote(
  p_game_id uuid,
  p_vote_type text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_session_id uuid := auth.uid();
  actor_profile_id uuid;
  target_creator_id uuid;
  previous_vote_type text;
begin
  if actor_session_id is null then
    raise exception 'Sign in or start guest mode before voting';
  end if;

  if p_vote_type is null or p_vote_type not in ('LIKE', 'DISLIKE') then
    raise exception 'Vote must be LIKE or DISLIKE';
  end if;

  select creator_id
  into target_creator_id
  from public.games
  where id = p_game_id
    and not is_hidden
    and visibility in ('PUBLIC', 'UNLISTED');

  if not found then
    raise exception 'Game is not available for voting';
  end if;

  if target_creator_id = actor_session_id then
    raise exception 'Creators cannot vote on their own games';
  end if;

  select id
  into actor_profile_id
  from public.profiles
  where id = actor_session_id;

  select vote_type
  into previous_vote_type
  from public.game_votes
  where game_id = p_game_id
    and actor_session_user_id = actor_session_id;

  if previous_vote_type = p_vote_type then
    delete from public.game_votes
    where game_id = p_game_id
      and actor_session_user_id = actor_session_id;

    return null;
  end if;

  if previous_vote_type is not null then
    update public.game_votes
    set vote_type = p_vote_type
    where game_id = p_game_id
      and actor_session_user_id = actor_session_id;
  else
    insert into public.game_votes (
      game_id,
      actor_session_user_id,
      user_id,
      guest_id,
      vote_type
    )
    values (
      p_game_id,
      actor_session_id,
      actor_profile_id,
      case when actor_profile_id is null then actor_session_id::text end,
      p_vote_type
    );
  end if;

  return p_vote_type;
end;
$$;

create or replace function private.submit_game_report(
  p_game_id uuid,
  p_reason text,
  p_details text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_session_id uuid := auth.uid();
  actor_profile_id uuid;
  report_id uuid;
begin
  if actor_session_id is null then
    raise exception 'Sign in or start guest mode before reporting';
  end if;

  if p_reason is null or p_reason not in (
    'SELF_HARM',
    'UNDERAGE_DRINKING',
    'REAL_GAMBLING',
    'HATE_HARASSMENT',
    'DANGEROUS_CHALLENGE',
    'SPAM',
    'OTHER'
  ) then
    raise exception 'Choose a valid report reason';
  end if;

  if char_length(coalesce(p_details, '')) > 1000 then
    raise exception 'Report details must contain at most 1000 characters';
  end if;

  if not exists (
    select 1
    from public.games
    where id = p_game_id
      and not is_hidden
      and visibility in ('PUBLIC', 'UNLISTED')
  ) then
    raise exception 'Game is not available for reporting';
  end if;

  if exists (
    select 1
    from public.game_reports
    where game_id = p_game_id
      and actor_session_user_id = actor_session_id
  ) then
    raise exception 'You already reported this game';
  end if;

  select id
  into actor_profile_id
  from public.profiles
  where id = actor_session_id;

  insert into public.game_reports (
    game_id,
    actor_session_user_id,
    user_id,
    guest_id,
    reason,
    details
  )
  values (
    p_game_id,
    actor_session_id,
    actor_profile_id,
    case when actor_profile_id is null then actor_session_id::text end,
    p_reason,
    nullif(trim(coalesce(p_details, '')), '')
  )
  returning id into report_id;

  return report_id;
end;
$$;

create or replace function private.refresh_game_save_metrics(target_game_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.games
  set saves_count = (
    select count(*)
    from public.saved_games
    where game_id = target_game_id
  )
  where id = target_game_id;
end;
$$;

create or replace function private.handle_saved_game_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_game_save_metrics(old.game_id);
    return old;
  end if;

  perform private.refresh_game_save_metrics(new.game_id);
  return new;
end;
$$;

drop trigger if exists refresh_game_save_metrics on public.saved_games;
create trigger refresh_game_save_metrics
after insert or delete on public.saved_games
for each row execute procedure private.handle_saved_game_change();

create or replace function private.toggle_saved_game(p_game_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_session_id uuid := auth.uid();
begin
  if actor_session_id is null or not private.is_registered_user() then
    raise exception 'Create an account before saving games';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = actor_session_id
  ) then
    raise exception 'Create a profile before saving games';
  end if;

  if not exists (
    select 1
    from public.games
    where id = p_game_id
      and not is_hidden
      and visibility in ('PUBLIC', 'UNLISTED')
  ) then
    raise exception 'Game is not available for saving';
  end if;

  delete from public.saved_games
  where game_id = p_game_id
    and user_id = actor_session_id;

  if found then
    return false;
  end if;

  insert into public.saved_games (game_id, user_id)
  values (p_game_id, actor_session_id);

  return true;
end;
$$;

create or replace function private.moderate_game(
  p_game_id uuid,
  p_hidden boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can moderate games';
  end if;

  update public.games
  set is_hidden = p_hidden
  where id = p_game_id;

  if not found then
    raise exception 'Game does not exist';
  end if;

  return p_hidden;
end;
$$;

create or replace function public.set_game_vote(
  p_game_id uuid,
  p_vote_type text
)
returns text
language sql
set search_path = ''
as $$
  select private.set_game_vote(p_game_id, p_vote_type);
$$;

create or replace function public.submit_game_report(
  p_game_id uuid,
  p_reason text,
  p_details text
)
returns uuid
language sql
set search_path = ''
as $$
  select private.submit_game_report(p_game_id, p_reason, p_details);
$$;

create or replace function public.toggle_saved_game(p_game_id uuid)
returns boolean
language sql
set search_path = ''
as $$
  select private.toggle_saved_game(p_game_id);
$$;

create or replace function public.moderate_game(
  p_game_id uuid,
  p_hidden boolean
)
returns boolean
language sql
set search_path = ''
as $$
  select private.moderate_game(p_game_id, p_hidden);
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.set_game_vote(uuid, text) from public, anon;
revoke execute on function public.submit_game_report(uuid, text, text) from public, anon;
revoke execute on function public.toggle_saved_game(uuid) from public, anon;
revoke execute on function public.moderate_game(uuid, boolean) from public, anon;

grant execute on function private.set_game_vote(uuid, text) to authenticated;
grant execute on function private.submit_game_report(uuid, text, text) to authenticated;
grant execute on function private.toggle_saved_game(uuid) to authenticated;
grant execute on function private.moderate_game(uuid, boolean) to authenticated;

grant execute on function public.set_game_vote(uuid, text) to authenticated;
grant execute on function public.submit_game_report(uuid, text, text) to authenticated;
grant execute on function public.toggle_saved_game(uuid) to authenticated;
grant execute on function public.moderate_game(uuid, boolean) to authenticated;

revoke insert, update, delete on public.game_votes from authenticated;
revoke insert on public.game_reports from authenticated;
revoke insert, delete on public.saved_games from authenticated;

create policy "actors can read their own report"
on public.game_reports for select
to authenticated
using (actor_session_user_id = auth.uid());
