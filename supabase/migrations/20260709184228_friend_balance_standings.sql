-- Friend Balance phase 2: persistent fictional Balance Points per friendship,
-- derived from finished lobbies with the same zero-sum placement formula the
-- app uses (5/3/1 base, ties share their slots, per-lobby total is zero).
-- Balance Points are a fictional friend-group score: no money, no debt.

alter table public.friendships
add column if not exists balance_marked_even_at timestamptz;

drop function if exists public.get_friend_standings();

create or replace function public.get_friend_standings()
returns table (
  friendship_id uuid,
  friend_id uuid,
  friend_username text,
  status text,
  direction text,
  shared_lobbies bigint,
  your_beerits bigint,
  friend_beerits bigint,
  your_balance_points numeric,
  friend_balance_points numeric
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
      friendships.balance_marked_even_at,
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
  ),
  balance_source as (
    -- Guests keep their slots so per-lobby points stay zero-sum; only the
    -- totals below are limited to registered friends.
    select
      lobby_players.lobby_id,
      lobby_players.user_id,
      lobbies.ended_at,
      row_number() over (
        partition by lobby_players.lobby_id
        order by lobby_players.beerits asc, lobby_players.id
      ) as slot,
      rank() over (
        partition by lobby_players.lobby_id
        order by lobby_players.beerits asc
      ) as place_rank,
      count(*) over (partition by lobby_players.lobby_id) as player_count
    from public.lobby_players
    join public.lobbies
      on lobbies.id = lobby_players.lobby_id
      and lobbies.status = 'FINISHED'
  ),
  balance_shared as (
    select
      lobby_id,
      user_id,
      ended_at,
      avg(
        case
          when slot = 1 then 5.0
          when slot = 2 then 3.0
          when slot = 3 then 1.0
          else 0.0
        end
      ) over (partition by lobby_id, place_rank) as shared_points
    from balance_source
    where player_count >= 2
  ),
  balance_points as (
    select
      lobby_id,
      user_id,
      ended_at,
      shared_points - avg(shared_points) over (partition by lobby_id) as points
    from balance_shared
  ),
  balance_totals as (
    select
      friend_rows.friendship_id,
      coalesce(sum(actor_points.points), 0) as your_balance_points,
      coalesce(sum(friend_points.points), 0) as friend_balance_points
    from friend_rows
    join balance_points actor_points
      on actor_points.user_id = friend_rows.actor_id
    join balance_points friend_points
      on friend_points.lobby_id = actor_points.lobby_id
      and friend_points.user_id = friend_rows.friend_id
    where friend_rows.status = 'ACCEPTED'
      and (
        friend_rows.balance_marked_even_at is null
        or actor_points.ended_at > friend_rows.balance_marked_even_at
      )
    group by friend_rows.friendship_id
  )
  select
    friend_rows.friendship_id,
    friend_rows.friend_id,
    profiles.username as friend_username,
    friend_rows.status,
    friend_rows.direction,
    coalesce(lobby_totals.shared_lobbies, 0)::bigint,
    coalesce(lobby_totals.your_beerits, 0)::bigint,
    coalesce(lobby_totals.friend_beerits, 0)::bigint,
    round(coalesce(balance_totals.your_balance_points, 0), 1),
    round(coalesce(balance_totals.friend_balance_points, 0), 1)
  from friend_rows
  join public.profiles on profiles.id = friend_rows.friend_id
  left join lobby_totals on lobby_totals.friend_id = friend_rows.friend_id
  left join balance_totals on balance_totals.friendship_id = friend_rows.friendship_id
  order by
    case when friend_rows.status = 'PENDING' then 0 else 1 end,
    profiles.username;
$$;

revoke execute on function public.get_friend_standings() from public, anon;
grant execute on function public.get_friend_standings() to authenticated;

create or replace function public.mark_friend_balance_even(p_friendship_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'Sign in before updating Friend Balance';
  end if;

  update public.friendships
  set balance_marked_even_at = now()
  where id = p_friendship_id
    and status = 'ACCEPTED'
    and (requester_id = actor_id or addressee_id = actor_id);

  if not found then
    raise exception 'Friendship not found';
  end if;
end;
$$;

revoke execute on function public.mark_friend_balance_even(uuid) from public, anon;
grant execute on function public.mark_friend_balance_even(uuid) to authenticated;
