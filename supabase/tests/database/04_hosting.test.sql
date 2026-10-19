-- Members hosting events: the 20-active-event limit, admin approval, posters.
begin;
create extension if not exists pgtap with schema extensions;
select plan(26);

-- Fixtures ---------------------------------------------------------------------
--   host      hosts events
--   admin     reviews them
--   outsider  just browses

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'host@test.local', '{"name": "Host"}'),
  ('55555555-5555-5555-5555-555555555555', 'admin@test.local', '{"name": "Admin"}'),
  ('44444444-4444-4444-4444-444444444444', 'outsider@test.local', '{}');

update public.profiles set is_admin = true where id = '55555555-5555-5555-5555-555555555555';

insert into storage.objects (bucket_id, name, owner_id) values
  ('event-media', '11111111-1111-1111-1111-111111111111/poster.webp', '11111111-1111-1111-1111-111111111111'),
  ('event-media', '55555555-5555-5555-5555-555555555555/poster.webp', '55555555-5555-5555-5555-555555555555');

-- 18 upcoming and 3 finished events already hosted by host.
insert into public.events
  (title, category_id, poster_url, starts_at, location_name, location_area,
   host_id, capacity, description, status)
select '{"en": "Old", "zh": ""}', 'bar', 'x',
       now() + (case when n <= 18 then interval '5 days' else interval '-5 days' end),
       '{"en": "A", "zh": ""}', '{"en": "A", "zh": ""}',
       '11111111-1111-1111-1111-111111111111', 10, '{"en": "d", "zh": ""}', 'approved'
from generate_series(1, 21) n;

-- A tiny wrapper so each test only names what it changes.
create function pg_temp.host_event(
  p_poster text default '11111111-1111-1111-1111-111111111111/poster.webp',
  p_starts_at timestamptz default now() + interval '3 days',
  p_capacity integer default 8
) returns uuid language sql as $$
  select public.create_event(
    'Supper club', 'dinner', p_poster, p_starts_at, p_starts_at + interval '3 hours',
    'The Hearth', 'Soho', p_capacity, 'Bring a friend.', 0
  )
$$;
grant execute on function pg_temp.host_event(text, timestamptz, integer) to authenticated;

-- Ids of the events the host submits below.
create temp table hosted (id uuid) on commit drop;
grant select, insert on hosted to authenticated;

-- Privileges -------------------------------------------------------------------

select ok(
  not has_function_privilege('anon', 'public.create_event(text, text, text, timestamptz, timestamptz, text, text, integer, text, integer)', 'execute'),
  'Signed-out visitors cannot create events'
);
select ok(
  not has_function_privilege('anon', 'public.review_event(uuid, boolean, text)', 'execute'),
  'Signed-out visitors cannot review events'
);
select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'is_admin', 'update'),
  'Members cannot make themselves admins'
);

-- As the host --------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select throws_ok(
  $$ update public.profiles set is_admin = true where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null,
  'Members cannot set is_admin'
);
select throws_ok(
  $$ select pg_temp.host_event(p_poster := '55555555-5555-5555-5555-555555555555/poster.webp') $$,
  'P0001', 'invalid_event',
  'The poster must be the host''s own upload'
);
select throws_ok(
  $$ select pg_temp.host_event(p_poster := '11111111-1111-1111-1111-111111111111/missing.webp') $$,
  'P0001', 'invalid_event',
  'The poster must exist'
);
select throws_ok(
  $$ select pg_temp.host_event(p_starts_at := now() - interval '1 hour') $$,
  'P0001', 'event_in_past',
  'Events cannot start in the past'
);
select throws_ok(
  $$ select pg_temp.host_event(p_capacity := 0) $$,
  'P0001', 'invalid_event',
  'Capacity must be at least one'
);

select lives_ok(
  $$ insert into hosted select pg_temp.host_event() $$,
  'Members can submit an event (19th active)'
);
select lives_ok(
  $$ insert into hosted select pg_temp.host_event() $$,
  'Members can submit their 20th active event (finished ones don''t count)'
);
select throws_ok(
  $$ select pg_temp.host_event() $$,
  'P0001', 'event_limit_reached',
  'A 21st active event is refused'
);
select is(
  (select array_agg(distinct status) from public.events where id in (select id from hosted)),
  array['pending'],
  'Members'' events wait for approval'
);
select is(
  (select title from public.events where id = (select id from hosted limit 1)),
  '{"en": "Supper club", "zh": ""}'::jsonb,
  'Hosts can see their own pending events'
);
select throws_ok(
  $$ select public.review_event((select id from hosted limit 1), true) $$,
  'P0001', 'not_allowed',
  'Hosts cannot approve their own events'
);
select throws_ok(
  $$ update public.events set status = 'approved' where id = (select id from hosted limit 1) $$,
  '42501', null,
  'Hosts cannot change an event''s status directly'
);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('event-media', '11111111-1111-1111-1111-111111111111/new.webp',
             '11111111-1111-1111-1111-111111111111') $$,
  'Members can upload a poster to their own folder'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('event-media', 'posters/new.webp', '11111111-1111-1111-1111-111111111111') $$,
  '42501', null,
  'Members cannot upload posters outside their folder'
);

-- As the outsider ------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

select is_empty(
  $$ select 1 from public.events where id in (select id from hosted) $$,
  'Other members cannot see pending events'
);
select throws_ok(
  $$ select public.join_event((select id from hosted limit 1)) $$,
  'P0001', 'event_not_found',
  'Pending events cannot be joined'
);

-- As the admin -----------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "55555555-5555-5555-5555-555555555555", "role": "authenticated"}';

select is(
  (select count(*)::integer from public.events where id in (select id from hosted)),
  2,
  'Admins can see pending events'
);
select lives_ok(
  $$ select public.review_event((select id from hosted order by id limit 1), true) $$,
  'Admins can approve an event'
);
select lives_ok(
  $$ select public.review_event((select id from hosted order by id desc limit 1), false, 'Needs a venue') $$,
  'Admins can reject an event with a note'
);
select throws_ok(
  $$ select public.review_event((select id from hosted order by id limit 1), false) $$,
  'P0001', 'event_not_found',
  'Events already reviewed cannot be reviewed again'
);
select is(
  (select status from public.events
   where id = (select pg_temp.host_event(p_poster := '55555555-5555-5555-5555-555555555555/poster.webp'))),
  'approved',
  'Admins'' own events are approved straight away'
);

-- As the outsider again, and signed out ------------------------------------------------

set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

select is(
  (select count(*)::integer from public.events where id in (select id from hosted)),
  1,
  'Approved events are visible to everyone; rejected ones are not'
);

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select is(
  (select count(*)::integer from public.events where status <> 'approved'),
  0,
  'Signed-out visitors only see approved events'
);

select * from finish();
rollback;
