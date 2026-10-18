-- File storage.
--
-- Size and type limits are enforced by Storage itself, so they hold even for
-- someone calling the API directly. The app compresses to WebP before
-- uploading, so real files sit far below these caps.
--
--   avatars      public   512 KB  <user_id>/<file>
--   event-media  public   2 MB    staff uploads only (posters, galleries, club images)
--   chat-media   private  1 MB    <conversation_id>/<user_id>/<file>, read via signed URLs

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 524288, array['image/webp', 'image/jpeg', 'image/png']),
  ('event-media', 'event-media', true, 2097152, array['image/webp', 'image/jpeg']),
  ('chat-media', 'chat-media', false, 1048576, array['image/webp', 'image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Chat uploads per member per day. Each image is two files (full + thumbnail),
-- so this matches the 20-images-a-day message limit. Counted here too so
-- nobody can fill storage by uploading without ever sending a message.
create function public.chat_uploads_today()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from storage.objects o
  where o.bucket_id = 'chat-media'
    and o.owner_id = auth.uid()::text
    and o.created_at > now() - interval '1 day'
$$;

revoke execute on function public.chat_uploads_today() from public, anon;
grant execute on function public.chat_uploads_today() to authenticated;

-- Avatars --------------------------------------------------------------------
-- Public bucket: anyone can view by URL. These rules cover writing, plus
-- reading your own folder (needed to replace a file).

create policy "Avatars: members can read their own folder"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Avatars: members can upload to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Avatars: members can replace their own files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Avatars: members can delete their own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Chat media -----------------------------------------------------------------
-- No update or delete for members: files are immutable, and the cleanup job
-- removes them 30 days after the event.

create policy "Chat media: event host and attendees can view"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-media'
    and public.can_access_conversation(public.try_uuid((storage.foldername(name))[1]))
  );

create policy "Chat media: event host and attendees can upload to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-media'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and public.can_access_conversation(public.try_uuid((storage.foldername(name))[1]))
    and public.chat_is_open(public.try_uuid((storage.foldername(name))[1]))
    and public.chat_uploads_today() < 40
  );
