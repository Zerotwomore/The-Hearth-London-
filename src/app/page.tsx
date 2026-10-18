"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";

export default function RootPage() {
  const router = useRouter();
  const { authReady, userId, profile, profileLoading } = useAppState();

  useEffect(() => {
    if (!authReady || profileLoading) return;
    router.replace(userId && profile?.onboardedAt ? "/events" : "/onboarding");
  }, [authReady, userId, profile, profileLoading, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="display text-2xl text-hearth-ink">The Hearth</p>
    </div>
  );
}
