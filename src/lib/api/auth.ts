"use client";

import { supabase } from "@/lib/api/supabase";

// Email links bring people back to this site. Each URL must be listed under
// Authentication → URL Configuration → Redirect URLs in Supabase.
function siteUrl(path: string): string {
  return `${window.location.origin}${path}`;
}

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Creates an account and sends the confirmation email. Returns true when the
 * member is signed in straight away (only if confirmation is switched off).
 */
export async function signUp(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: siteUrl("/onboarding") },
  });
  if (error) throw error;
  return Boolean(data.session);
}

export async function resendConfirmation(email: string): Promise<void> {
  const { error } = await supabase().auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: siteUrl("/onboarding") },
  });
  if (error) throw error;
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase().auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl("/reset-password"),
  });
  if (error) throw error;
}

/** Sets a new password for the member signed in by a reset link. */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase().auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase().auth.signOut();
}
