-- Deletes chat images 30 days after an event ends.
--
-- Files have to be removed through the Storage API (deleting rows from
-- storage.objects would orphan the underlying files), so the work is split:
--   * these functions find the files and mark messages as expired;
--   * the cleanup-chat-media Edge Function deletes the files;
--   * pg_cron calls that function daily at 03:30.
--
-- One-off setup per project (not in git, the values are secret):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<random string>', 'cron_secret');
-- and set the same random string as the function's CRON_SECRET:
--   supabase secrets set CRON_SECRET=<random string>

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Up to p_limit expired conversations, each with every chat file stored under
-- it — including uploads never attached to a message.
create function public.chat_media_due_for_cleanup(p_limit integer default 50)
returns table (conversation_id uuid, paths text[])
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, array_agg(o.name order by o.name)
  from public.conversations c
  join public.events e on e.id = c.event_id
  join storage.objects o
    on o.bucket_id = 'chat-media'
   and o.name like c.id::text || '/%'
  where coalesce(e.ends_at, e.starts_at) + interval '30 days' < now()
  group by c.id
  order by c.id
  limit p_limit
$$;

create function public.mark_chat_media_expired(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.messages
  set image_expired_at = now()
  where conversation_id = p_conversation_id
    and image_path is not null
    and image_expired_at is null
$$;

revoke execute on function
  public.chat_media_due_for_cleanup(integer),
  public.mark_chat_media_expired(uuid)
from public, anon, authenticated;

grant execute on function
  public.chat_media_due_for_cleanup(integer),
  public.mark_chat_media_expired(uuid)
to service_role;

select cron.schedule(
  'cleanup-chat-media',
  '30 3 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/cleanup-chat-media',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  )
  $$
);
