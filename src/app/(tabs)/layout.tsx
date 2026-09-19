"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inConversation = /^\/chat\/[^/]+$/.test(pathname);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-1 flex-col bg-hearth-cream">
      <div className="flex flex-1 flex-col">{children}</div>
      {!inConversation && <BottomNav />}
    </div>
  );
}
