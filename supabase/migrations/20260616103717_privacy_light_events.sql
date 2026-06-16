create table private.app_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'LOBBY_CREATED',
      'LOBBY_STARTED',
      'LOBBY_ENDED',
      'RANDOM_GAME_PICKED',
      'COMMUNITY_QUESTION_ADDED',
      'GAME_TOPIC_ADDED'
    )
  ),
  game_id uuid references public.games(id) on delete set null,
  lobby_id uuid references public.lobbies(id) on delete set null,
  actor_kind text not null check (actor_kind in ('ACCOUNT', 'GUEST', 'UNKNOWN')),
  created_at timestamptz not null default now()
);

alter table private.app_events enable row level security;

create index app_events_event_created_idx
on private.app_events (event_type, created_at desc);

create index app_events_game_created_idx
on private.app_events (game_id, created_at desc)
where game_id is not null;

create index app_events_lobby_created_idx
on private.app_events (lobby_id, created_at desc)
where lobby_id is not null;

revoke all on private.app_events from public, anon, authenticated;
grant select, insert, update, delete on private.app_events to service_role;

create or replace function private.track_app_event(
  p_event_type text,
  p_game_id uuid default null,
  p_lobby_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_kind text := 'UNKNOWN';
  normalized_event_type text := upper(trim(coalesce(p_event_type, '')));
begin
  if normalized_event_type not in (
    'LOBBY_CREATED',
    'LOBBY_STARTED',
    'LOBBY_ENDED',
    'RANDOM_GAME_PICKED',
    'COMMUNITY_QUESTION_ADDED',
    'GAME_TOPIC_ADDED'
  ) then
    raise exception 'Unsupported app event type';
  end if;

  if auth.uid() is not null then
    if private.is_registered_user() then
      actor_kind := 'ACCOUNT';
    else
      actor_kind := 'GUEST';
    end if;
  end if;

  insert into private.app_events (
    event_type,
    game_id,
    lobby_id,
    actor_kind
  )
  values (
    normalized_event_type,
    p_game_id,
    p_lobby_id,
    actor_kind
  );
end;
$$;

create or replace function public.track_app_event(
  p_event_type text,
  p_game_id uuid default null,
  p_lobby_id uuid default null
)
returns void
language sql
set search_path = ''
as $$
  select private.track_app_event(p_event_type, p_game_id, p_lobby_id);
$$;

revoke execute on function public.track_app_event(text, uuid, uuid) from public, anon;
grant execute on function private.track_app_event(text, uuid, uuid) to authenticated;
grant execute on function public.track_app_event(text, uuid, uuid) to authenticated;
