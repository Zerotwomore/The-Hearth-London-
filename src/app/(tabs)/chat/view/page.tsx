"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Conversation from "./Conversation";

// One static page for every chat: the id comes from ?id=…
// (see lib/routes.ts).
function FromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <Conversation key={id} id={id} />;
}

export default function Page() {
  // useSearchParams needs a Suspense boundary in a statically exported page.
  return (
    <Suspense>
      <FromQuery />
    </Suspense>
  );
}
