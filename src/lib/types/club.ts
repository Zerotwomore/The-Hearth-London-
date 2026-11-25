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
  /** Posted content, as written — not translated (see `original`). */
  name: string;
  /** A UI label, translated like event categories. */
  category: LocalizedText;
  imageUrl: string;
  description: string;
  /** Empty when signed out — membership lists are only visible to members. */
  members: Profile[];
}

export interface ClubDetailItem extends Club {
  posts: ClubPost[];
}
