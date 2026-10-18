-- What each role may touch at all, independent of any row.
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

select is(
  (select count(*)::integer from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'Row level security is on for every public table'
);

-- Signed-out visitors ---------------------------------------------------------

select ok(
  has_table_privilege('anon', 'public.events', 'select'),
  'Signed-out visitors can read events (for shared-link previews)'
);
select ok(
  not has_table_privilege('anon', 'public.profiles', 'select'),
  'Signed-out visitors cannot read profiles'
);
select ok(
  not has_table_privilege('anon', 'public.messages', 'select'),
  'Signed-out visitors cannot read messages'
);
select ok(
  not has_function_privilege('anon', 'public.join_event(uuid)', 'execute'),
  'Signed-out visitors cannot call join_event'
);

-- Members --------------------------------------------------------------------

select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'verified', 'update'),
  'Members cannot change verified'
);
select ok(
  not has_table_privilege('authenticated', 'public.events', 'insert, update, delete'),
  'Members cannot write events'
);
select ok(
  not has_table_privilege('authenticated', 'public.event_attendees', 'insert'),
  'Members cannot add attendees directly (only via join_event)'
);
select ok(
  not has_column_privilege('authenticated', 'public.messages', 'sender_id', 'insert'),
  'Members cannot choose a message''s sender'
);
select ok(
  not has_column_privilege('authenticated', 'public.messages', 'created_at', 'insert'),
  'Members cannot backdate messages'
);
select ok(
  not has_column_privilege('authenticated', 'public.club_members', 'role', 'insert'),
  'Members cannot make themselves club admins'
);
select ok(
  not has_function_privilege('authenticated', 'public.chat_media_due_for_cleanup(integer)', 'execute'),
  'Members cannot call the media cleanup query'
);
select ok(
  not has_function_privilege('authenticated', 'public.mark_chat_media_expired(uuid)', 'execute'),
  'Members cannot mark media expired'
);

select * from finish();
rollback;
