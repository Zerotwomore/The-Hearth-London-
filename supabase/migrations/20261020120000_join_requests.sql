-- Hosts approve who comes to their events.
--
--   * join_event() no longer adds the caller as an attendee: it records a
--     request in event_join_requests for the host to answer. (The name is
--     kept so the deployed app keeps working; it now goes through approval.)
--   * The host accepts or declines with respond_to_join_request(). Accepting
--     moves the person into event_attendees, so attendee lists, chat access
--     and capacity work exactly as before. Declining keeps the row, and that
--     person can't ask again.
--   * Pending requests don't hold a place: capacity is checked on request and
--     again on acceptance.
--   * Members can withdraw a pending request (a plain delete).

create table public.event_join_requests (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'declined')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  primary key (event_id, user_id)
);

create index event_join_requests_user_id_idx on public.event_join_requests (user_id);
create index event_join_requests_pending_idx
  on public.event_join_requests (event_id, requested_at) where status = 'pending';

alter table public.event_join_requests enable row level security;

-- Requests are made through join_event() and answered through
-- respond_to_join_request(); withdrawing is a plain delete.
grant select, delete on public.event_join_requests to authenticated;

create function public.is_event_host(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.events e
    where e.id = p_event_id and e.host_id = auth.uid()
  )
$$;

revoke execute on function public.is_event_host(uuid) from public, anon;
grant execute on function public.is_event_host(uuid) to authenticated;

create policy "Members see their own requests; hosts see requests for their events"
  on public.event_join_requests for select to authenticated
  using (user_id = (select auth.uid()) or public.is_event_host(event_id));

create policy "Members can withdraw their pending requests"
  on public.event_join_requests for delete to authenticated
  using (user_id = (select auth.uid()) and status = 'pending');

-- ---------------------------------------------------------------------------
-- join_event: ask the host for a place.
-- ---------------------------------------------------------------------------

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

  insert into public.event_join_requests (event_id, user_id) values (p_event_id, v_user_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- respond_to_join_request: the host accepts or declines.
-- ---------------------------------------------------------------------------

create function public.respond_to_join_request(
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

  if not exists (
    select 1 from public.event_join_requests
    where event_id = p_event_id and user_id = p_user_id and status = 'pending'
  ) then
    raise exception 'request_not_found' using errcode = 'P0001';
  end if;

  if not p_accept then
    update public.event_join_requests
    set status = 'declined', decided_at = now()
    where event_id = p_event_id and user_id = p_user_id;
    return;
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

revoke execute on function public.respond_to_join_request(uuid, uuid, boolean) from public, anon;
grant execute on function public.respond_to_join_request(uuid, uuid, boolean) to authenticated;
