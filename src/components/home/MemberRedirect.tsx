"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";

/**
 * The home page is a public landing page. Signed-in members go straight on
 * to the app (or to finish onboarding); everyone else just stays and reads.
 */
export function MemberRedirect() {
  const router = useRouter();
  const { authReady, userId, profile, profileLoading } = useAppState();

  useEffect(() => {
    if (!authReady || profileLoading || !userId || !profile) return;
    router.replace(profile.onboardedAt ? "/events" : "/onboarding");
  }, [authReady, userId, profile, profileLoading, router]);

  return null;
}
