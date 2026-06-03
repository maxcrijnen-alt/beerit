create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);

create unique index friendships_pair_unique
  on public.friendships (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

alter table public.friendships enable row level security;

revoke all on public.friendships from anon, authenticated;
grant select on public.friendships to authenticated;

create policy "participants can read friendships"
on public.friendships for select
to authenticated
using (
  requester_id = (select auth.uid())
  or addressee_id = (select auth.uid())
);

create or replace function private.send_friend_request(p_username text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_id uuid;
  friendship_id uuid;
begin
  if actor_id is null or not private.is_registered_user() then
    raise exception 'Create an account before adding friends';
  end if;

  select id
  into target_id
  from public.profiles
  where username = lower(trim(p_username));

  if target_id is null or target_id = actor_id then
    raise exception 'Choose another registered Beerit user';
  end if;

  select id
  into friendship_id
  from public.friendships
  where least(requester_id, addressee_id) = least(actor_id, target_id)
    and greatest(requester_id, addressee_id) = greatest(actor_id, target_id);

  if friendship_id is not null then
    return friendship_id;
  end if;

  insert into public.friendships (requester_id, addressee_id)
  values (actor_id, target_id)
  returning id into friendship_id;

  return friendship_id;
end;
$$;

create or replace function private.respond_friend_request(
  p_friendship_id uuid,
  p_accept boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.is_registered_user() then
    raise exception 'Create an account before responding to friend requests';
  end if;

  if p_accept then
    update public.friendships
    set status = 'ACCEPTED', updated_at = now()
    where id = p_friendship_id
      and addressee_id = auth.uid()
      and status = 'PENDING';
  else
    delete from public.friendships
    where id = p_friendship_id
      and addressee_id = auth.uid()
      and status = 'PENDING';
  end if;

  if not found then
    raise exception 'Pending friend request not found';
  end if;
end;
$$;

create or replace function private.remove_friendship(p_friendship_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.is_registered_user() then
    raise exception 'Create an account before managing friends';
  end if;

  delete from public.friendships
  where id = p_friendship_id
    and (
      requester_id = auth.uid()
      or addressee_id = auth.uid()
    );

  if not found then
    raise exception 'Friendship not found';
  end if;
end;
$$;

create or replace function public.get_friend_standings()
returns table (
  friendship_id uuid,
  friend_id uuid,
  friend_username text,
  status text,
  direction text,
  shared_lobbies bigint,
  your_beerits bigint,
  friend_beerits bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with actor as (
    select auth.uid() as id
  ),
  friend_rows as (
    select
      friendships.id as friendship_id,
      friendships.status,
      case
        when friendships.requester_id = actor.id then friendships.addressee_id
        else friendships.requester_id
      end as friend_id,
      case
        when friendships.requester_id = actor.id then 'OUTGOING'
        else 'INCOMING'
      end as direction,
      actor.id as actor_id
    from public.friendships
    cross join actor
    where friendships.requester_id = actor.id
      or friendships.addressee_id = actor.id
  ),
  lobby_totals as (
    select
      friend_rows.friend_id,
      count(distinct lobbies.id) as shared_lobbies,
      coalesce(sum(actor_players.beerits), 0)::bigint as your_beerits,
      coalesce(sum(friend_players.beerits), 0)::bigint as friend_beerits
    from friend_rows
    join public.lobby_players actor_players
      on actor_players.user_id = friend_rows.actor_id
    join public.lobby_players friend_players
      on friend_players.lobby_id = actor_players.lobby_id
      and friend_players.user_id = friend_rows.friend_id
    join public.lobbies
      on lobbies.id = actor_players.lobby_id
      and lobbies.status = 'FINISHED'
    where friend_rows.status = 'ACCEPTED'
    group by friend_rows.friend_id
  )
  select
    friend_rows.friendship_id,
    friend_rows.friend_id,
    profiles.username as friend_username,
    friend_rows.status,
    friend_rows.direction,
    coalesce(lobby_totals.shared_lobbies, 0)::bigint,
    coalesce(lobby_totals.your_beerits, 0)::bigint,
    coalesce(lobby_totals.friend_beerits, 0)::bigint
  from friend_rows
  join public.profiles on profiles.id = friend_rows.friend_id
  left join lobby_totals on lobby_totals.friend_id = friend_rows.friend_id
  order by
    case when friend_rows.status = 'PENDING' then 0 else 1 end,
    profiles.username;
$$;

create or replace function public.send_friend_request(p_username text)
returns uuid
language sql
set search_path = ''
as $$
  select private.send_friend_request(p_username);
$$;

create or replace function public.respond_friend_request(
  p_friendship_id uuid,
  p_accept boolean
)
returns void
language sql
set search_path = ''
as $$
  select private.respond_friend_request(p_friendship_id, p_accept);
$$;

create or replace function public.remove_friendship(p_friendship_id uuid)
returns void
language sql
set search_path = ''
as $$
  select private.remove_friendship(p_friendship_id);
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.get_friend_standings() from public, anon;
revoke execute on function public.send_friend_request(text) from public, anon;
revoke execute on function public.respond_friend_request(uuid, boolean) from public, anon;
revoke execute on function public.remove_friendship(uuid) from public, anon;

grant execute on function private.send_friend_request(text) to authenticated;
grant execute on function private.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function private.remove_friendship(uuid) to authenticated;
grant execute on function public.get_friend_standings() to authenticated;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.remove_friendship(uuid) to authenticated;
