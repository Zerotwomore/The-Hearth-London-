import { CLUBS } from "@/lib/data/clubs";
import ClubDetail from "./ClubDetail";

export function generateStaticParams() {
  return CLUBS.map((club) => ({ id: club.id }));
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClubDetail id={id} />;
}
