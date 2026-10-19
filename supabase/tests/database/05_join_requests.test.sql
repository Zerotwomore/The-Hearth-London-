-- Asking to join an event, and the host answering.
begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

-- Fixtures ---------------------------------------------------------------------
--   host      hosts the event (one place)
--   member    is accepted
--   second    is declined
--   outsider  never asks

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'host@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'member@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'second@test.local'),
  ('44444444-4444-4444-4444-444444444444', 'outsider@test.local');

insert into public.events
  (id, title, category_id, poster_url, starts_at, location_name, location_area,
   host_id, capacity, description)
values
  ('eeeeeeee-0000-0000-0000-000000000001', '{"en": "Dinner", "zh": ""}', 'dinner', 'x',
   now() + interval '3 days', '{"en": "A", "zh": ""}', '{"en": "A", "zh": ""}',
   '11111111-1111-1111-1111-111111111111', 1, '{"en": "d", "zh": ""}');

-- Privileges -------------------------------------------------------------------

select ok(
  not has_table_privilege('authenticated', 'public.event_join_requests', 'insert'),
  'Members cannot write requests directly (only via join_event)'
);
select ok(
  not has_table_privilege('authenticated', 'public.event_join_requests', 'update'),
  'Members cannot change a request''s status'
);
select ok(
  not has_function_privilege('anon', 'public.respond_to_join_request(uuid, uuid, boolean)', 'execute'),
  'Signed-out visitors cannot answer requests'
);

-- Asking -------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select lives_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'Members can ask to join'
);
select is_empty(
  $$ select 1 from public.event_attendees where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'Asking doesn''t make you an attendee'
);
select throws_ok(
  $$ select public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000001',
       '22222222-2222-2222-2222-222222222222', true) $$,
  'P0001', 'not_allowed',
  'Members cannot accept their own request'
);

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';

select lives_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'Pending requests don''t hold a place, so others can ask too'
);
select is(
  (select count(*)::integer from public.event_join_requests),
  1,
  'Members only see their own requests'
);

set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

select is_empty(
  $$ select 1 from public.event_join_requests $$,
  'Other members cannot see anyone''s requests'
);

-- Answering, as the host ------------------------------------------------------------

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select count(*)::integer from public.event_join_requests where status = 'pending'),
  2,
  'Hosts see the requests for their event'
);
select lives_ok(
  $$ select public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000001',
       '22222222-2222-2222-2222-222222222222', true) $$,
  'Hosts can accept a request'
);
select is(
  (select count(*)::integer from public.event_attendees
   where user_id = '22222222-2222-2222-2222-222222222222'),
  1,
  'Accepted members become attendees'
);
select throws_ok(
  $$ select public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000001',
       '33333333-3333-3333-3333-333333333333', true) $$,
  'P0001', 'event_full',
  'Hosts cannot accept more people than there are places'
);
select lives_ok(
  $$ select public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000001',
       '33333333-3333-3333-3333-333333333333', false) $$,
  'Hosts can decline a request'
);
select throws_ok(
  $$ select public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000001',
       '33333333-3333-3333-3333-333333333333', true) $$,
  'P0001', 'request_not_found',
  'Answered requests cannot be answered again'
);

-- After a decline -------------------------------------------------------------------

-- Make room (as the owner) so only the decline stands in the way.
reset role;
update public.events set capacity = 5 where id = 'eeeeeeee-0000-0000-0000-000000000001';
set local role authenticated;

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';

select throws_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'P0001', 'request_declined',
  'Declined members cannot ask again'
);
delete from public.event_join_requests where user_id = '33333333-3333-3333-3333-333333333333';

-- Withdrawing ---------------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

select lives_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'Members can ask once there is room'
);
delete from public.event_join_requests where user_id = '44444444-4444-4444-4444-444444444444';

reset role;

select is(
  (select count(*)::integer from public.event_join_requests
   where user_id = '44444444-4444-4444-4444-444444444444'),
  0,
  'Members can withdraw a pending request'
);
select is(
  (select status from public.event_join_requests
   where user_id = '33333333-3333-3333-3333-333333333333'),
  'declined',
  'Declined requests cannot be deleted to ask again'
);

select * from finish();
rollback;
