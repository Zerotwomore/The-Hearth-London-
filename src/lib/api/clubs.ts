"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/api/supabase";
import { PROFILE_FIELDS, ProfileRow, isUuid, toProfile, toProfiles } from "@/lib/api/rows";
import { useAppState } from "@/lib/context/AppStateContext";
import { Club, ClubDetailItem } from "@/lib/types/club";
import { LocalizedText } from "@/lib/types/i18n";

const PUBLIC_CLUB_FIELDS = "id, name, category, image_url, description";

/** Members and posts are members-only; signed-out queries must not ask for them. */
function clubFields(signedIn: boolean, withPosts = false): string {
  if (!signedIn) return PUBLIC_CLUB_FIELDS;
  const members = `club_members ( joined_at, profiles ( ${PROFILE_FIELDS} ) )`;
  const posts = `club_posts ( id, body, created_at, profiles ( ${PROFILE_FIELDS} ) )`;
  return [PUBLIC_CLUB_FIELDS, members, ...(withPosts ? [posts] : [])].join(", ");
}

interface ClubRow {
  id: string;
  name: LocalizedText;
  category: LocalizedText;
  image_url: string;
  description: LocalizedText;
  /** Absent when loaded signed out. */
  club_members?: { joined_at: string; profiles: ProfileRow | null }[] | null;
}

interface ClubPostRow {
  id: string;
  body: string;
  created_at: string;
  profiles: ProfileRow | null;
}

function toClub(row: ClubRow): Club {
  const members = [...(row.club_members ?? [])].sort((a, b) =>
    a.joined_at.localeCompare(b.joined_at)
  );
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    imageUrl: row.image_url,
    description: row.description,
    members: toProfiles(members),
  };
}

export function useClubs() {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["clubs", userId],
    queryFn: async (): Promise<Club[]> => {
      const { data, error } = await supabase()
        .from("clubs")
        .select(clubFields(Boolean(userId)))
        .order("created_at");
      if (error) throw error;
      return (data as unknown as ClubRow[]).map(toClub);
    },
  });
}

/** One club with its posts (newest first), or null if it doesn't exist. */
export function useClub(id: string) {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["club", id, userId],
    queryFn: async (): Promise<ClubDetailItem | null> => {
      if (!isUuid(id)) return null;
      let query = supabase()
        .from("clubs")
        .select(clubFields(Boolean(userId), true))
        .eq("id", id);
      if (userId) {
        query = query.order("created_at", { referencedTable: "club_posts", ascending: false });
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as unknown as ClubRow & { club_posts?: ClubPostRow[] | null };
      return {
        ...toClub(row),
        posts: (row.club_posts ?? []).map((post) => ({
          id: post.id,
          body: post.body,
          createdAt: post.created_at,
          author: post.profiles ? toProfile(post.profiles) : undefined,
        })),
      };
    },
  });
}

/** The ids of clubs the signed-in member belongs to. */
export function useMyClubIds() {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["my-club-ids", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase()
        .from("club_members")
        .select("club_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return new Set(data.map((row) => row.club_id as string));
    },
  });
}

/** Joins or leaves a club. */
export function useToggleClub() {
  const { userId } = useAppState();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clubId, join }: { clubId: string; join: boolean }) => {
      const query = join
        ? supabase().from("club_members").insert({ club_id: clubId, user_id: userId! })
        : supabase().from("club_members").delete().eq("club_id", clubId).eq("user_id", userId!);
      const { error } = await query;
      if (error) throw error;
    },
    onSettled: (_data, _error, { clubId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clubs"] }),
        queryClient.invalidateQueries({ queryKey: ["club", clubId] }),
        queryClient.invalidateQueries({ queryKey: ["my-club-ids"] }),
      ]),
  });
}
