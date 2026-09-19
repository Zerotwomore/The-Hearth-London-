import { LocalizedText } from "@/lib/types/i18n";

export interface ClubPost {
  id: string;
  authorId: string;
  content: LocalizedText;
  createdAt: string;
}

export interface Club {
  id: string;
  name: LocalizedText;
  category: LocalizedText;
  imageUrl: string;
  description: LocalizedText;
  memberIds: string[];
  posts: ClubPost[];
}
