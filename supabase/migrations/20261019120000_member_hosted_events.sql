-- Members can host their own events, which go live once an admin approves them.
--
--   * create_event() is the only way for a member to add an event. Events from
--     members start as 'pending'; events from admins are approved straight away.
--   * A member can have at most 20 active events at once — pending or
--     approved, and not yet ended. Rejected events don't count.
--   * Pending and rejected events are visible only to their host and to admins.
--   * Admins approve or reject through review_event().
--   * Posters are uploaded by the host to event-media/<host_id>/<file>. For
--     these events poster_url holds that storage path rather than a full URL;
--     the app turns it into the public URL (see posterSrc in lib/api/rows.ts).

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------

-- Set by staff only: it is left out of the profiles update grant.
alter table public.profiles add column is_admin boolean not null default false;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  )
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- The first admin. Only a confirmed account counts, so nobody can claim the
-- role by signing up with this address first. More admins can be added in
-- the SQL editor (see supabase/README.md).
update public.profiles
set is_admin = true
where id in (
  select u.id from auth.users u
  where lower(u.email) = '1303710752@qq.com' and u.email_confirmed_at is not null
);

-- ---------------------------------------------------------------------------
-- Event review status
-- ---------------------------------------------------------------------------

-- Existing events were created by staff, so they are already approved.
alter table public.events
  add column status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected')),
  add column submitted_at timestamptz,
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references public.profiles (id) on delete set null,
  -- Shown to the host when an event is rejected.
  add column review_note text check (char_length(review_note) <= 500);

create index events_pending_idx on public.events (submitted_at) where status = 'pending';

drop policy "Anyone can read events" on public.events;

create policy "Anyone can read approved events"
  on public.events for select to anon
  using (status = 'approved');

create policy "Members can read approved events, their own, and admins all"
  on public.events for select to authenticated
  using (
    status = 'approved'
    or host_id = (select auth.uid())
    or (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- join_event: only approved events can be joined.
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
  v_attending integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  -- Locks the event row so two people can't both take the last place.
  select * into v_event from public.events where id = p_event_id for update;
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

-- ---------------------------------------------------------------------------
-- create_event
--
-- Members write in one language, so the text goes in the "en" slot and "zh"
-- is left empty; the app falls back to "en" when "zh" is empty.
-- Validation failures raise 'invalid_event' — the form checks the same rules
-- first, so a member only sees it if they bypass the app.
-- ---------------------------------------------------------------------------

create function public.create_event(
  p_title text,
  p_category_id text,
  p_poster_path text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_location_name text,
  p_location_area text,
  p_capacity integer,
  p_description text,
  p_price_pence integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_admin boolean;
  v_active integer;
  v_title text := trim(p_title);
  v_location_name text := trim(p_location_name);
  v_location_area text := trim(p_location_area);
  v_description text := trim(p_description);
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  -- Locks the host's profile so two submissions at once can't both slip
  -- under the limit.
  select p.is_admin into v_admin from public.profiles p where p.id = v_user_id for update;
  if not found then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select count(*) into v_active
  from public.events e
  where e.host_id = v_user_id
    and e.status in ('pending', 'approved')
    and coalesce(e.ends_at, e.starts_at) > now();
  if v_active >= 20 then
    raise exception 'event_limit_reached'
      using errcode = 'P0001', hint = 'At most 20 active events at once.';
  end if;

  if p_starts_at is null or p_starts_at <= now() then
    raise exception 'event_in_past' using errcode = 'P0001';
  end if;

  if v_title is null or char_length(v_title) not between 1 and 100
    or v_location_name is null or char_length(v_location_name) not between 1 and 100
    or v_location_area is null or char_length(v_location_area) not between 1 and 60
    or v_description is null or char_length(v_description) not between 1 and 2000
    or p_capacity is null or p_capacity not between 1 and 200
    or p_price_pence is null or p_price_pence not between 0 and 100000
    or p_starts_at > now() + interval '1 year'
    or (p_ends_at is not null
        and (p_ends_at <= p_starts_at or p_ends_at > p_starts_at + interval '2 days'))
    or not exists (select 1 from public.event_categories c where c.id = p_category_id)
    -- The poster must be the host's own upload.
    or p_poster_path is null
    or p_poster_path !~ ('^' || v_user_id::text || '/[A-Za-z0-9._-]+$')
    or not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'event-media' and o.name = p_poster_path
    )
  then
    raise exception 'invalid_event' using errcode = 'P0001';
  end if;

  insert into public.events (
    title, category_id, poster_url, starts_at, ends_at,
    location_name, location_area, host_id, capacity, description, price_pence,
    status, submitted_at, reviewed_at, reviewed_by
  ) values (
    jsonb_build_object('en', v_title, 'zh', ''),
    p_category_id,
    p_poster_path,
    p_starts_at,
    p_ends_at,
    jsonb_build_object('en', v_location_name, 'zh', ''),
    jsonb_build_object('en', v_location_area, 'zh', ''),
    v_user_id,
    p_capacity,
    jsonb_build_object('en', v_description, 'zh', ''),
    p_price_pence,
    case when v_admin then 'approved' else 'pending' end,
    now(),
    case when v_admin then now() end,
    case when v_admin then v_user_id end
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- review_event: admins approve or reject a pending event.
-- ---------------------------------------------------------------------------

create function public.review_event(p_event_id uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = 'P0001';
  end if;

  update public.events
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      review_note = nullif(left(trim(p_note), 500), '')
  where id = p_event_id and status = 'pending';

  if not found then
    raise exception 'event_not_found' using errcode = 'P0001';
  end if;
end;
$$;

revoke execute on function
  public.create_event(text, text, text, timestamptz, timestamptz, text, text, integer, text, integer),
  public.review_event(uuid, boolean, text)
from public, anon;

grant execute on function
  public.create_event(text, text, text, timestamptz, timestamptz, text, text, integer, text, integer),
  public.review_event(uuid, boolean, text)
to authenticated;

-- ---------------------------------------------------------------------------
-- Posters: hosts upload to event-media/<their id>/<file>, 20 a day.
-- Staff uploads (service role) are unaffected.
-- ---------------------------------------------------------------------------

create function public.event_media_uploads_today()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from storage.objects o
  where o.bucket_id = 'event-media'
    and o.owner_id = auth.uid()::text
    and o.created_at > now() - interval '1 day'
$$;

revoke execute on function public.event_media_uploads_today() from public, anon;
grant execute on function public.event_media_uploads_today() to authenticated;

create policy "Event media: members can upload posters to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'event-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.event_media_uploads_today() < 20
  );

-- ---------------------------------------------------------------------------
-- my_conversations: chats of events still under review (or rejected) stay
-- out of the chat tab.
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
  join public.events e on e.id = my_events.id and e.status = 'approved'
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
