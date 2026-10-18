import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Both values are public: the anon key only grants what the database's row
 * level security allows. Set in .github/workflows/deploy.yml for the live
 * site, and in .env.local for `next dev`.
 * The service role key must never be used here.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let browserClient: SupabaseClient | null = null;

/** The signed-in browser client. Created on first use, so builds without env vars still succeed. */
export function supabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  browserClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Picks up the session from email confirmation and password reset links.
      // The implicit flow (tokens in the URL hash) also works when the email
      // is opened on a different device from the one used to sign up.
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  });
  return browserClient;
}

/** Public URL of a file in a public bucket (avatars, event-media). */
export function publicStorageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
