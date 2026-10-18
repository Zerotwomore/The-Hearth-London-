-- Access rules.
--
-- Two layers, both default-deny:
--   1. Table/column grants decide WHAT a role may touch at all. Columns such
--      as profiles.verified are simply not updatable by app users, whatever
--      the row rules say.
--   2. Row level security policies decide WHICH rows.
--
-- The browser holds the public (anon) key, so everything below assumes the
-- caller is hostile. Staff tools and webhooks use the service role, which
-- bypasses both layers and must never reach the browser.

-- ---------------------------------------------------------------------------
-- Membership helpers
--
-- SECURITY DEFINER so policies can consult other tables without recursing
-- into their policies. Each one only ever answers a yes/no question about
-- the caller (auth.uid()), so it leaks nothing a caller couldn't see.
-- ---------------------------------------------------------------------------

create function public.is_event_member(p_event_id uuid)
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
    or exists (
      select 1 from public.event_attendees a
      where a.event_id = p_event_id and a.user_id = auth.uid()
    )
$$;

-- An event's group chat stays writable for a week after the event.
create function public.event_chat_closes_at(p_starts_at timestamptz, p_ends_at timestamptz)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select coalesce(p_ends_at, p_starts_at) + interval '7 days'
$$;

create function public.can_access_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id
      and c.kind = 'event'
      and public.is_event_member(c.event_id)
  )
$$;

create function public.chat_is_open(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    join public.events e on e.id = c.event_id
    where c.id = p_conversation_id
      and public.event_chat_closes_at(e.starts_at, e.ends_at) > now()
  )
$$;

-- True when the caller and p_user_id host or attend at least one common event.
create function public.shares_event_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select e.id as event_id from public.events e where e.host_id = auth.uid()
    union
    select a.event_id from public.event_attendees a where a.user_id = auth.uid()
  ),
  theirs as (
    select e.id as event_id from public.events e where e.host_id = p_user_id
    union
    select a.event_id from public.event_attendees a where a.user_id = p_user_id
  )
  select exists (select 1 from mine join theirs using (event_id))
$$;

create function public.is_club_member(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.club_members m
    where m.club_id = p_club_id and m.user_id = auth.uid()
  )
$$;

create function public.is_club_admin(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.club_members m
    where m.club_id = p_club_id and m.user_id = auth.uid() and m.role = 'admin'
  )
$$;

-- Casts storage folder names; returns null instead of erroring on junk.
create function public.try_uuid(value text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then value::uuid
  end
$$;

-- Supabase grants EXECUTE on new functions to anon and authenticated by
-- default. Policies run as the caller, so signed-in users need these — but
-- signed-out visitors don't.
revoke execute on function
  public.is_event_member(uuid),
  public.can_access_conversation(uuid),
  public.chat_is_open(uuid),
  public.shares_event_with(uuid),
  public.is_club_member(uuid),
  public.is_club_admin(uuid)
from public, anon;

grant execute on function
  public.is_event_member(uuid),
  public.can_access_conversation(uuid),
  public.chat_is_open(uuid),
  public.shares_event_with(uuid),
  public.is_club_member(uuid),
  public.is_club_admin(uuid)
to authenticated;

-- ---------------------------------------------------------------------------
-- Grants: start from nothing, then allow exactly what the app needs.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;

-- Public catalogue: readable signed out, so shared event links can be previewed.
grant select on public.interests, public.event_categories, public.events, public.clubs
  to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, name_zh, avatar_path, bio, lang, onboarded_at)
  on public.profiles to authenticated;

grant select, insert, delete on public.profile_interests to authenticated;
grant select, insert, update, delete on public.contact_details to authenticated;

-- Joining goes through join_event(); leaving is a plain delete.
grant select, delete on public.event_attendees to authenticated;

-- role is left out, so it always takes its 'member' default.
grant select, delete on public.club_members to authenticated;
grant insert (club_id, user_id) on public.club_members to authenticated;

-- author_id / sender_id / created_at are left out: they default to the
-- caller and now(), and cannot be forged.
grant select, delete on public.club_posts to authenticated;
grant insert (club_id, body), update (body) on public.club_posts to authenticated;

grant select on public.conversations to authenticated;

grant select, delete on public.messages to authenticated;
grant insert (conversation_id, body, image_path, thumb_path)
  on public.messages to authenticated;

-- Written through mark_conversation_read().
grant select on public.conversation_reads to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.interests enable row level security;
alter table public.event_categories enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_interests enable row level security;
alter table public.contact_details enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.club_posts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reads enable row level security;

-- (select auth.uid()) rather than auth.uid(): Postgres then evaluates it once
-- per query instead of once per row.

-- Catalogue ------------------------------------------------------------------

create policy "Anyone can read interests"
  on public.interests for select to anon, authenticated using (true);

create policy "Anyone can read event categories"
  on public.event_categories for select to anon, authenticated using (true);

create policy "Anyone can read events"
  on public.events for select to anon, authenticated using (true);

create policy "Anyone can read clubs"
  on public.clubs for select to anon, authenticated using (true);

-- Profiles -------------------------------------------------------------------

create policy "Members can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "Members can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Members can read interests of profiles"
  on public.profile_interests for select to authenticated using (true);

create policy "Members can add their own interests"
  on public.profile_interests for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Members can remove their own interests"
  on public.profile_interests for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "WeChat IDs are visible to yourself and people you share an event with"
  on public.contact_details for select to authenticated
  using (user_id = (select auth.uid()) or public.shares_event_with(user_id));

create policy "Members can add their own contact details"
  on public.contact_details for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Members can change their own contact details"
  on public.contact_details for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Members can remove their own contact details"
  on public.contact_details for delete to authenticated
  using (user_id = (select auth.uid()));

-- Events ---------------------------------------------------------------------

create policy "Members can see who is attending"
  on public.event_attendees for select to authenticated using (true);

create policy "Members can leave events"
  on public.event_attendees for delete to authenticated
  using (user_id = (select auth.uid()));

-- Clubs ----------------------------------------------------------------------

create policy "Members can see club membership"
  on public.club_members for select to authenticated using (true);

create policy "Members can join clubs"
  on public.club_members for insert to authenticated
  with check (user_id = (select auth.uid()) and role = 'member');

create policy "Members can leave clubs"
  on public.club_members for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Members can read club posts"
  on public.club_posts for select to authenticated using (true);

create policy "Club members can post"
  on public.club_posts for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_club_member(club_id));

create policy "Authors can edit their posts"
  on public.club_posts for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "Authors and club admins can delete posts"
  on public.club_posts for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_club_admin(club_id));

-- Chat -----------------------------------------------------------------------

create policy "Event host and attendees can see the event chat"
  on public.conversations for select to authenticated
  using (public.can_access_conversation(id));

create policy "Event host and attendees can read messages"
  on public.messages for select to authenticated
  using (public.can_access_conversation(conversation_id));

create policy "Event host and attendees can post while the chat is open"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.can_access_conversation(conversation_id)
    and public.chat_is_open(conversation_id)
    -- Images must be the sender's own uploads for this conversation.
    and (
      image_path is null
      or (
        image_path like conversation_id::text || '/' || (select auth.uid())::text || '/%'
        and thumb_path like conversation_id::text || '/' || (select auth.uid())::text || '/%'
      )
    )
  );

create policy "Senders and the event host can delete messages"
  on public.messages for delete to authenticated
  using (
    sender_id = (select auth.uid())
    or exists (
      select 1
      from public.conversations c
      join public.events e on e.id = c.event_id
      where c.id = conversation_id and e.host_id = (select auth.uid())
    )
  );

create policy "Members can read their own read markers"
  on public.conversation_reads for select to authenticated
  using (user_id = (select auth.uid()));
