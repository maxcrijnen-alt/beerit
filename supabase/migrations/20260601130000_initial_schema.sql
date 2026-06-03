create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 32),
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 280),
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  total_tokens integer not null default 0 check (total_tokens >= 0),
  total_likes_received integer not null default 0 check (total_likes_received >= 0),
  total_games_created integer not null default 0 check (total_games_created >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 3 and 100),
  description text check (description is null or char_length(description) <= 600),
  category text not null check (
    category in (
      'Truth or Dare',
      'Never Have I Ever',
      'Most Likely To',
      'Would You Rather',
      'Challenges',
      'Card Games',
      'Bar Games',
      'Manual Scoreboard',
      'Before Going Out',
      'Tourist Games',
      'Team Games',
      'Custom Rules'
    )
  ),
  intensity text not null check (intensity in ('Soft', 'Funny', 'Spicy', 'Chaos')),
  min_players integer not null default 2 check (min_players >= 1),
  max_players integer check (max_players is null or max_players >= min_players),
  estimated_duration integer check (estimated_duration is null or estimated_duration > 0),
  rules text check (rules is null or char_length(rules) <= 3000),
  visibility text not null default 'PUBLIC' check (visibility in ('PUBLIC', 'PRIVATE', 'UNLISTED')),
  remixed_from_game_id uuid references public.games(id) on delete set null,
  likes_count integer not null default 0 check (likes_count >= 0),
  dislikes_count integer not null default 0 check (dislikes_count >= 0),
  reports_count integer not null default 0 check (reports_count >= 0),
  plays_count integer not null default 0 check (plays_count >= 0),
  saves_count integer not null default 0 check (saves_count >= 0),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.game_cards (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 600),
  card_type text not null check (
    card_type in ('QUESTION', 'DARE', 'VOTE', 'CHALLENGE', 'RULE', 'MANUAL_SCORING_ACTION')
  ),
  intensity text not null check (intensity in ('Soft', 'Funny', 'Spicy', 'Chaos')),
  beerits_value integer not null default 1 check (beerits_value between 0 and 20),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (game_id, position)
);

create table public.game_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  actor_session_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  guest_id text,
  vote_type text not null check (vote_type in ('LIKE', 'DISLIKE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_id is not null)
);

create unique index game_votes_actor_unique
  on public.game_votes (game_id, actor_session_user_id);

create table public.game_reports (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  actor_session_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  guest_id text,
  reason text not null check (
    reason in (
      'SELF_HARM',
      'UNDERAGE_DRINKING',
      'REAL_GAMBLING',
      'HATE_HARASSMENT',
      'DANGEROUS_CHALLENGE',
      'SPAM',
      'OTHER'
    )
  ),
  details text check (details is null or char_length(details) <= 1000),
  created_at timestamptz not null default now(),
  check (user_id is not null or guest_id is not null)
);

create unique index game_reports_actor_unique
  on public.game_reports (game_id, actor_session_user_id);

create table public.lobbies (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^[A-Z0-9]{6}$'),
  game_id uuid not null references public.games(id) on delete cascade,
  host_session_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  host_user_id uuid references public.profiles(id) on delete set null,
  host_guest_name text,
  status text not null default 'WAITING' check (status in ('WAITING', 'ACTIVE', 'FINISHED')),
  current_card_index integer not null default 0 check (current_card_index >= 0),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz,
  updated_at timestamptz not null default now(),
  check (host_user_id is not null or host_guest_name is not null)
);

create table public.lobby_players (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies(id) on delete cascade,
  session_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  guest_name text,
  display_name text not null check (char_length(display_name) between 1 and 40),
  beerits integer not null default 0 check (beerits >= 0),
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lobby_id, session_user_id),
  check (user_id is not null or guest_name is not null)
);

create table public.lobby_messages (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies(id) on delete cascade,
  sender_session_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  guest_name text,
  display_name text not null check (char_length(display_name) between 1 and 40),
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null check (
    reason in ('GAME_LIKE_RECEIVED', 'GAME_LIKE_REMOVED', 'ADMIN_ADJUSTMENT', 'PLACEHOLDER_REWARD')
  ),
  related_game_id uuid references public.games(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.saved_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, game_id)
);

create index games_discovery_idx
  on public.games (visibility, is_hidden, created_at desc);
create index games_ranking_idx
  on public.games (likes_count desc, plays_count desc, created_at desc);
create index games_creator_idx on public.games (creator_id);
create index game_cards_game_position_idx on public.game_cards (game_id, position);
create index game_reports_game_idx on public.game_reports (game_id, created_at desc);
create index lobbies_game_idx on public.lobbies (game_id);
create index lobby_players_lobby_idx on public.lobby_players (lobby_id, joined_at);
create index lobby_messages_lobby_idx on public.lobby_messages (lobby_id, created_at);
create index token_transactions_user_idx on public.token_transactions (user_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'ADMIN'
  );
$$;

create or replace function private.is_lobby_member(target_lobby_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lobby_players
    where lobby_id = target_lobby_id
      and session_user_id = auth.uid()
  );
$$;

create or replace function private.is_lobby_host(target_lobby_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lobbies
    where id = target_lobby_id
      and host_session_user_id = auth.uid()
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.is_anonymous, false) then
    return new;
  end if;

  insert into public.profiles (id, username)
  values (new.id, 'player_' || substring(new.id::text, 1, 8))
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function private.adjust_creator_tokens(
  target_game_id uuid,
  token_delta integer,
  token_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_creator_id uuid;
begin
  if token_delta = 0 then
    return;
  end if;

  select creator_id
  into target_creator_id
  from public.games
  where id = target_game_id;

  if target_creator_id is null then
    return;
  end if;

  insert into public.token_transactions (user_id, amount, reason, related_game_id)
  values (target_creator_id, token_delta, token_reason, target_game_id);

  update public.profiles
  set
    total_tokens = greatest(0, total_tokens + token_delta),
    total_likes_received = greatest(0, total_likes_received + token_delta)
  where id = target_creator_id;
end;
$$;

create or replace function private.refresh_game_vote_metrics(target_game_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  like_total integer;
  dislike_total integer;
begin
  select
    count(*) filter (where vote_type = 'LIKE'),
    count(*) filter (where vote_type = 'DISLIKE')
  into like_total, dislike_total
  from public.game_votes
  where game_id = target_game_id;

  update public.games
  set
    likes_count = like_total,
    dislikes_count = dislike_total,
    is_hidden = is_hidden or (dislike_total >= 10 and dislike_total > like_total * 2)
  where id = target_game_id;
end;
$$;

create or replace function private.handle_game_vote_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.vote_type = 'LIKE' then
      perform private.adjust_creator_tokens(new.game_id, 1, 'GAME_LIKE_RECEIVED');
    end if;
    perform private.refresh_game_vote_metrics(new.game_id);
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.vote_type = 'LIKE' then
      perform private.adjust_creator_tokens(old.game_id, -1, 'GAME_LIKE_REMOVED');
    end if;
    perform private.refresh_game_vote_metrics(old.game_id);
    return old;
  end if;

  if old.game_id <> new.game_id then
    if old.vote_type = 'LIKE' then
      perform private.adjust_creator_tokens(old.game_id, -1, 'GAME_LIKE_REMOVED');
    end if;
    if new.vote_type = 'LIKE' then
      perform private.adjust_creator_tokens(new.game_id, 1, 'GAME_LIKE_RECEIVED');
    end if;
    perform private.refresh_game_vote_metrics(old.game_id);
    perform private.refresh_game_vote_metrics(new.game_id);
    return new;
  end if;

  if old.vote_type = 'LIKE' and new.vote_type <> 'LIKE' then
    perform private.adjust_creator_tokens(new.game_id, -1, 'GAME_LIKE_REMOVED');
  elsif old.vote_type <> 'LIKE' and new.vote_type = 'LIKE' then
    perform private.adjust_creator_tokens(new.game_id, 1, 'GAME_LIKE_RECEIVED');
  end if;

  perform private.refresh_game_vote_metrics(new.game_id);
  return new;
end;
$$;

create or replace function private.refresh_game_report_metrics(target_game_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  report_total integer;
begin
  select count(*)
  into report_total
  from public.game_reports
  where game_id = target_game_id;

  update public.games
  set
    reports_count = report_total,
    is_hidden = is_hidden or report_total >= 5
  where id = target_game_id;
end;
$$;

create or replace function private.handle_game_report_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_game_report_metrics(old.game_id);
    return old;
  end if;

  perform private.refresh_game_report_metrics(new.game_id);
  return new;
end;
$$;

create or replace function private.refresh_creator_game_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.creator_id is not null then
      update public.profiles
      set total_games_created = (
        select count(*) from public.games where creator_id = old.creator_id
      )
      where id = old.creator_id;
    end if;
    return old;
  end if;

  if new.creator_id is not null then
    update public.profiles
    set total_games_created = (
      select count(*) from public.games where creator_id = new.creator_id
    )
    where id = new.creator_id;
  end if;

  return new;
end;
$$;

create or replace function private.protect_lobby_player_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.lobby_id <> old.lobby_id or new.session_user_id <> old.session_user_id then
    raise exception 'Lobby player identity cannot be changed';
  end if;

  if new.user_id is distinct from old.user_id or new.guest_name is distinct from old.guest_name then
    raise exception 'Lobby player account cannot be changed';
  end if;

  if new.beerits <> old.beerits and not private.is_lobby_host(old.lobby_id) then
    raise exception 'Only the lobby host can update Beerits';
  end if;

  if new.is_host <> old.is_host then
    raise exception 'Lobby host status cannot be changed';
  end if;

  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger games_updated_at
before update on public.games
for each row execute function private.set_updated_at();

create trigger game_votes_updated_at
before update on public.game_votes
for each row execute function private.set_updated_at();

create trigger lobbies_updated_at
before update on public.lobbies
for each row execute function private.set_updated_at();

create trigger lobby_players_updated_at
before update on public.lobby_players
for each row execute function private.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create trigger on_game_vote_changed
after insert or update or delete on public.game_votes
for each row execute function private.handle_game_vote_change();

create trigger on_game_report_changed
after insert or delete on public.game_reports
for each row execute function private.handle_game_report_change();

create trigger on_game_created_or_deleted
after insert or delete on public.games
for each row execute function private.refresh_creator_game_count();

create trigger protect_lobby_player_fields
before update on public.lobby_players
for each row execute function private.protect_lobby_player_fields();

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_cards enable row level security;
alter table public.game_votes enable row level security;
alter table public.game_reports enable row level security;
alter table public.lobbies enable row level security;
alter table public.lobby_players enable row level security;
alter table public.lobby_messages enable row level security;
alter table public.token_transactions enable row level security;
alter table public.saved_games enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.profiles, public.games, public.game_cards to anon, authenticated;
grant insert (id, username, avatar_url, bio) on public.profiles to authenticated;
grant update (username, avatar_url, bio) on public.profiles to authenticated;
grant insert (
  creator_id, title, description, category, intensity, min_players, max_players,
  estimated_duration, rules, visibility, remixed_from_game_id
) on public.games to authenticated;
grant update (
  title, description, category, intensity, min_players, max_players,
  estimated_duration, rules, visibility
) on public.games to authenticated;
grant delete on public.games to authenticated;
grant insert, update, delete on public.game_cards to authenticated;
grant select, insert, delete on public.game_votes to authenticated;
grant update (vote_type) on public.game_votes to authenticated;
grant select, insert on public.game_reports to authenticated;
grant select, insert on public.lobbies to authenticated;
grant update (status, current_card_index, started_at, ended_at) on public.lobbies to authenticated;
grant select, insert, delete on public.lobby_players to authenticated;
grant update (display_name, beerits) on public.lobby_players to authenticated;
grant select, insert on public.lobby_messages to authenticated;
grant select on public.token_transactions to authenticated;
grant select, insert, delete on public.saved_games to authenticated;

revoke execute on all functions in schema private from public;
revoke all on function private.is_admin() from public;
revoke all on function private.is_lobby_member(uuid) from public;
revoke all on function private.is_lobby_host(uuid) from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_lobby_member(uuid) to authenticated;
grant execute on function private.is_lobby_host(uuid) to authenticated;

create policy "profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "users can insert their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "public games are readable"
on public.games for select
to anon, authenticated
using (visibility = 'PUBLIC' and not is_hidden);

create policy "creators and admins can read managed games"
on public.games for select
to authenticated
using (creator_id = auth.uid() or private.is_admin());

create policy "registered users can create games"
on public.games for insert
to authenticated
with check (creator_id = auth.uid());

create policy "creators can update their games"
on public.games for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "creators can delete their games"
on public.games for delete
to authenticated
using (creator_id = auth.uid());

create policy "cards of public games are readable"
on public.game_cards for select
to anon, authenticated
using (
  exists (
    select 1
    from public.games
    where games.id = game_cards.game_id
      and games.visibility = 'PUBLIC'
      and not games.is_hidden
  )
);

create policy "creators can read managed game cards"
on public.game_cards for select
to authenticated
using (
  exists (
    select 1
    from public.games
    where games.id = game_cards.game_id
      and (games.creator_id = auth.uid() or private.is_admin())
  )
);

create policy "creators can insert cards"
on public.game_cards for insert
to authenticated
with check (
  exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
);

create policy "creators can update cards"
on public.game_cards for update
to authenticated
using (
  exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
);

create policy "creators can delete cards"
on public.game_cards for delete
to authenticated
using (
  exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
);

create policy "actors can read their own vote"
on public.game_votes for select
to authenticated
using (actor_session_user_id = auth.uid());

create policy "actors can insert their own vote"
on public.game_votes for insert
to authenticated
with check (
  actor_session_user_id = auth.uid()
  and (user_id is null or user_id = auth.uid())
);

create policy "actors can update their own vote"
on public.game_votes for update
to authenticated
using (actor_session_user_id = auth.uid())
with check (
  actor_session_user_id = auth.uid()
  and (user_id is null or user_id = auth.uid())
);

create policy "actors can delete their own vote"
on public.game_votes for delete
to authenticated
using (actor_session_user_id = auth.uid());

create policy "actors can submit one report"
on public.game_reports for insert
to authenticated
with check (
  actor_session_user_id = auth.uid()
  and (user_id is null or user_id = auth.uid())
);

create policy "admins can read reports"
on public.game_reports for select
to authenticated
using (private.is_admin());

create policy "members can read lobbies"
on public.lobbies for select
to authenticated
using (
  host_session_user_id = auth.uid()
  or private.is_lobby_member(id)
);

create policy "actors can create lobbies"
on public.lobbies for insert
to authenticated
with check (
  host_session_user_id = auth.uid()
  and (host_user_id is null or host_user_id = auth.uid())
);

create policy "hosts can update lobbies"
on public.lobbies for update
to authenticated
using (host_session_user_id = auth.uid())
with check (host_session_user_id = auth.uid());

create policy "members can read lobby players"
on public.lobby_players for select
to authenticated
using (
  session_user_id = auth.uid()
  or private.is_lobby_member(lobby_id)
  or private.is_lobby_host(lobby_id)
);

create policy "actors can join waiting lobbies"
on public.lobby_players for insert
to authenticated
with check (
  session_user_id = auth.uid()
  and (user_id is null or user_id = auth.uid())
  and exists (
    select 1
    from public.lobbies
    where lobbies.id = lobby_players.lobby_id
      and lobbies.status = 'WAITING'
  )
);

create policy "players and hosts can update lobby players"
on public.lobby_players for update
to authenticated
using (
  session_user_id = auth.uid()
  or private.is_lobby_host(lobby_id)
)
with check (
  session_user_id = auth.uid()
  or private.is_lobby_host(lobby_id)
);

create policy "players can leave waiting lobbies"
on public.lobby_players for delete
to authenticated
using (
  session_user_id = auth.uid()
  and exists (
    select 1
    from public.lobbies
    where lobbies.id = lobby_players.lobby_id
      and lobbies.status = 'WAITING'
  )
);

create policy "members can read lobby messages"
on public.lobby_messages for select
to authenticated
using (private.is_lobby_member(lobby_id) or private.is_lobby_host(lobby_id));

create policy "members can send lobby messages"
on public.lobby_messages for insert
to authenticated
with check (
  sender_session_user_id = auth.uid()
  and (user_id is null or user_id = auth.uid())
  and (private.is_lobby_member(lobby_id) or private.is_lobby_host(lobby_id))
);

create policy "users can read their token transactions"
on public.token_transactions for select
to authenticated
using (user_id = auth.uid() or private.is_admin());

create policy "users can read their saved games"
on public.saved_games for select
to authenticated
using (user_id = auth.uid());

create policy "users can save games"
on public.saved_games for insert
to authenticated
with check (user_id = auth.uid());

create policy "users can remove saved games"
on public.saved_games for delete
to authenticated
using (user_id = auth.uid());

alter table public.lobbies replica identity full;
alter table public.lobby_players replica identity full;
alter table public.lobby_messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.lobbies;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.lobby_players;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.lobby_messages;
exception when duplicate_object then null;
end;
$$;
