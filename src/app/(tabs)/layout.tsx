"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { useAppState } from "@/lib/context/AppStateContext";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAppState();
  const inConversation = pathname.startsWith("/chat/view");

  // Members finish onboarding (name, interests) before using the app.
  useEffect(() => {
    if (profile && !profile.onboardedAt) router.replace("/onboarding");
  }, [profile, router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-1 flex-col bg-hearth-cream">
      <div className="flex flex-1 flex-col">{children}</div>
      {!inConversation && <BottomNav />}
    </div>
  );
}
