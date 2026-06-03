alter table public.games
add column if not exists concept text
check (concept is null or char_length(btrim(concept)) between 1 and 120);

comment on column public.games.concept is
  'Optional creator-defined concept or theme. Free-form discovery metadata only.';

grant insert (concept), update (concept) on public.games to authenticated;
