create or replace function private.is_registered_user()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  if coalesce(new.is_anonymous, false) then
    return new;
  end if;

  requested_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));

  if requested_username !~ '^[a-z0-9_]{3,32}$' then
    requested_username := 'player_' || substring(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username)
  values (new.id, requested_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on all functions in schema private from public;
grant execute on function private.is_registered_user() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_lobby_member(uuid) to authenticated;
grant execute on function private.is_lobby_host(uuid) to authenticated;

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "registered users can insert their own profile"
on public.profiles for insert
to authenticated
with check (
  id = auth.uid()
  and private.is_registered_user()
);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "registered users can update their own profile"
on public.profiles for update
to authenticated
using (
  id = auth.uid()
  and private.is_registered_user()
)
with check (
  id = auth.uid()
  and private.is_registered_user()
);

drop policy if exists "registered users can create games" on public.games;
create policy "registered users can create games"
on public.games for insert
to authenticated
with check (
  creator_id = auth.uid()
  and private.is_registered_user()
);

drop policy if exists "creators can update their games" on public.games;
create policy "registered creators can update their games"
on public.games for update
to authenticated
using (
  creator_id = auth.uid()
  and private.is_registered_user()
)
with check (
  creator_id = auth.uid()
  and private.is_registered_user()
);

drop policy if exists "creators can delete their games" on public.games;
create policy "registered creators can delete their games"
on public.games for delete
to authenticated
using (
  creator_id = auth.uid()
  and private.is_registered_user()
);

drop policy if exists "creators can insert cards" on public.game_cards;
create policy "registered creators can insert cards"
on public.game_cards for insert
to authenticated
with check (
  private.is_registered_user()
  and exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
);

drop policy if exists "creators can update cards" on public.game_cards;
create policy "registered creators can update cards"
on public.game_cards for update
to authenticated
using (
  private.is_registered_user()
  and exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
)
with check (
  private.is_registered_user()
  and exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
);

drop policy if exists "creators can delete cards" on public.game_cards;
create policy "registered creators can delete cards"
on public.game_cards for delete
to authenticated
using (
  private.is_registered_user()
  and exists (
    select 1 from public.games
    where games.id = game_cards.game_id
      and games.creator_id = auth.uid()
  )
);

drop policy if exists "users can save games" on public.saved_games;
create policy "registered users can save games"
on public.saved_games for insert
to authenticated
with check (
  user_id = auth.uid()
  and private.is_registered_user()
);

drop policy if exists "users can remove saved games" on public.saved_games;
create policy "registered users can remove saved games"
on public.saved_games for delete
to authenticated
using (
  user_id = auth.uid()
  and private.is_registered_user()
);
