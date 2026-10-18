-- Core tables for The Hearth.
--
-- Conventions
--   * Content written by staff in both languages (event titles, club
--     descriptions, …) is stored as jsonb {"en": "...", "zh": "..."}, matching
--     the frontend's LocalizedText type, and validated by is_localized().
--   * Content written by members (bios, posts, chat messages) is a plain text
--     column in whatever language they wrote it — it is never translated.
--   * Money is stored as integer pence.
--   * Access rules live in 20260923120100_security.sql; every table here has
--     row level security switched on there.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.is_localized(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(value) = 'object'
     and jsonb_typeof(value -> 'en') = 'string'
     and length(value ->> 'en') > 0
     and jsonb_typeof(value -> 'zh') = 'string'
$$;

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

create table public.interests (
  id text primary key,
  label jsonb not null check (public.is_localized(label)),
  sort smallint not null default 0
);

create table public.event_categories (
  id text primary key,
  label jsonb not null check (public.is_localized(label)),
  sort smallint not null default 0
);

insert into public.interests (id, label, sort) values
  ('art-culture',       '{"en": "Art & Galleries",   "zh": "艺术与展览"}', 1),
  ('reading',           '{"en": "Reading Group",     "zh": "读书会"}',     2),
  ('food-drink',        '{"en": "Food & Drink",      "zh": "美食与酒"}',   3),
  ('hiking',            '{"en": "Walks & Hikes",     "zh": "徒步散步"}',   4),
  ('board-games',       '{"en": "Board Games",       "zh": "桌游"}',       5),
  ('live-music',        '{"en": "Live Music",        "zh": "现场音乐"}',   6),
  ('language-exchange', '{"en": "Language Exchange", "zh": "语言交换"}',   7),
  ('photography',       '{"en": "Photography",       "zh": "摄影"}',       8),
  ('cycling',           '{"en": "Cycling",           "zh": "骑行"}',       9),
  ('wine-tasting',      '{"en": "Wine Tasting",      "zh": "品酒"}',       10),
  ('running',           '{"en": "Running",           "zh": "跑步"}',       11),
  ('pub-quiz',          '{"en": "Pub Quiz",          "zh": "酒吧问答"}',   12);

insert into public.event_categories (id, label, sort) values
  ('art-culture', '{"en": "Art & Culture", "zh": "艺术文化"}', 1),
  ('reading',     '{"en": "Reading",       "zh": "读书会"}',   2),
  ('dinner',      '{"en": "Dinner",        "zh": "晚餐"}',     3),
  ('outdoors',    '{"en": "Outdoors",      "zh": "户外"}',     4),
  ('bar',         '{"en": "Bar",           "zh": "酒吧"}',     5),
  ('board-games', '{"en": "Board Games",   "zh": "桌游"}',     6),
  ('live-event',  '{"en": "Live",          "zh": "现场"}',     7);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  name_zh text check (char_length(name_zh) <= 60),
  -- Path inside the public "avatars" bucket, always under the owner's folder.
  avatar_path text check (avatar_path is null or avatar_path like id::text || '/%'),
  bio text check (char_length(bio) <= 500),
  lang text not null default 'en' check (lang in ('en', 'zh')),
  onboarded_at timestamptz,
  -- Set by staff only (see column grants in the security migration).
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profile_interests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  interest_id text not null references public.interests (id) on delete cascade,
  primary key (user_id, interest_id)
);

-- Kept apart from profiles so it can have a stricter read rule: only people
-- who share an event with you can see your WeChat ID.
create table public.contact_details (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  -- WeChat's own rules: 6–20 characters, starting with a letter.
  wechat_id text check (wechat_id ~ '^[A-Za-z][A-Za-z0-9_-]{5,19}$')
);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null check (public.is_localized(title)),
  category_id text not null references public.event_categories (id),
  poster_url text not null,
  gallery_urls text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_name jsonb not null check (public.is_localized(location_name)),
  location_area jsonb not null check (public.is_localized(location_area)),
  -- Hosts must be reassigned before their account can be deleted.
  host_id uuid not null references public.profiles (id) on delete restrict,
  capacity integer not null check (capacity > 0),
  description jsonb not null check (public.is_localized(description)),
  highlights jsonb not null default '[]' check (jsonb_typeof(highlights) = 'array'),
  -- What join_event() charges. 0 = nothing to pay through the app.
  price_pence integer not null default 0 check (price_pence >= 0),
  -- Optional display text, e.g. "£6 table fee" or "Pay your own way". When
  -- null, the app formats the pence amount.
  price_label jsonb check (price_label is null or public.is_localized(price_label)),
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index events_starts_at_idx on public.events (starts_at);
create index events_host_id_idx on public.events (host_id);

-- The host is not listed here; is_event_member() counts them separately.
create table public.event_attendees (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index event_attendees_user_id_idx on public.event_attendees (user_id);

-- ---------------------------------------------------------------------------
-- Clubs
-- ---------------------------------------------------------------------------

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null check (public.is_localized(name)),
  category jsonb not null check (public.is_localized(category)),
  image_url text not null,
  description jsonb not null check (public.is_localized(description)),
  created_at timestamptz not null default now()
);

create table public.club_members (
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create index club_members_user_id_idx on public.club_members (user_id);

create table public.club_posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  author_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index club_posts_club_id_created_at_idx on public.club_posts (club_id, created_at desc);
create index club_posts_author_id_idx on public.club_posts (author_id);

-- ---------------------------------------------------------------------------
-- Chat
--
-- Only event group chats for now. `kind` leaves room for direct messages
-- later without reshaping messages or reads.
-- ---------------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'event' check (kind in ('event')),
  event_id uuid unique references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((kind = 'event') = (event_id is not null))
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  -- Kept (as null) when the sender deletes their account, so threads stay readable.
  sender_id uuid default auth.uid() references public.profiles (id) on delete set null,
  body text check (char_length(body) <= 2000),
  -- Paths inside the private "chat-media" bucket:
  -- <conversation_id>/<sender_id>/<file>. The thumbnail is shown in the
  -- thread; the full image loads on tap.
  image_path text,
  thumb_path text,
  -- Set when the cleanup job has deleted the files; the UI shows "expired".
  image_expired_at timestamptz,
  created_at timestamptz not null default now(),
  -- coalesce: a null body would otherwise make this check pass.
  check (coalesce(char_length(trim(body)), 0) > 0 or image_path is not null),
  check ((image_path is null) = (thumb_path is null))
);

create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at desc);
-- Serves the per-sender rate limits.
create index messages_sender_id_created_at_idx on public.messages (sender_id, created_at desc);

create table public.conversation_reads (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index conversation_reads_user_id_idx on public.conversation_reads (user_id);
