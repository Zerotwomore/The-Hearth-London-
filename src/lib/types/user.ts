import { Lang } from "@/lib/types/i18n";

/** A member as other people see them. */
export interface Profile {
  id: string;
  name: string;
  nameZh?: string;
  avatarUrl?: string;
  /** Written by the member in whatever language they chose — never translated. */
  bio?: string;
  /** Verified members — hosts and confirmed accounts. Set by staff. */
  verified: boolean;
}

/** The signed-in member's own profile, with the fields only they need. */
export interface OwnProfile extends Profile {
  avatarPath?: string;
  lang: Lang;
  /** Null until the member has finished onboarding. */
  onboardedAt: string | null;
  interestIds: string[];
}
