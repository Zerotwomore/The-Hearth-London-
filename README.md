# The Hearth London

Bilingual (EN / 中文) app for meeting people in London over events, clubs and
event group chats. Live at [thehearthlondon.com](https://thehearthlondon.com).

- **App:** Next.js in `src/`, built as static files and hosted on GitHub Pages.
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime) in `supabase/` —
  schema, security rules and tests. See [supabase/README.md](supabase/README.md).

The app talks to Supabase directly; all data access goes through `src/lib/api/`,
and the database's row level security decides what each person can see and do.

## Running locally

```sh
npm install
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev                  # http://localhost:3000
```

Point `.env.local` at a local Supabase (`npx supabase start`, needs Docker —
it prints the URL and anon key, and loads demo data) or at the hosted project.

```sh
npm run lint
npm run build
npx supabase test db          # backend security tests (local Supabase)
```

## Deploying

Pushing to `main` builds the site and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`, which also holds the two public Supabase
values). Database changes are new files in `supabase/migrations/`, applied
with `npx supabase db push` (or pasted into the SQL editor and recorded in
`supabase_migrations.schema_migrations`).

Because the site is static, event, club and chat pages use `?id=` links
(`src/lib/routes.ts`) and shared links get the general site preview. Moving
to a server host such as Vercel would allow `/events/<id>` links and
per-event previews.
