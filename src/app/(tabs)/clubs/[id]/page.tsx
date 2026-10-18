import ClubDetail from "./ClubDetail";

export default async function ClubDetailPage({ params }: PageProps<"/clubs/[id]">) {
  const { id } = await params;
  return <ClubDetail id={id} />;
}
