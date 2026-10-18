-- Event group chats, chat images, rate limits and media cleanup.
begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

-- Fixtures ---------------------------------------------------------------------
--   host      hosts every event
--   member    attends every event
--   outsider  attends nothing
--
--   open     starts tomorrow      chat c…01
--   closed   ended 10 days ago    chat c…02 (read-only)
--   expired  ended 40 days ago    chat c…03 (media due for cleanup)

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'host@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'member@test.local'),
  ('44444444-4444-4444-4444-444444444444', 'outsider@test.local');

insert into public.events
  (id, title, category_id, poster_url, starts_at, ends_at, location_name, location_area,
   host_id, capacity, description)
values
  ('eeeeeeee-0000-0000-0000-000000000001', '{"en": "Open", "zh": "O"}', 'bar', 'x',
   now() + interval '1 day', now() + interval '1 day 2 hours',
   '{"en": "A", "zh": "A"}', '{"en": "A", "zh": "A"}',
   '11111111-1111-1111-1111-111111111111', 10, '{"en": "d", "zh": "d"}'),
  ('eeeeeeee-0000-0000-0000-000000000002', '{"en": "Closed", "zh": "C"}', 'bar', 'x',
   now() - interval '10 days', now() - interval '10 days' + interval '2 hours',
   '{"en": "A", "zh": "A"}', '{"en": "A", "zh": "A"}',
   '11111111-1111-1111-1111-111111111111', 10, '{"en": "d", "zh": "d"}'),
  ('eeeeeeee-0000-0000-0000-000000000003', '{"en": "Expired", "zh": "E"}', 'bar', 'x',
   now() - interval '40 days', now() - interval '40 days' + interval '2 hours',
   '{"en": "A", "zh": "A"}', '{"en": "A", "zh": "A"}',
   '11111111-1111-1111-1111-111111111111', 10, '{"en": "d", "zh": "d"}');

select is(
  (select count(*)::integer from public.conversations where event_id::text like 'eeeeeeee-%'),
  3,
  'Every event gets a group chat automatically'
);

-- Give the chats known ids so the tests below can name them.
update public.conversations
set id = ('c0000000-0000-0000-0000-00000000000' || right(event_id::text, 1))::uuid
where event_id::text like 'eeeeeeee-%';

insert into public.event_attendees (event_id, user_id) values
  ('eeeeeeee-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('eeeeeeee-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222'),
  ('eeeeeeee-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222');

insert into public.messages (conversation_id, sender_id, body, created_at) values
  ('c0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Thanks for coming!', now() - interval '9 days');

insert into public.messages (conversation_id, sender_id, image_path, thumb_path) values
  ('c0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
   'c0000000-0000-0000-0000-000000000003/22222222-2222-2222-2222-222222222222/a.webp',
   'c0000000-0000-0000-0000-000000000003/22222222-2222-2222-2222-222222222222/a_thumb.webp');

insert into storage.objects (bucket_id, name, owner_id) values
  ('chat-media', 'c0000000-0000-0000-0000-000000000003/22222222-2222-2222-2222-222222222222/a.webp', '22222222-2222-2222-2222-222222222222'),
  ('chat-media', 'c0000000-0000-0000-0000-000000000003/22222222-2222-2222-2222-222222222222/a_thumb.webp', '22222222-2222-2222-2222-222222222222'),
  ('chat-media', 'c0000000-0000-0000-0000-000000000003/22222222-2222-2222-2222-222222222222/orphan.webp', '22222222-2222-2222-2222-222222222222');

-- As the member ------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.messages (conversation_id, body)
     values ('c0000000-0000-0000-0000-000000000001', 'See you tomorrow') $$,
  'Attendees can post in their event chat'
);
select throws_ok(
  $$ insert into public.messages (conversation_id, body, sender_id)
     values ('c0000000-0000-0000-0000-000000000001', 'forged',
             '11111111-1111-1111-1111-111111111111') $$,
  '42501', null,
  'Messages cannot be sent as someone else'
);
select throws_ok(
  $$ insert into public.messages (conversation_id, body)
     values ('c0000000-0000-0000-0000-000000000002', 'late') $$,
  '42501', null,
  'Chats are read-only a week after the event'
);
select is(
  (select count(*)::integer from public.messages
   where conversation_id = 'c0000000-0000-0000-0000-000000000002'),
  1,
  'Closed chats can still be read'
);
select throws_ok(
  $$ insert into public.messages (conversation_id, body)
     values ('c0000000-0000-0000-0000-000000000001', '   ') $$,
  '23514', null,
  'Blank messages are rejected'
);
select throws_ok(
  $$ insert into public.messages (conversation_id, image_path, thumb_path)
     values ('c0000000-0000-0000-0000-000000000001',
             'c0000000-0000-0000-0000-000000000001/11111111-1111-1111-1111-111111111111/x.webp',
             'c0000000-0000-0000-0000-000000000001/11111111-1111-1111-1111-111111111111/x_t.webp') $$,
  '42501', null,
  'Messages cannot point at someone else''s uploads'
);
select lives_ok(
  $$ insert into public.messages (conversation_id, image_path, thumb_path)
     values ('c0000000-0000-0000-0000-000000000001',
             'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/x.webp',
             'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/x_t.webp') $$,
  'Attendees can send their own images'
);

-- Unread counts
select is(
  (select unread_count from public.my_conversations()
   where conversation_id = 'c0000000-0000-0000-0000-000000000002'),
  1,
  'The chat list counts unread messages from others'
);
select is(
  (select unread_count from public.my_conversations()
   where conversation_id = 'c0000000-0000-0000-0000-000000000001'),
  0,
  'Your own messages are never unread'
);
select lives_ok(
  $$ select public.mark_conversation_read('c0000000-0000-0000-0000-000000000002') $$,
  'Attendees can mark a chat read'
);
select is(
  (select unread_count from public.my_conversations()
   where conversation_id = 'c0000000-0000-0000-0000-000000000002'),
  0,
  'Marking read clears the unread count'
);
select is(
  (select count(*)::integer from public.my_conversations()),
  3,
  'The chat list shows every event chat you belong to'
);

-- Chat uploads
select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('chat-media', 'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/y.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  'Attendees can upload chat images to their own folder'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('chat-media', 'c0000000-0000-0000-0000-000000000001/11111111-1111-1111-1111-111111111111/y.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'Attendees cannot upload into someone else''s folder'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('chat-media', 'c0000000-0000-0000-0000-000000000002/22222222-2222-2222-2222-222222222222/y.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'Nothing can be uploaded to a closed chat'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('chat-media', 'not-a-chat/22222222-2222-2222-2222-222222222222/y.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'Uploads outside a chat folder are refused'
);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('avatars', '22222222-2222-2222-2222-222222222222/me.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  'Members can upload their own avatar'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('avatars', '11111111-1111-1111-1111-111111111111/me.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'Members cannot replace someone else''s avatar'
);

-- As the outsider ------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

select is_empty(
  $$ select 1 from public.messages $$,
  'Outsiders cannot read any event chat'
);
select is_empty(
  $$ select 1 from storage.objects where bucket_id = 'chat-media' $$,
  'Outsiders cannot see any chat images'
);
select throws_ok(
  $$ insert into public.messages (conversation_id, body)
     values ('c0000000-0000-0000-0000-000000000001', 'let me in') $$,
  '42501', null,
  'Outsiders cannot post in an event chat'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('chat-media', 'c0000000-0000-0000-0000-000000000001/44444444-4444-4444-4444-444444444444/y.webp',
             '44444444-4444-4444-4444-444444444444') $$,
  '42501', null,
  'Outsiders cannot upload into an event chat'
);
select throws_ok(
  $$ select public.mark_conversation_read('c0000000-0000-0000-0000-000000000001') $$,
  'P0001', 'conversation_not_found',
  'Outsiders cannot touch an event chat''s read markers'
);

delete from public.messages where conversation_id = 'c0000000-0000-0000-0000-000000000001';

-- As the host ------------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select count(*)::integer from public.messages
   where conversation_id = 'c0000000-0000-0000-0000-000000000001'),
  2,
  'The host can read their event chat, and outsiders could not delete from it'
);

-- Rate limits: fill the host's allowance directly, then try one more.
-- (No signed-in user while filling, so the limits don't apply to the setup.)
reset role;
set local request.jwt.claims = '{}';
insert into public.messages (conversation_id, sender_id, body)
select 'c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'spam ' || n
from generate_series(1, 20) n;
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select throws_ok(
  $$ insert into public.messages (conversation_id, body)
     values ('c0000000-0000-0000-0000-000000000001', 'one more') $$,
  'P0001', 'rate_limited',
  'More than 20 messages a minute is refused'
);

reset role;
set local request.jwt.claims = '{}';
-- The member has 2 images from today (one fixture, one sent above); add 18
-- more from earlier today to reach the limit of 20.
insert into public.messages (conversation_id, sender_id, image_path, thumb_path, created_at)
select 'c0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
       'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/' || n || '.webp',
       'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/' || n || '_t.webp',
       now() - interval '2 hours'
from generate_series(1, 18) n;
-- They have 4 chat uploads today (three fixtures, one above); add 36 to reach 40.
insert into storage.objects (bucket_id, name, owner_id)
select 'chat-media',
       'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/bulk' || n || '.webp',
       '22222222-2222-2222-2222-222222222222'
from generate_series(1, 36) n;
set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select throws_ok(
  $$ insert into public.messages (conversation_id, image_path, thumb_path)
     values ('c0000000-0000-0000-0000-000000000001',
             'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/z.webp',
             'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/z_t.webp') $$,
  'P0001', 'image_limit_reached',
  'More than 20 images a day is refused'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('chat-media', 'c0000000-0000-0000-0000-000000000001/22222222-2222-2222-2222-222222222222/z.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'More than 40 chat uploads a day is refused'
);
select lives_ok(
  $$ insert into public.messages (conversation_id, body)
     values ('c0000000-0000-0000-0000-000000000001', 'text still works') $$,
  'Text messages still work after the image limit'
);

-- Media cleanup (as the service role would run it) -----------------------------------

reset role;

select is(
  (select array_length(paths, 1) from public.chat_media_due_for_cleanup()
   where conversation_id = 'c0000000-0000-0000-0000-000000000003'),
  3,
  'Cleanup finds every file of a chat 30 days after its event, orphans included'
);
select is_empty(
  $$ select 1 from public.chat_media_due_for_cleanup()
     where conversation_id <> 'c0000000-0000-0000-0000-000000000003' $$,
  'Cleanup leaves recent chats alone'
);
select public.mark_chat_media_expired('c0000000-0000-0000-0000-000000000003');
select ok(
  (select image_expired_at is not null from public.messages
   where conversation_id = 'c0000000-0000-0000-0000-000000000003'),
  'Cleaned-up images are marked expired'
);

select * from finish();
rollback;
