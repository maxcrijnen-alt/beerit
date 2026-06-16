create table if not exists public.game_topics (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  is_spicy boolean not null default false,
  is_default boolean not null default false,
  is_hidden boolean not null default false,
  sort_order integer not null default 0,
  created_by_session_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, slug),
  unique (game_id, id),
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  check (char_length(title) between 2 and 40),
  check (description is null or char_length(description) <= 240),
  check (sort_order >= 0)
);

create table if not exists public.game_card_topics (
  game_card_id uuid not null references public.game_cards(id) on delete cascade,
  topic_id uuid not null references public.game_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (game_card_id, topic_id)
);

create index if not exists game_topics_game_sort_idx
  on public.game_topics (game_id, is_hidden, sort_order, title);
create index if not exists game_topics_spicy_idx
  on public.game_topics (game_id, is_spicy)
  where not is_hidden;
create index if not exists game_card_topics_topic_idx
  on public.game_card_topics (topic_id);

alter table public.game_topics enable row level security;
alter table public.game_card_topics enable row level security;

revoke all on public.game_topics, public.game_card_topics from public, anon, authenticated;
grant select on public.game_topics, public.game_card_topics to anon, authenticated;
grant select, insert, update, delete on public.game_topics, public.game_card_topics to service_role;

drop policy if exists "topics of discoverable games are readable"
on public.game_topics;
create policy "topics of discoverable games are readable"
on public.game_topics for select
to anon, authenticated
using (
  not is_hidden
  and exists (
    select 1
    from public.games
    where games.id = game_topics.game_id
      and games.visibility in ('PUBLIC', 'UNLISTED')
      and not games.is_hidden
  )
);

drop policy if exists "creators can read their private game topics"
on public.game_topics;
create policy "creators can read their private game topics"
on public.game_topics for select
to authenticated
using (
  exists (
    select 1
    from public.games
    where games.id = game_topics.game_id
      and games.creator_id = (select auth.uid())
      and not games.is_hidden
  )
);

drop policy if exists "topics on readable cards are readable"
on public.game_card_topics;
create policy "topics on readable cards are readable"
on public.game_card_topics for select
to anon, authenticated
using (
  exists (
    select 1
    from public.game_cards
    join public.games on games.id = game_cards.game_id
    where game_cards.id = game_card_topics.game_card_id
      and not game_cards.is_hidden
      and not games.is_hidden
      and (
        games.visibility in ('PUBLIC', 'UNLISTED')
        or games.creator_id = (select auth.uid())
      )
  )
);

create or replace function private.touch_game_topic_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_game_topic_updated_at on public.game_topics;
create trigger touch_game_topic_updated_at
before update on public.game_topics
for each row execute function private.touch_game_topic_updated_at();

create or replace function private.normalize_game_topic_slug(p_title text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(
    both '-' from regexp_replace(
      regexp_replace(lower(trim(coalesce(p_title, ''))), '[^a-z0-9]+', '-', 'g'),
      '-+',
      '-',
      'g'
    )
  );
$$;

create or replace function private.create_game_topic(
  p_game_id uuid,
  p_title text,
  p_description text default null,
  p_is_spicy boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_session_id uuid := auth.uid();
  actor_topic_count integer;
  game_topic_count integer;
  new_topic_id uuid;
  normalized_description text := nullif(trim(coalesce(p_description, '')), '');
  normalized_slug text := private.normalize_game_topic_slug(p_title);
  normalized_title text := trim(coalesce(p_title, ''));
begin
  if actor_session_id is null then
    raise exception 'Sign in or start guest mode before adding a topic';
  end if;

  if char_length(normalized_title) < 2 or char_length(normalized_title) > 40 then
    raise exception 'Topic title must contain between 2 and 40 characters';
  end if;

  if normalized_slug = '' or char_length(normalized_slug) > 48 then
    raise exception 'Topic title must create a valid topic label';
  end if;

  if normalized_description is not null and char_length(normalized_description) > 240 then
    raise exception 'Topic description must be 240 characters or fewer';
  end if;

  perform 1
  from public.games
  where id = p_game_id
    and not is_hidden
    and (
      visibility in ('PUBLIC', 'UNLISTED')
      or creator_id = actor_session_id
    );

  if not found then
    raise exception 'Game is not available for topics';
  end if;

  select id
  into new_topic_id
  from public.game_topics
  where game_id = p_game_id
    and slug = normalized_slug
    and not is_hidden;

  if new_topic_id is not null then
    return new_topic_id;
  end if;

  select
    count(*) filter (where created_by_session_user_id = actor_session_id),
    count(*)
  into actor_topic_count, game_topic_count
  from public.game_topics
  where game_id = p_game_id
    and not is_hidden;

  if actor_topic_count >= 20 then
    raise exception 'You added the maximum number of topics for this game';
  end if;

  if game_topic_count >= 80 then
    raise exception 'This game reached the maximum number of topics';
  end if;

  insert into public.game_topics (
    game_id,
    slug,
    title,
    description,
    is_spicy,
    sort_order,
    created_by_session_user_id
  )
  values (
    p_game_id,
    normalized_slug,
    normalized_title,
    normalized_description,
    coalesce(p_is_spicy, false),
    game_topic_count + 1,
    actor_session_id
  )
  returning id into new_topic_id;

  return new_topic_id;
exception
  when unique_violation then
    select id
    into new_topic_id
    from public.game_topics
    where game_id = p_game_id
      and slug = normalized_slug
      and not is_hidden;

    if new_topic_id is null then
      raise;
    end if;

    return new_topic_id;
end;
$$;

create or replace function private.submit_community_game_card_with_topic(
  p_game_id uuid,
  p_text text,
  p_intensity text,
  p_topic_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_card_id uuid;
begin
  if p_topic_id is not null and not exists (
    select 1
    from public.game_topics
    where id = p_topic_id
      and game_id = p_game_id
      and not is_hidden
  ) then
    raise exception 'Topic is not available for this game';
  end if;

  new_card_id := private.submit_community_game_card(
    p_game_id,
    p_text,
    p_intensity
  );

  if p_topic_id is not null then
    insert into public.game_card_topics (game_card_id, topic_id)
    values (new_card_id, p_topic_id)
    on conflict do nothing;
  end if;

  return new_card_id;
end;
$$;

create or replace function public.create_game_topic(
  p_game_id uuid,
  p_title text,
  p_description text default null,
  p_is_spicy boolean default false
)
returns uuid
language sql
set search_path = ''
as $$
  select private.create_game_topic(
    p_game_id,
    p_title,
    p_description,
    p_is_spicy
  );
$$;

create or replace function public.submit_community_game_card_with_topic(
  p_game_id uuid,
  p_text text,
  p_intensity text,
  p_topic_id uuid default null
)
returns uuid
language sql
set search_path = ''
as $$
  select private.submit_community_game_card_with_topic(
    p_game_id,
    p_text,
    p_intensity,
    p_topic_id
  );
$$;

revoke execute on function public.create_game_topic(uuid, text, text, boolean) from public, anon;
revoke execute on function public.submit_community_game_card_with_topic(uuid, text, text, uuid) from public, anon;

grant execute on function private.create_game_topic(uuid, text, text, boolean) to authenticated;
grant execute on function private.submit_community_game_card_with_topic(uuid, text, text, uuid) to authenticated;
grant execute on function public.create_game_topic(uuid, text, text, boolean) to authenticated;
grant execute on function public.submit_community_game_card_with_topic(uuid, text, text, uuid) to authenticated;

insert into public.game_topics (
  id,
  game_id,
  slug,
  title,
  description,
  is_spicy,
  is_default,
  sort_order
)
values
  (
    '70000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'truths',
    'Truths',
    'Personal questions that keep the group talking.',
    false,
    true,
    1
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'dares',
    'Dares',
    'Small actions and table dares with fictional Beerits.',
    false,
    true,
    2
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'spicy',
    'Spicy',
    'Opt-in personal prompts for adult groups.',
    true,
    true,
    3
  ),
  (
    '70000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    'student-life',
    'Student Life',
    'Campus, housemate, and night-out confession prompts.',
    false,
    true,
    1
  ),
  (
    '70000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000002',
    'spicy',
    'Spicy',
    'Opt-in confession prompts for adult groups.',
    true,
    true,
    2
  ),
  (
    '70000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000003',
    'chaos',
    'Chaos',
    'Fast votes for the friend most likely to cause a plot twist.',
    false,
    true,
    1
  ),
  (
    '70000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000004',
    'choices',
    'Choices',
    'Split-the-room choices and quick debates.',
    false,
    true,
    1
  ),
  (
    '70000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000005',
    'group-challenges',
    'Group Challenges',
    'Low-pressure challenges for the whole group.',
    false,
    true,
    1
  ),
  (
    '70000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000006',
    'physical-games',
    'Physical Games',
    'Board, card, and dice activities your group can play offline.',
    false,
    true,
    1
  ),
  (
    '70000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000090',
    'quick-categories',
    'Quick Categories',
    'Fast bomb-mode prompts with a random timer.',
    false,
    true,
    1
  )
on conflict (game_id, slug) do update
set
  title = excluded.title,
  description = excluded.description,
  is_spicy = excluded.is_spicy,
  is_default = excluded.is_default,
  sort_order = excluded.sort_order,
  is_hidden = false;

insert into public.game_card_topics (game_card_id, topic_id)
select game_cards.id, game_topics.id
from public.game_cards
join public.game_topics on game_topics.game_id = game_cards.game_id
where game_cards.game_id in (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000090'
  )
  and game_topics.slug = case
    when game_cards.game_id = '10000000-0000-4000-8000-000000000001'
      and game_cards.intensity = 'Spicy' then 'spicy'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000001'
      and game_cards.card_type = 'DARE' then 'dares'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000001' then 'truths'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000002'
      and game_cards.intensity = 'Spicy' then 'spicy'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000002' then 'student-life'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000003' then 'chaos'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000004' then 'choices'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000005' then 'group-challenges'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000006' then 'physical-games'
    when game_cards.game_id = '10000000-0000-4000-8000-000000000090' then 'quick-categories'
  end
on conflict do nothing;
