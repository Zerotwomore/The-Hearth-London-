// Deletes chat images for events that ended more than 30 days ago.
//
// Called daily by pg_cron (see migrations/*_chat_media_cleanup.sql) with
// `Authorization: Bearer <CRON_SECRET>`. JWT verification is switched off for
// this function in config.toml because that header is not a JWT; the shared
// secret check below replaces it.

import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "chat-media";
// Storage's remove() accepts at most 1,000 paths per call.
const REMOVE_BATCH = 1000;

interface DueConversation {
  conversation_id: string;
  paths: string[];
}

function isAuthorized(req: Request): boolean {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret) return false;
  const given = new TextEncoder().encode(req.headers.get("Authorization") ?? "");
  const expected = new TextEncoder().encode(`Bearer ${secret}`);
  if (given.length !== expected.length) return false;
  // Constant-time comparison, so the secret can't be guessed byte by byte.
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given[i] ^ expected[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (!isAuthorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase.rpc("chat_media_due_for_cleanup");
  if (error) {
    console.error("chat_media_due_for_cleanup failed", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const due = (data ?? []) as DueConversation[];
  let filesRemoved = 0;
  const failed: string[] = [];

  for (const { conversation_id, paths } of due) {
    let ok = true;
    for (let i = 0; i < paths.length; i += REMOVE_BATCH) {
      const batch = paths.slice(i, i + REMOVE_BATCH);
      const { error: removeError } = await supabase.storage.from(BUCKET).remove(batch);
      if (removeError) {
        console.error(`remove failed for ${conversation_id}`, removeError);
        ok = false;
        break;
      }
      filesRemoved += batch.length;
    }

    // Only mark messages expired once their files are really gone; a failed
    // conversation is simply picked up again tomorrow.
    if (!ok) {
      failed.push(conversation_id);
      continue;
    }
    const { error: markError } = await supabase.rpc("mark_chat_media_expired", {
      p_conversation_id: conversation_id,
    });
    if (markError) {
      console.error(`mark_chat_media_expired failed for ${conversation_id}`, markError);
      failed.push(conversation_id);
    }
  }

  return Response.json({
    conversations: due.length,
    filesRemoved,
    failed,
  });
});
