-- Hosts can edit their event's date/time, location and description.
--
-- update_event() only touches those fields, and only for the host's own
-- pending or approved event that hasn't ended. Translations of changed text
-- are cleared (the app falls back to English) so a stale Chinese version
-- never describes the new details.

create function public.update_event(
  p_event_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_location_name text,
  p_location_area text,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_location_name text := trim(p_location_name);
  v_location_area text := trim(p_location_area);
  v_description text := trim(p_description);
begin
  select * into v_event from public.events where id = p_event_id for update;
  if not found or v_event.host_id is distinct from auth.uid() then
    raise exception 'not_allowed' using errcode = 'P0001';
  end if;

  if v_event.status not in ('pending', 'approved') then
    raise exception 'event_not_found' using errcode = 'P0001';
  end if;

  if coalesce(v_event.ends_at, v_event.starts_at) <= now() then
    raise exception 'event_ended' using errcode = 'P0001';
  end if;

  if p_starts_at is null or p_starts_at <= now() then
    raise exception 'event_in_past' using errcode = 'P0001';
  end if;

  if v_location_name is null or char_length(v_location_name) not between 1 and 100
    or v_location_area is null or char_length(v_location_area) not between 1 and 60
    or v_description is null or char_length(v_description) not between 1 and 2000
    or p_starts_at > now() + interval '1 year'
    or (p_ends_at is not null
        and (p_ends_at <= p_starts_at or p_ends_at > p_starts_at + interval '2 days'))
  then
    raise exception 'invalid_event' using errcode = 'P0001';
  end if;

  update public.events
  set starts_at = p_starts_at,
      ends_at = p_ends_at,
      location_name = jsonb_build_object(
        'en', v_location_name,
        'zh', case when location_name ->> 'en' = v_location_name then location_name ->> 'zh' else '' end
      ),
      location_area = jsonb_build_object(
        'en', v_location_area,
        'zh', case when location_area ->> 'en' = v_location_area then location_area ->> 'zh' else '' end
      ),
      description = jsonb_build_object(
        'en', v_description,
        'zh', case when description ->> 'en' = v_description then description ->> 'zh' else '' end
      )
  where id = p_event_id;
end;
$$;

revoke execute on function
  public.update_event(uuid, timestamptz, timestamptz, text, text, text)
from public, anon;
grant execute on function
  public.update_event(uuid, timestamptz, timestamptz, text, text, text)
to authenticated;
