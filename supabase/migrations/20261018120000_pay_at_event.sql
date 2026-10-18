-- Paid events are joined in the app and paid for at the event (in person or
-- by transfer to the host), so join_event() no longer refuses them. The price
-- is shown for information only. Online payment can bring a check back later.

create or replace function public.join_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_event public.events%rowtype;
  v_attending integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  -- Locks the event row so two people can't both take the last place.
  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception 'event_not_found' using errcode = 'P0001';
  end if;

  -- Already in: nothing to do.
  if v_event.host_id = v_user_id or exists (
    select 1 from public.event_attendees
    where event_id = p_event_id and user_id = v_user_id
  ) then
    return;
  end if;

  if v_event.starts_at <= now() then
    raise exception 'event_started' using errcode = 'P0001';
  end if;

  select count(*) into v_attending
  from public.event_attendees where event_id = p_event_id;
  if v_attending >= v_event.capacity then
    raise exception 'event_full' using errcode = 'P0001';
  end if;

  insert into public.event_attendees (event_id, user_id) values (p_event_id, v_user_id);
end;
$$;
