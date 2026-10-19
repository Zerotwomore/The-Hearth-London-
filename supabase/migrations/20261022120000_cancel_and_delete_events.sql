-- Hosts can cancel or delete their events.
--
--   * cancel_event(): the event is marked 'cancelled'. It disappears from
--     listings and can't be joined, but the host and attendees still see it
--     (labelled cancelled) and its group chat, so the host can explain.
--     Pending join requests are dropped. Cancelled events don't count
--     towards the 20-active-event limit (create_event() only counts pending
--     and approved ones).
--   * delete_event(): the event and everything hanging off it — attendees,
--     requests, the group chat and its messages — are removed for good.
--     Chat photos are files in Storage, which SQL can't delete; the daily
--     chat media cleanup now also removes folders whose chat no longer exists.

alter table public.events
  drop constraint events_status_check,
  add constraint events_status_check
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  add column cancelled_at timestamptz;

drop policy "Members can read approved events, their own, and admins all" on public.events;

create policy "Members can read approved events, their own, cancelled ones they attended, and admins all"
  on public.events for select to authenticated
  using (
    status = 'approved'
    or host_id = (select auth.uid())
    or (status = 'cancelled' and public.is_event_member(id))
    or (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- cancel_event / delete_event
-- ---------------------------------------------------------------------------

create function public.cancel_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
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

  update public.events
  set status = 'cancelled', cancelled_at = now()
  where id = p_event_id;

  delete from public.event_join_requests where event_id = p_event_id;
end;
$$;

create function public.delete_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Attendees, requests, the chat, its messages and read markers cascade.
  delete from public.events where id = p_event_id and host_id = auth.uid();
  if not found then
    raise exception 'not_allowed' using errcode = 'P0001';
  end if;
end;
$$;

revoke execute on function public.cancel_event(uuid), public.delete_event(uuid) from public, anon;
grant execute on function public.cancel_event(uuid), public.delete_event(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Cancelled events can't take new attendees.
-- ---------------------------------------------------------------------------

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

  if v_event.status <> 'approved' then
    raise exception 'event_not_found' using errcode = 'P0001';
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

-- ---------------------------------------------------------------------------
-- Cancelled events keep their chat in the chat tab.
-- ---------------------------------------------------------------------------

create or replace function public.my_conversations()
returns table (
  conversation_id uuid,
  event_id uuid,
  title jsonb,
  poster_url text,
  starts_at timestamptz,
  is_open boolean,
  last_message_at timestamptz,
  last_message_body text,
  last_message_has_image boolean,
  last_sender_id uuid,
  unread_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with my_events as (
    select e.id from public.events e where e.host_id = auth.uid()
    union
    select a.event_id from public.event_attendees a where a.user_id = auth.uid()
  )
  select
    c.id,
    e.id,
    e.title,
    e.poster_url,
    e.starts_at,
    public.event_chat_closes_at(e.starts_at, e.ends_at) > now(),
    last_message.created_at,
    last_message.body,
    last_message.image_path is not null,
    last_message.sender_id,
    (
      select count(*)::integer from (
        select 1 from public.messages m
        where m.conversation_id = c.id
          and m.created_at > coalesce(r.last_read_at, '-infinity')
          and m.sender_id is distinct from auth.uid()
        limit 100
      ) unread
    )
  from my_events
  join public.events e on e.id = my_events.id and e.status in ('approved', 'cancelled')
  join public.conversations c on c.event_id = e.id
  left join public.conversation_reads r
    on r.conversation_id = c.id and r.user_id = auth.uid()
  left join lateral (
    select m.created_at, m.body, m.image_path, m.sender_id
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) last_message on true
  order by coalesce(last_message.created_at, c.created_at) desc
$$;

-- ---------------------------------------------------------------------------
-- Chat media cleanup: also pick up files left behind by deleted events.
-- ---------------------------------------------------------------------------

create or replace function public.chat_media_due_for_cleanup(p_limit integer default 50)
returns table (conversation_id uuid, paths text[])
language sql
stable
security definer
set search_path = ''
as $$
  select due.conversation_id, due.paths
  from (
    -- Chats of events that ended more than 30 days ago.
    select c.id as conversation_id, array_agg(o.name order by o.name) as paths
    from public.conversations c
    join public.events e on e.id = c.event_id
    join storage.objects o
      on o.bucket_id = 'chat-media'
     and o.name like c.id::text || '/%'
    where coalesce(e.ends_at, e.starts_at) + interval '30 days' < now()
    group by c.id

    union all

    -- Folders whose chat was deleted along with its event.
    select public.try_uuid(split_part(o.name, '/', 1)), array_agg(o.name order by o.name)
    from storage.objects o
    where o.bucket_id = 'chat-media'
      and not exists (
        select 1 from public.conversations c
        where c.id::text = split_part(o.name, '/', 1)
      )
    group by split_part(o.name, '/', 1)
  ) due
  order by due.conversation_id
  limit p_limit
$$;
