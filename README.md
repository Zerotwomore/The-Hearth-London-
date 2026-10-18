# The Hearth London

Bilingual (EN / 中文) app for meeting people in London over events, clubs and
event group chats. Live at [thehearthlondon.com](https://thehearthlondon.com).

- **App:** Next.js in `src/`, hosted on Vercel.
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

Pushing to `main` deploys to Vercel. The two `NEXT_PUBLIC_SUPABASE_*` variables
must be set in Vercel → Project → Settings → Environment Variables. Database
changes are new files in `supabase/migrations/`, applied with
`npx supabase db push`.
