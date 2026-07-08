-- Expand report reasons: split hate and harassment, add sexual coercion and
-- illegal activity. Legacy HATE_HARASSMENT stays valid for existing rows.

alter table public.game_reports
drop constraint if exists game_reports_reason_check;

alter table public.game_reports
add constraint game_reports_reason_check
check (
  reason in (
    'SELF_HARM',
    'UNDERAGE_DRINKING',
    'REAL_GAMBLING',
    'HARASSMENT',
    'HATE',
    'HATE_HARASSMENT',
    'DANGEROUS_CHALLENGE',
    'SEXUAL_COERCION',
    'ILLEGAL_ACTIVITY',
    'SPAM',
    'OTHER'
  )
);

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
    'HARASSMENT',
    'HATE',
    'DANGEROUS_CHALLENGE',
    'SEXUAL_COERCION',
    'ILLEGAL_ACTIVITY',
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
