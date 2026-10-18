"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/lib/api/supabase";
import { fetchOwnProfile, saveLanguage } from "@/lib/api/profile";
import { Lang, LocalizedText, pick } from "@/lib/types/i18n";
import { OwnProfile } from "@/lib/types/user";
import { StringKey, t as translate } from "@/lib/i18n/strings";

interface AppStateContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: StringKey) => string;
  tx: (text: LocalizedText) => string;
  /** False until the saved session has been checked; avoid redirecting before then. */
  authReady: boolean;
  userId: string | null;
  email: string | null;
  /** The signed-in member's profile; null when signed out or still loading. */
  profile: OwnProfile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

// The language choice lives in localStorage. Reading it through
// useSyncExternalStore keeps the server render ("en") and the first browser
// render in agreement, then switches without a hydration mismatch.
const LANG_KEY = "hearth-lang";
const langListeners = new Set<() => void>();

function readStoredLang(): Lang | null {
  try {
    const value = window.localStorage.getItem(LANG_KEY);
    return value === "en" || value === "zh" ? value : null;
  } catch {
    return null;
  }
}

function storeLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // storage unavailable — the choice lasts for this visit only
  }
  langListeners.forEach((listener) => listener());
}

function subscribeLang(listener: () => void) {
  langListeners.add(listener);
  return () => langListeners.delete(listener);
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Prototype builds kept everything in this key; it is no longer used.
    try {
      window.localStorage.removeItem("hearth-app-state");
    } catch {
      // ignore
    }
    if (!isSupabaseConfigured) return;
    // Fires immediately with the saved session (INITIAL_SESSION), then on
    // every sign-in, sign-out and token refresh.
    const { data } = supabase().auth.onAuthStateChange((event, session) => {
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      if (event === "SIGNED_OUT") queryClient.clear();
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const profileQuery = useQuery({
    queryKey: ["own-profile", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchOwnProfile(userId!),
  });
  const profile = profileQuery.data ?? null;

  const storedLang = useSyncExternalStore(subscribeLang, readStoredLang, () => null);
  const lang: Lang = storedLang ?? profile?.lang ?? "en";

  const setLang = useCallback(
    (next: Lang) => {
      storeLang(next);
      if (userId) void saveLanguage(userId, next);
    },
    [userId]
  );

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["own-profile"] });
  }, [queryClient]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "zh" : "en"),
      t: (key) => translate(key, lang),
      tx: (text) => pick(text, lang),
      authReady,
      userId,
      email,
      profile,
      profileLoading: Boolean(userId) && profileQuery.isPending,
      refreshProfile,
    }),
    [
      lang,
      setLang,
      authReady,
      userId,
      email,
      profile,
      profileQuery.isPending,
      refreshProfile,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
