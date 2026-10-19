-- Profiles, joining events, contact details and clubs, tried as different people.
begin;
create extension if not exists pgtap with schema extensions;
select plan(30);

-- Fixtures (as the database owner, so no rules apply) -------------------------
--   host     hosts every event
--   member   joins the free event
--   second   takes the free event's last place
--   outsider never joins anything

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'host@test.local', '{"name": "Host"}'),
  ('22222222-2222-2222-2222-222222222222', 'member@test.local', '{"full_name": "Member"}'),
  ('33333333-3333-3333-3333-333333333333', 'second@test.local', '{}'),
  ('44444444-4444-4444-4444-444444444444', 'outsider@test.local', '{}');

insert into public.events
  (id, title, category_id, poster_url, starts_at, location_name, location_area,
   host_id, capacity, description, price_pence)
values
  -- free, two places
  ('eeeeeeee-0000-0000-0000-000000000001', '{"en": "Free", "zh": "免费"}', 'dinner', 'x',
   now() + interval '3 days', '{"en": "A", "zh": "A"}', '{"en": "A", "zh": "A"}',
   '11111111-1111-1111-1111-111111111111', 2, '{"en": "d", "zh": "d"}', 0),
  -- £20
  ('eeeeeeee-0000-0000-0000-000000000002', '{"en": "Paid", "zh": "付费"}', 'bar', 'x',
   now() + interval '3 days', '{"en": "A", "zh": "A"}', '{"en": "A", "zh": "A"}',
   '11111111-1111-1111-1111-111111111111', 10, '{"en": "d", "zh": "d"}', 2000),
  -- already started
  ('eeeeeeee-0000-0000-0000-000000000003', '{"en": "Past", "zh": "过去"}', 'bar', 'x',
   now() - interval '1 hour', '{"en": "A", "zh": "A"}', '{"en": "A", "zh": "A"}',
   '11111111-1111-1111-1111-111111111111', 10, '{"en": "d", "zh": "d"}', 0);

insert into public.contact_details (user_id, wechat_id)
values ('11111111-1111-1111-1111-111111111111', 'hearth_host');

insert into public.clubs (id, name, category, image_url, description)
values ('cccccccc-0000-0000-0000-000000000001', '{"en": "Club", "zh": "俱乐部"}',
        '{"en": "C", "zh": "C"}', 'x', '{"en": "d", "zh": "d"}');

-- Sign-up --------------------------------------------------------------------

select is(
  (select name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Host',
  'Signing up creates a profile named from the sign-up metadata'
);
select is(
  (select name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'Member',
  'Apple-style full_name metadata is used too'
);

-- Profiles, as member ----------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select lives_ok(
  $$ update public.profiles set name = 'New name', bio = 'Hi'
     where id = '22222222-2222-2222-2222-222222222222' $$,
  'Members can edit their own name and bio'
);
select throws_ok(
  $$ update public.profiles set verified = true where id = '22222222-2222-2222-2222-222222222222' $$,
  '42501', null,
  'Members cannot verify themselves'
);
select throws_ok(
  $$ update public.profiles set avatar_path = '11111111-1111-1111-1111-111111111111/a.webp'
     where id = '22222222-2222-2222-2222-222222222222' $$,
  '23514', null,
  'Avatar paths must be inside your own folder'
);

update public.profiles set name = 'Hacked' where id = '11111111-1111-1111-1111-111111111111';

-- Joining events ---------------------------------------------------------------

select throws_ok(
  $$ insert into public.event_attendees (event_id, user_id)
     values ('eeeeeeee-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'Members cannot insert themselves as attendees directly'
);
select lives_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'Members can ask to join a free event'
);
select lives_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'Asking twice is harmless'
);
select lives_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000002') $$,
  'Paid events can be requested (payment happens at the event)'
);
select throws_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000003') $$,
  'P0001', 'event_started',
  'Events that have started cannot be joined'
);
select throws_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-00000000ffff') $$,
  'P0001', 'event_not_found',
  'Unknown events are reported as not found'
);

-- The host accepts both requests (join requests are tested in 05).
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select lives_ok(
  $$ select public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000001',
       '22222222-2222-2222-2222-222222222222', true),
            public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000002',
       '22222222-2222-2222-2222-222222222222', true) $$,
  'The host accepts the member'
);
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select wechat_id from public.contact_details where user_id = '11111111-1111-1111-1111-111111111111'),
  'hearth_host',
  'Attendees can see the host''s WeChat ID'
);
select throws_ok(
  $$ insert into public.contact_details (user_id, wechat_id)
     values ('22222222-2222-2222-2222-222222222222', '1bad') $$,
  '23514', null,
  'Invalid WeChat IDs are rejected'
);

-- As the second member ---------------------------------------------------------

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';

select lives_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'The second member can ask for the last place'
);

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select lives_ok(
  $$ select public.respond_to_join_request('eeeeeeee-0000-0000-0000-000000000001',
       '33333333-3333-3333-3333-333333333333', true) $$,
  'The host gives them the second place in a two-place event'
);

-- As the outsider --------------------------------------------------------------

set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

select throws_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  'P0001', 'event_full',
  'Full events cannot be joined'
);
select is_empty(
  $$ select 1 from public.contact_details where user_id = '11111111-1111-1111-1111-111111111111' $$,
  'People who share no event cannot see a WeChat ID'
);

delete from public.event_attendees where user_id = '22222222-2222-2222-2222-222222222222';

-- Clubs ------------------------------------------------------------------------

select throws_ok(
  $$ insert into public.club_posts (club_id, body)
     values ('cccccccc-0000-0000-0000-000000000001', 'hello') $$,
  '42501', null,
  'Non-members cannot post in a club'
);
select throws_ok(
  $$ insert into public.club_members (club_id, user_id)
     values ('cccccccc-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'Members cannot add someone else to a club'
);
select lives_ok(
  $$ insert into public.club_members (club_id, user_id)
     values ('cccccccc-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444') $$,
  'Members can join a club'
);
select lives_ok(
  $$ insert into public.club_posts (club_id, body)
     values ('cccccccc-0000-0000-0000-000000000001', 'hello') $$,
  'Club members can post'
);
select throws_ok(
  $$ insert into public.club_posts (club_id, body, author_id)
     values ('cccccccc-0000-0000-0000-000000000001', 'forged',
             '11111111-1111-1111-1111-111111111111') $$,
  '42501', null,
  'Posts cannot be attributed to someone else'
);

-- As a signed-out visitor --------------------------------------------------------

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select is(
  (select count(*)::integer from public.events where id::text like 'eeeeeeee-%'),
  3,
  'Signed-out visitors can list events'
);
select throws_ok(
  $$ select * from public.profiles $$,
  '42501', null,
  'Signed-out visitors cannot read profiles'
);
select throws_ok(
  $$ select public.join_event('eeeeeeee-0000-0000-0000-000000000001') $$,
  '42501', null,
  'Signed-out visitors cannot join events'
);

-- Back to the owner to check what really happened ------------------------------

reset role;

select is(
  (select name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Host',
  'Members cannot edit someone else''s profile'
);
select is(
  (select count(*)::integer from public.event_attendees
   where event_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  2,
  'A two-place event ends up with exactly two attendees'
);
select is(
  (select count(*)::integer from public.event_attendees
   where user_id = '22222222-2222-2222-2222-222222222222'),
  2,
  'Members cannot remove someone else from an event'
);
select is(
  (select verified from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  false,
  'The member is still not verified'
);

select * from finish();
rollback;
