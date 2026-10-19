-- Hosts cancelling and deleting their events.
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

-- Fixtures ---------------------------------------------------------------------
--   host      hosts both events
--   member    attends both, and has a pending request elsewhere
--   outsider  attends nothing
--
--   …01  to be cancelled
--   …02  to be deleted
--   …03  already finished

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'host@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'member@test.local'),
  ('44444444-4444-4444-4444-444444444444', 'outsider@test.local');

insert into public.events
  (id, title, category_id, poster_url, starts_at, location_name, location_area,
   host_id, capacity, description)
select ('eeeeeeee-0000-0000-0000-00000000000' || n)::uuid, '{"en": "E", "zh": ""}', 'dinner', 'x',
       now() + (case when n = 3 then interval '-2 days' else interval '3 days' end),
       '{"en": "A", "zh": ""}', '{"en": "A", "zh": ""}',
       '11111111-1111-1111-1111-111111111111', 10, '{"en": "d", "zh": ""}'
from generate_series(1, 3) n;

insert into public.event_attendees (event_id, user_id) values
  ('eeeeeeee-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('eeeeeeee-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222');

insert into public.event_join_requests (event_id, user_id) values
  ('eeeeeeee-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444');

insert into public.messages (conversation_id, sender_id, body)
select c.id, '22222222-2222-2222-2222-222222222222', 'hello'
from public.conversations c where c.event_id = 'eeeeeeee-0000-0000-0000-000000000002';

-- A chat photo in the chat that will be deleted.
insert into storage.objects (bucket_id, name, owner_id)
select 'chat-media', c.id::text || '/22222222-2222-2222-2222-222222222222/a.webp',
       '22222222-2222-2222-2222-222222222222'
from public.conversations c where c.event_id = 'eeeeeeee-0000-0000-0000-000000000002';

-- Privileges -------------------------------------------------------------------

select ok(
  not has_function_privilege('anon', 'public.cancel_event(uuid)', 'execute'),
  'Signed-out visitors cannot cancel events'
);
select ok(
  not has_function_privilege('anon', 'public.delete_event(uuid)', 'execute'),
  'Signed-out visitors cannot delete events'
);

-- Not the host -------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select throws_ok(
  $$ select public.cancel_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'P0001', 'not_allowed',
  'Attendees cannot cancel the event'
);
select throws_ok(
  $$ select public.delete_event('eeeeeeee-0000-0000-0000-000000000002') $$,
  'P0001', 'not_allowed',
  'Attendees cannot delete the event'
);

-- Cancelling ---------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ select public.cancel_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'Hosts can cancel their event'
);
select throws_ok(
  $$ select public.cancel_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'P0001', 'event_not_found',
  'An event can only be cancelled once'
);
select throws_ok(
  $$ select public.cancel_event('eeeeeeee-0000-0000-0000-000000000003') $$,
  'P0001', 'event_ended',
  'Finished events cannot be cancelled'
);
select is_empty(
  $$ select 1 from public.event_join_requests where event_id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  'Cancelling drops pending requests'
);
select is(
  (select status from public.events where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'cancelled',
  'The host still sees their cancelled event'
);

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select status from public.events where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'cancelled',
  'Attendees still see a cancelled event'
);
select is(
  (select count(*)::integer from public.my_conversations()
   where event_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  1,
  'The cancelled event''s chat stays in the chat tab'
);

set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

select is_empty(
  $$ select 1 from public.events where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  'Other members no longer see a cancelled event'
);
select throws_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'P0001', 'event_not_found',
  'Cancelled events cannot be joined'
);

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select is_empty(
  $$ select 1 from public.events where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  'Signed-out visitors no longer see a cancelled event'
);

-- Deleting -------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ select public.delete_event('eeeeeeee-0000-0000-0000-000000000002') $$,
  'Hosts can delete their event'
);
select lives_ok(
  $$ select public.delete_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'Hosts can delete an event they cancelled'
);

reset role;

select is(
  (select count(*)::integer from public.events where id::text like 'eeeeeeee-%'),
  1,
  'Deleted events are gone'
);
select is_empty(
  $$ select 1 from public.event_attendees where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'Their attendee lists are gone'
);
select is_empty(
  $$ select 1 from public.messages where body = 'hello' $$,
  'Their chats and messages are gone'
);
select is(
  (select count(*)::integer from public.chat_media_due_for_cleanup()
   where 'a.webp' = any (select split_part(p, '/', 3) from unnest(paths) p)),
  1,
  'Photos from a deleted chat are picked up by the cleanup'
);

select * from finish();
rollback;
