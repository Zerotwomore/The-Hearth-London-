"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppStateProvider } from "@/lib/context/AppStateContext";
import { useChatRealtime } from "@/lib/api/chat";

function ChatRealtime() {
  useChatRealtime();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <ChatRealtime />
        {children}
      </AppStateProvider>
    </QueryClientProvider>
  );
}
