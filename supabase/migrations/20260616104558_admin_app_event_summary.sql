create or replace function private.get_app_event_summary(
  p_since timestamptz default now() - interval '14 days'
)
returns table (
  event_type text,
  actor_kind text,
  event_count integer,
  latest_event_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can view app event summaries';
  end if;

  return query
    select
      private.app_events.event_type,
      private.app_events.actor_kind,
      count(*)::integer as event_count,
      max(private.app_events.created_at) as latest_event_at
    from private.app_events
    where private.app_events.created_at >= coalesce(
      p_since,
      now() - interval '14 days'
    )
    group by private.app_events.event_type, private.app_events.actor_kind
    order by event_count desc, private.app_events.event_type asc;
end;
$$;

create or replace function public.get_app_event_summary(
  p_since timestamptz default now() - interval '14 days'
)
returns table (
  event_type text,
  actor_kind text,
  event_count integer,
  latest_event_at timestamptz
)
language sql
set search_path = ''
as $$
  select *
  from private.get_app_event_summary(p_since);
$$;

revoke execute on function public.get_app_event_summary(timestamptz) from public, anon;
grant execute on function private.get_app_event_summary(timestamptz) to authenticated;
grant execute on function public.get_app_event_summary(timestamptz) to authenticated;
