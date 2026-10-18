import type { StringKey } from "@/lib/i18n/strings";

// The database raises these as stable messages (see supabase/README.md);
// Supabase Auth reports its own codes.
const MESSAGE_KEYS: Record<string, StringKey> = {
  event_full: "errorEventFull",
  event_started: "errorEventStarted",
  event_not_found: "errorNotFound",
  conversation_not_found: "errorNotFound",
  not_authenticated: "errorSignInRequired",
  rate_limited: "errorRateLimited",
  image_limit_reached: "errorImageLimit",
};

const AUTH_CODE_KEYS: Record<string, StringKey> = {
  invalid_credentials: "errorInvalidLogin",
  email_not_confirmed: "errorEmailNotConfirmed",
  user_already_exists: "errorEmailTaken",
  email_exists: "errorEmailTaken",
  weak_password: "errorWeakPassword",
  over_email_send_rate_limit: "errorTooManyEmails",
  over_request_rate_limit: "errorTooManyAttempts",
  same_password: "errorSamePassword",
};

/** Turns an error from Supabase into text the member can act on. */
export function errorKey(error: unknown): StringKey {
  if (error && typeof error === "object") {
    const { message, code } = error as { message?: string; code?: string };
    if (code && AUTH_CODE_KEYS[code]) return AUTH_CODE_KEYS[code];
    if (message && MESSAGE_KEYS[message]) return MESSAGE_KEYS[message];
    if (message?.includes("Failed to fetch")) return "errorOffline";
  }
  return "errorGeneric";
}
