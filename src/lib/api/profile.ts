"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/api/supabase";
import { avatarUrl } from "@/lib/api/rows";
import { LocalizedText, Lang } from "@/lib/types/i18n";
import { OwnProfile } from "@/lib/types/user";

export interface Interest {
  id: string;
  label: LocalizedText;
}

export function useInterests() {
  return useQuery({
    queryKey: ["interests"],
    staleTime: Infinity,
    queryFn: async (): Promise<Interest[]> => {
      const { data, error } = await supabase().from("interests").select("id, label").order("sort");
      if (error) throw error;
      return data as Interest[];
    },
  });
}

interface OwnProfileRow {
  id: string;
  name: string;
  name_zh: string | null;
  avatar_path: string | null;
  bio: string | null;
  verified: boolean;
  lang: Lang;
  onboarded_at: string | null;
  profile_interests: { interest_id: string }[] | null;
}

export async function fetchOwnProfile(userId: string): Promise<OwnProfile | null> {
  const { data, error } = await supabase()
    .from("profiles")
    .select(
      "id, name, name_zh, avatar_path, bio, verified, lang, onboarded_at, profile_interests ( interest_id )"
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as OwnProfileRow;
  return {
    id: row.id,
    name: row.name,
    nameZh: row.name_zh ?? undefined,
    avatarPath: row.avatar_path ?? undefined,
    avatarUrl: avatarUrl(row.avatar_path),
    bio: row.bio ?? undefined,
    verified: row.verified,
    lang: row.lang,
    onboardedAt: row.onboarded_at,
    interestIds: (row.profile_interests ?? []).map((item) => item.interest_id),
  };
}

export interface ProfileChanges {
  name: string;
  bio?: string;
  avatarPath?: string;
  interestIds: string[];
}

/** Saves the onboarding / edit-profile answers and marks onboarding done. */
export async function saveProfile(
  userId: string,
  changes: ProfileChanges,
  previous: OwnProfile | null
): Promise<void> {
  const client = supabase();
  const { error } = await client
    .from("profiles")
    .update({
      name: changes.name,
      bio: changes.bio?.trim() || null,
      avatar_path: changes.avatarPath ?? null,
      onboarded_at: previous?.onboardedAt ?? new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;

  const before = new Set(previous?.interestIds ?? []);
  const after = new Set(changes.interestIds);
  const removed = [...before].filter((id) => !after.has(id));
  const added = [...after].filter((id) => !before.has(id));

  if (removed.length) {
    const { error: removeError } = await client
      .from("profile_interests")
      .delete()
      .eq("user_id", userId)
      .in("interest_id", removed);
    if (removeError) throw removeError;
  }
  if (added.length) {
    const { error: addError } = await client
      .from("profile_interests")
      .insert(added.map((interestId) => ({ user_id: userId, interest_id: interestId })));
    if (addError) throw addError;
  }

  // Tidy up a replaced photo; harmless if it fails.
  if (previous?.avatarPath && previous.avatarPath !== changes.avatarPath) {
    await client.storage.from("avatars").remove([previous.avatarPath]);
  }
}

export async function saveLanguage(userId: string, lang: Lang): Promise<void> {
  await supabase().from("profiles").update({ lang }).eq("id", userId);
}

const AVATAR_SIZE = 400;

/**
 * Crops a photo to a square, shrinks it to 400×400 WebP (typically ~30 KB)
 * and uploads it to the member's own folder. Returns the storage path.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE
  );
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Could not encode image"))),
      "image/webp",
      0.85
    )
  );
  // Safari before 17 can't encode WebP and silently returns PNG, which the
  // bucket also accepts.
  const extension = blob.type === "image/webp" ? "webp" : "png";
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase()
    .storage.from("avatars")
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;
  return path;
}
