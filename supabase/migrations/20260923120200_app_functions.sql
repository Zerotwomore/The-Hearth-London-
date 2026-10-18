-- Triggers and the RPC functions the app calls.
--
-- Errors raised for the app to show use SQLSTATE P0001 with a stable
-- snake_case message (e.g. 'event_full'); the frontend maps those to text.

-- ---------------------------------------------------------------------------
-- New accounts get a profile
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        ''
      ),
      60
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Every event gets a group chat
-- ---------------------------------------------------------------------------

create function public.create_event_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.conversations (kind, event_id) values ('event', new.id);
  return new;
end;
$$;

create trigger on_event_created
  after insert on public.events
  for each row execute function public.create_event_conversation();

-- ---------------------------------------------------------------------------
-- Message rate limits
--
-- SECURITY DEFINER so the counts include messages in chats the sender can no
-- longer see (e.g. after leaving an event).
-- ---------------------------------------------------------------------------

create function public.enforce_message_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Staff tools and seeds run without a signed-in user and are not limited.
  if auth.uid() is null then
    return new;
  end if;

  if (
    select count(*) from public.messages m
    where m.sender_id = new.sender_id
      and m.created_at > now() - interval '1 minute'
  ) >= 20 then
    raise exception 'rate_limited'
      using errcode = 'P0001', hint = 'At most 20 messages a minute.';
  end if;

  if new.image_path is not null and (
    select count(*) from public.messages m
    where m.sender_id = new.sender_id
      and m.image_path is not null
      and m.created_at > now() - interval '1 day'
  ) >= 20 then
    raise exception 'image_limit_reached'
      using errcode = 'P0001', hint = 'At most 20 images a day.';
  end if;

  return new;
end;
$$;

create trigger enforce_message_limits
  before insert on public.messages
  for each row execute function public.enforce_message_limits();

-- ---------------------------------------------------------------------------
-- join_event: the only way to become an attendee.
--
-- Locks the event row so two people can't both take the last place.
-- Paid events are refused here; they will be joined by the payment webhook
-- once payment succeeds.
-- ---------------------------------------------------------------------------

create function public.join_event(p_event_id uuid)
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

  if v_event.price_pence > 0 then
    raise exception 'payment_required' using errcode = 'P0001';
  end if;

  select count(*) into v_attending
  from public.event_attendees where event_id = p_event_id;
  if v_attending >= v_event.capacity then
    raise exception 'event_full' using errcode = 'P0001';
  end if;

  insert into public.event_attendees (event_id, user_id) values (p_event_id, v_user_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- my_conversations: the chat tab — one row per event chat the caller is in,
-- newest activity first, with an unread count (capped at 100; show "99+").
-- ---------------------------------------------------------------------------

create function public.my_conversations()
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
  join public.events e on e.id = my_events.id
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

create function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_access_conversation(p_conversation_id) then
    raise exception 'conversation_not_found' using errcode = 'P0001';
  end if;

  insert into public.conversation_reads (conversation_id, user_id, last_read_at)
  values (p_conversation_id, auth.uid(), now())
  on conflict (conversation_id, user_id) do update set last_read_at = excluded.last_read_at;
end;
$$;

revoke execute on function
  public.join_event(uuid),
  public.my_conversations(),
  public.mark_conversation_read(uuid)
from public, anon;

grant execute on function
  public.join_event(uuid),
  public.my_conversations(),
  public.mark_conversation_read(uuid)
to authenticated;

-- Trigger functions are never called directly.
revoke execute on function
  public.handle_new_user(),
  public.create_event_conversation(),
  public.enforce_message_limits()
from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: new chat messages are pushed to subscribers. Realtime applies the
-- messages select policy, so people only receive chats they belong to.
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.messages;
