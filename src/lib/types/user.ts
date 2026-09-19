import { LocalizedText } from "@/lib/types/i18n";

export interface User {
  id: string;
  name: string;
  nameZh?: string;
  avatarUrl: string;
  bio?: LocalizedText;
  interests: string[];
  joinedAt: string;
  /** Verified members — hosts and confirmed accounts. */
  verified?: boolean;
}
