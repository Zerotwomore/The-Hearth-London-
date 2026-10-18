import Conversation from "./Conversation";

export default async function ConversationPage({ params }: PageProps<"/chat/[id]">) {
  const { id } = await params;
  return <Conversation id={id} />;
}
