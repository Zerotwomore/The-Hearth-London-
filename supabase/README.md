# Backend (Supabase)

The Hearth's backend is a Supabase project: Postgres with row level security,
Auth, Storage, Realtime for chat, and one Edge Function. There is no separate
API server — the app talks to Supabase directly, and the rules in the database
decide what each person can see and do.

```
supabase/
  migrations/                  schema, access rules, functions, storage — applied in order
  tests/database/              security tests (pgTAP), run with `supabase test db`
  functions/cleanup-chat-media Edge Function that deletes old chat images
  seed.sql                     local-only demo data (generated from the prototype's fixtures)
  config.toml                  local stack settings
```

## What's in the schema

| Area | Tables | Key rules |
|---|---|---|
| People | `profiles`, `profile_interests`, `contact_details` | Anyone signed in can read profiles; only you can edit yours, and never `verified`. Your WeChat ID is only visible to people who share an event with you. |
| Events | `events`, `event_attendees` | Approved events are public (so shared links preview). Members host events through `create_event()` — at most 20 active (pending or approved, not yet ended) per member. Members' events start `pending` and are visible only to the host and admins until an admin approves them with `review_event()`; admins' own events are approved immediately. Joining is a request to the host: `join_event()` records it in `event_join_requests` (checking approval, capacity and start time), and the host answers with `respond_to_join_request()` — accepting adds them to `event_attendees` (re-checking capacity under a row lock); declined members can't ask again. Members can withdraw a pending request. Hosts can `cancel_event()` (hidden from listings and closed to joining, but kept — with its chat — for the host and attendees) or `delete_event()` (removes the event, attendees, requests and chat for good). Ended events stay listed, greyed out, until the host deletes them. |
| Clubs | `clubs`, `club_members`, `club_posts` | Anyone can join; only members can post; authors and club admins can delete posts. |
| Chat | `conversations`, `messages`, `conversation_reads` | One group chat per event, created automatically. Only the host and attendees can read or post; it becomes read-only 7 days after the event. 20 messages/minute, 20 images/day. |
| Storage | buckets `avatars`, `event-media`, `chat-media` | Size and type caps enforced by Storage. Hosts upload posters to `event-media/<their id>/`, 20 a day. Chat images are private, 40 uploads/day, and deleted 30 days after the event, or at the next daily cleanup once the event is deleted. |

Clubs are created by staff in the Supabase dashboard for now.

**Admins** (`profiles.is_admin`) review events submitted by members, in the
app under Profile → Review events. The flag can only be set from the SQL
editor; the first admin is set by the `member_hosted_events` migration if
that account already exists. To add one (the account must have confirmed
its email):

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'someone@example.com');
```
Paid events are joined in the app and paid for at the event; the price is
for information. VIP is not part of the MVP.

## Local development

Needs [Docker](https://docs.docker.com/get-docker/) and the Supabase CLI
(`npx supabase …` works without installing it).

```sh
npx supabase start          # local stack; applies migrations + seed.sql
npx supabase test db        # run the security tests
npx supabase db reset       # rebuild the local database from scratch
```

`supabase start` prints a local API URL and keys for `.env.local`. Seeded
accounts all use the password `hearth-dev-password`; the prototype's user is
`jj@hearth.local`.

### Changing the schema

Never edit a migration that has reached production. Add a new one:

```sh
npx supabase migration new describe_the_change
```

…then add tests for any new access rule. CI (`.github/workflows/database.yml`)
runs every migration and test against a real Supabase stack on each push.

## Working with the app

- **Types:** regenerate the app's database types after any schema change:
  ```sh
  npx supabase gen types typescript --local > src/lib/database.types.ts
  ```
- **Breaking changes** (renaming or dropping a column, changing a function's
  arguments): the deployed site and the database don't update at the same
  instant, so add the new shape first, ship the app change, then remove the
  old one in a later migration.
- **Error codes** raised for the app — `event_full`, `event_started`,
  `event_limit_reached`, `event_in_past`, `invalid_event`, `not_allowed`,
  `request_declined`, `request_not_found`, `event_ended`,
  `event_not_found`, `not_authenticated`,
  `rate_limited`, `image_limit_reached`, `conversation_not_found` — are part
  of the contract; the app maps them to user-facing text.

## Production setup (one-off)

1. **Create the project** at [supabase.com](https://supabase.com) in the
   **London (eu-west-2)** region.
2. **Link and push the schema:**
   ```sh
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
3. **Auth → URL configuration:** Site URL `https://thehearthlondon.com`, and add
   these redirect URLs (the confirmation and password-reset emails link back
   to `/onboarding` and `/reset-password`):
   - `https://thehearthlondon.com/**`
   - `http://localhost:3000/**`
   - if you later add Vercel previews, their pattern, e.g. `https://the-hearth-london-*-<team>.vercel.app/**`
     (never a bare `https://*.vercel.app/**`, which would let any Vercel site
     receive sign-in links)
4. **Email sender** — Supabase's built-in sender only reaches your own team.
   With [Resend](https://resend.com): add and verify the domain
   `thehearthlondon.com` (DNS records at your registrar), create an API key,
   then in **Authentication → Emails → SMTP Settings** enable custom SMTP:
   host `smtp.resend.com`, port `465`, username `resend`, password = the API
   key, sender `noreply@thehearthlondon.com`, name `The Hearth London`. Keep
   **Authentication → Sign In / Providers → Email → Confirm email** on.
5. **Chat image cleanup:**
   ```sh
   npx supabase functions deploy cleanup-chat-media
   npx supabase secrets set CRON_SECRET=<long random string>
   ```
   Then in the SQL editor:
   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
   select vault.create_secret('<the same random string>', 'cron_secret');
   ```
6. **App settings:** `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Project Settings → API go in
   `.github/workflows/deploy.yml` (and `.env.local` locally). They are safe in
   the browser. The **service role key must never go into the app or the repo.**
7. Check **Advisors → Security** in the dashboard shows no errors.
