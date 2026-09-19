import { User } from "@/lib/types/user";

export const CURRENT_USER_ID = "u1";

export const USERS: User[] = [
  {
    id: "u1",
    name: "JJ",
    nameZh: "JJ",
    avatarUrl: "/airplane.svg",
    bio: {
      en: "Young technology professional from Canada, working in London on a YMS visa, loves to walk around Canary Wharf, architecture, art galleries, and finding the best Pret a Manger sandwich.",
      zh: "来自加拿大的青年科技从业者，持 YMS 签证在伦敦工作，喜欢在金丝雀码头散步、看建筑、逛美术馆，以及寻找最好吃的 Pret a Manger 三明治。",
    },
    interests: ["art-culture", "hiking", "photography"],
    joinedAt: "2026-06-02",
    verified: true,
  },
  {
    id: "u2",
    name: "Priya Nair",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    bio: {
      en: "Board games and bad wine. Moved from Toronto last year.",
      zh: "桌游爱好者，去年从多伦多搬来。",
    },
    interests: ["board-games", "wine-tasting"],
    joinedAt: "2025-11-14",
  },
  {
    id: "u3",
    name: "Tom Whitfield",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    bio: {
      en: "Walking club regular, always looking for new trails.",
      zh: "徒步常客，一直在找新路线。",
    },
    interests: ["hiking", "running"],
    joinedAt: "2025-09-21",
  },
  {
    id: "u4",
    name: "Yuki Tanaka",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    bio: {
      en: "Here for the gigs and the museums.",
      zh: "为了看演出和逛博物馆而来。",
    },
    interests: ["live-music", "art-culture"],
    joinedAt: "2026-01-08",
  },
  {
    id: "u5",
    name: "ZZ",
    nameZh: "ZZ",
    avatarUrl: "/paddington.svg",
    bio: {
      en: "Runs the Friday reading group. Fluent in bad puns.",
      zh: "周五读书会主理人，冷笑话十级。",
    },
    interests: ["language-exchange", "reading"],
    joinedAt: "2025-08-30",
    verified: true,
  },
  {
    id: "u6",
    name: "Daniel Osei",
    avatarUrl: "https://i.pravatar.cc/150?img=51",
    bio: {
      en: "Cycling every weekend, rain or shine.",
      zh: "每个周末都骑车，风雨无阻。",
    },
    interests: ["cycling", "running"],
    joinedAt: "2026-03-17",
  },
  {
    id: "u7",
    name: "Emma Clarke",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
    bio: {
      en: "Pub quiz captain. Undefeated since March.",
      zh: "酒吧问答队长，三月以来未尝败绩。",
    },
    interests: ["pub-quiz", "food-drink"],
    joinedAt: "2025-12-05",
  },
  {
    id: "u8",
    name: "Marcus Lee",
    nameZh: "李明",
    avatarUrl: "https://randomuser.me/api/portraits/men/4.jpg",
    bio: {
      en: "Photographer chasing golden hour across the city.",
      zh: "摄影师，专拍伦敦的黄昏时刻。",
    },
    interests: ["photography", "art-culture"],
    joinedAt: "2026-02-19",
  },
  {
    id: "u9",
    name: "Hana Kim",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    bio: {
      en: "Recently arrived from Seoul, love a good supper club.",
      zh: "刚从首尔搬来，最爱晚餐聚会。",
    },
    interests: ["food-drink", "wine-tasting"],
    joinedAt: "2026-05-11",
    verified: true,
  },
  {
    id: "u10",
    name: "Wen Zhao",
    nameZh: "赵文",
    avatarUrl: "https://randomuser.me/api/portraits/women/85.jpg",
    bio: {
      en: "History teacher. I run the gallery tours — 700 years in two hours.",
      zh: "历史人文老师，带你两小时穿越七百年绘画史。",
    },
    interests: ["art-culture", "reading"],
    joinedAt: "2025-07-04",
    verified: true,
  },
];

export function getUserById(id: string): User | undefined {
  return USERS.find((user) => user.id === id);
}

export function getCurrentUser(): User {
  const user = getUserById(CURRENT_USER_ID);
  if (!user) throw new Error("Current user fixture missing");
  return user;
}
