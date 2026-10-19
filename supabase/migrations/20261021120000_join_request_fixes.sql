-- Fixes to join requests (20261020120000_join_requests.sql):
--
--   * Hosts can't accept anyone once the event has started — join_event()
--     already refuses then, and an accepted person would get into the chat.
--   * Hosts can still accept someone they declined, so a mis-tapped Decline
--     can be undone. Members who were declined still can't ask again.
--   * Asking twice at the same moment is harmless instead of failing on the
--     primary key.

create or replace function public.join_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_event public.events%rowtype;
  v_request_status text;
  v_attending integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_event from public.events where id = p_event_id;
  if not found or v_event.status <> 'approved' then
    raise exception 'event_not_found' using errcode = 'P0001';
  end if;

  -- Already in: nothing to do.
  if v_event.host_id = v_user_id or exists (
    select 1 from public.event_attendees
    where event_id = p_event_id and user_id = v_user_id
  ) then
    return;
  end if;

  select r.status into v_request_status
  from public.event_join_requests r
  where r.event_id = p_event_id and r.user_id = v_user_id;
  if v_request_status = 'pending' then
    return;
  elsif v_request_status = 'declined' then
    raise exception 'request_declined' using errcode = 'P0001';
  end if;

  if v_event.starts_at <= now() then
    raise exception 'event_started' using errcode = 'P0001';
  end if;

  select count(*) into v_attending
  from public.event_attendees where event_id = p_event_id;
  if v_attending >= v_event.capacity then
    raise exception 'event_full' using errcode = 'P0001';
  end if;

  -- A request made at the same moment (another tab, a retry) already counts.
  insert into public.event_join_requests (event_id, user_id)
  values (p_event_id, v_user_id)
  on conflict (event_id, user_id) do nothing;
end;
$$;

create or replace function public.respond_to_join_request(
  p_event_id uuid,
  p_user_id uuid,
  p_accept boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_attending integer;
begin
  -- Locks the event row so two acceptances can't both take the last place.
  select * into v_event from public.events where id = p_event_id for update;
  if not found or v_event.host_id is distinct from auth.uid() then
    raise exception 'not_allowed' using errcode = 'P0001';
  end if;

  -- Pending requests can be answered either way; declined ones can still be
  -- accepted, to undo a mistake.
  if not exists (
    select 1 from public.event_join_requests
    where event_id = p_event_id
      and user_id = p_user_id
      and (status = 'pending' or (p_accept and status = 'declined'))
  ) then
    raise exception 'request_not_found' using errcode = 'P0001';
  end if;

  if not p_accept then
    update public.event_join_requests
    set status = 'declined', decided_at = now()
    where event_id = p_event_id and user_id = p_user_id;
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

  insert into public.event_attendees (event_id, user_id) values (p_event_id, p_user_id);
  delete from public.event_join_requests where event_id = p_event_id and user_id = p_user_id;
end;
$$;
