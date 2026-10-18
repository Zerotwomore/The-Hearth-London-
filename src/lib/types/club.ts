import { LocalizedText } from "@/lib/types/i18n";
import { Profile } from "@/lib/types/user";

export interface ClubPost {
  id: string;
  /** Written by the member in whatever language they chose — never translated. */
  body: string;
  createdAt: string;
  author?: Profile;
}

export interface Club {
  id: string;
  name: LocalizedText;
  category: LocalizedText;
  imageUrl: string;
  description: LocalizedText;
  /** Empty when signed out — membership lists are only visible to members. */
  members: Profile[];
}

export interface ClubDetailItem extends Club {
  posts: ClubPost[];
}
