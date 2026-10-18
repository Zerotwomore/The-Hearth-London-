"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EventDetail from "./EventDetail";

// One static page for every event: the id comes from ?id=…
// (see lib/routes.ts).
function FromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <EventDetail key={id} id={id} />;
}

export default function Page() {
  // useSearchParams needs a Suspense boundary in a statically exported page.
  return (
    <Suspense>
      <FromQuery />
    </Suspense>
  );
}
