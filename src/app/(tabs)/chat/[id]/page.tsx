import { CONVERSATIONS } from "@/lib/data/conversations";
import Conversation from "./Conversation";

export function generateStaticParams() {
  return CONVERSATIONS.map((conversation) => ({ id: conversation.id }));
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Conversation id={id} />;
}
