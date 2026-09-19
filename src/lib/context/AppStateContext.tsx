"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { getConversationById } from "@/lib/data/conversations";
import { CURRENT_USER_ID, getCurrentUser } from "@/lib/data/users";
import { Message } from "@/lib/types/chat";
import { Lang, LocalizedText, pick } from "@/lib/types/i18n";
import { StringKey, t as translate } from "@/lib/i18n/strings";

interface ProfileDraft {
  name: string;
  avatarUrl: string;
  bio: string;
  verified?: boolean;
}

export type AuthProvider = "wechat" | "apple" | "email" | "guest";

interface AppState {
  lang: Lang;
  authProvider: AuthProvider | null;
  isVip: boolean;
  vipSince: string | null;
  joinedEventIds: string[];
  joinedClubIds: string[];
  selectedInterestIds: string[];
  hasOnboarded: boolean;
  profileDraft: ProfileDraft;
  /**
   * Only messages sent from this device. Seeded history always comes from the
   * fixtures, so editing them is reflected immediately rather than being
   * shadowed by saved state.
   */
  sentMessagesById: Record<string, Message[]>;
  /** Threads whose unread badge has been cleared by opening them. */
  readConversationIds: string[];
}

interface AppStateContextValue extends AppState {
  signInAs: (provider: AuthProvider) => void;
  signOut: () => void;
  startVip: () => void;
  endVip: () => void;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: StringKey) => string;
  tx: (text: LocalizedText) => string;
  toggleJoinEvent: (eventId: string) => void;
  toggleJoinClub: (clubId: string) => void;
  toggleInterest: (interestId: string) => void;
  completeOnboarding: (draft: ProfileDraft) => void;
  sendMessage: (conversationId: string, text: string) => void;
  /** Fixture history plus anything sent from this device. */
  getMessages: (conversationId: string) => Message[];
  getUnreadCount: (conversationId: string) => number;
  markConversationRead: (conversationId: string) => void;
  isEventJoined: (eventId: string) => boolean;
  isClubJoined: (clubId: string) => boolean;
}

const STORAGE_KEY = "hearth-app-state";

/**
 * Bump whenever the mock fixtures change shape or identity (e.g. the signed-in
 * user's name or avatar). Saved state from an older version is discarded rather
 * than merged, so prototype edits always show up without clearing storage.
 */
const STATE_VERSION = 8;

function defaultState(): AppState {
  return {
    lang: "en",
    authProvider: null,
    isVip: false,
    vipSince: null,
    joinedEventIds: [],
    joinedClubIds: [],
    selectedInterestIds: [],
    hasOnboarded: false,
    profileDraft: {
      name: "JJ",
      avatarUrl: "/airplane.svg",
      bio: "Young technology professional from Canada, working in London on a YMS visa, loves to walk around Canary Wharf, architecture, art galleries, and finding the best Pret a Manger sandwich.",
      verified: true,
    },
    sentMessagesById: {},
    readConversationIds: [],
  };
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Only restore state written by this version of the fixtures.
        if (saved?.version === STATE_VERSION && saved.state) {
          setState({ ...defaultState(), ...saved.state });
        }
      }
    } catch {
      // corrupt or unavailable storage — fall back to defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STATE_VERSION, state })
      );
    } catch {
      // storage unavailable — prototype still works in memory
    }
  }, [state, hydrated]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      // Prototype sign-in: adopt the mock user so the app has a populated
      // identity (profile, chat threads) without any real auth.
      signInAs: (provider) =>
        setState((prev) => {
          const mockUser = getCurrentUser();
          return {
            ...prev,
            authProvider: provider,
            hasOnboarded: true,
            profileDraft: {
              name: mockUser.name,
              avatarUrl: mockUser.avatarUrl,
              bio: mockUser.bio ? mockUser.bio[prev.lang] : "",
              verified: mockUser.verified,
            },
            selectedInterestIds:
              prev.selectedInterestIds.length > 0
                ? prev.selectedInterestIds
                : mockUser.interests,
          };
        }),
      signOut: () =>
        setState((prev) => ({
          ...defaultState(),
          lang: prev.lang,
        })),
      startVip: () =>
        setState((prev) => ({
          ...prev,
          isVip: true,
          vipSince: prev.vipSince ?? new Date().toISOString(),
        })),
      endVip: () =>
        setState((prev) => ({ ...prev, isVip: false, vipSince: null })),
      setLang: (lang) => setState((prev) => ({ ...prev, lang })),
      toggleLang: () =>
        setState((prev) => ({ ...prev, lang: prev.lang === "en" ? "zh" : "en" })),
      t: (key) => translate(key, state.lang),
      tx: (text) => pick(text, state.lang),
      toggleJoinEvent: (eventId) =>
        setState((prev) => ({
          ...prev,
          joinedEventIds: prev.joinedEventIds.includes(eventId)
            ? prev.joinedEventIds.filter((id) => id !== eventId)
            : [...prev.joinedEventIds, eventId],
        })),
      toggleJoinClub: (clubId) =>
        setState((prev) => ({
          ...prev,
          joinedClubIds: prev.joinedClubIds.includes(clubId)
            ? prev.joinedClubIds.filter((id) => id !== clubId)
            : [...prev.joinedClubIds, clubId],
        })),
      toggleInterest: (interestId) =>
        setState((prev) => ({
          ...prev,
          selectedInterestIds: prev.selectedInterestIds.includes(interestId)
            ? prev.selectedInterestIds.filter((id) => id !== interestId)
            : [...prev.selectedInterestIds, interestId],
        })),
      completeOnboarding: (draft) =>
        setState((prev) => ({
          ...prev,
          hasOnboarded: true,
          authProvider: prev.authProvider ?? "guest",
          profileDraft: draft,
        })),
      sendMessage: (conversationId, text) =>
        setState((prev) => {
          const existing = prev.sentMessagesById[conversationId] ?? [];
          const message: Message = {
            id: `local-${Date.now()}`,
            senderId: CURRENT_USER_ID,
            text,
            sentAt: new Date().toISOString(),
          };
          return {
            ...prev,
            sentMessagesById: {
              ...prev.sentMessagesById,
              [conversationId]: [...existing, message],
            },
          };
        }),
      getMessages: (conversationId) => [
        ...(getConversationById(conversationId)?.messages ?? []),
        ...(state.sentMessagesById[conversationId] ?? []),
      ],
      getUnreadCount: (conversationId) =>
        state.readConversationIds.includes(conversationId)
          ? 0
          : (getConversationById(conversationId)?.unreadCount ?? 0),
      markConversationRead: (conversationId) =>
        setState((prev) =>
          prev.readConversationIds.includes(conversationId)
            ? prev
            : {
                ...prev,
                readConversationIds: [
                  ...prev.readConversationIds,
                  conversationId,
                ],
              }
        ),
      isEventJoined: (eventId) => state.joinedEventIds.includes(eventId),
      isClubJoined: (clubId) => state.joinedClubIds.includes(clubId),
    }),
    [state]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
