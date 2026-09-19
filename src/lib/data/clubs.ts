import { Club } from "@/lib/types/club";

export const CLUBS: Club[] = [
  {
    id: "c1",
    name: { en: "Gallery Wanderers", zh: "看展小队" },
    category: { en: "Art & Culture", zh: "艺术文化" },
    imageUrl: "https://picsum.photos/seed/hearth-club-gallery/900/1200",
    description: {
      en: "Expert-led tours and slow afternoons in London's museums. Roughly one gallery a fortnight, always off-peak.",
      zh: "由专家带队的美术馆导览与悠闲午后。大约两周一馆，永远避开人潮。",
    },
    memberIds: ["u10", "u4", "u8", "u1", "u5"],
    posts: [
      {
        id: "p1",
        authorId: "u10",
        content: {
          en: "Next month: the Courtauld, focusing on the Impressionist room. 12 spots.",
          zh: "下个月去考陶德美术馆，重点看印象派展厅，限 12 人。",
        },
        createdAt: "2026-09-02T10:15:00",
      },
      {
        id: "p2",
        authorId: "u8",
        content: {
          en: "Photos from the National Gallery walk are up — the Turner room was worth the early start.",
          zh: "国家美术馆导览的照片已上传 —— 透纳展厅值得早起。",
        },
        createdAt: "2026-08-28T21:40:00",
      },
    ],
  },
  {
    id: "c2",
    name: { en: "The Reading Room", zh: "读书会" },
    category: { en: "Books & Ideas", zh: "书与思想" },
    imageUrl: "https://picsum.photos/seed/hearth-club-reading/900/1200",
    description: {
      en: "Bilingual reading group meeting Fridays. East and West on one table — philosophy, fiction, and whatever's bothering us.",
      zh: "每周五的中英双语读书会。东西方同桌 —— 哲学、小说，以及最近困扰我们的一切。",
    },
    memberIds: ["u5", "u1", "u10", "u2"],
    posts: [
      {
        id: "p3",
        authorId: "u5",
        content: {
          en: "This Friday: NERVOUS — anxiety and discipline. Read the first three chapters if you can.",
          zh: "本周五主题：NERVOUS 焦虑与规律。可以的话读完前三章。",
        },
        createdAt: "2026-09-03T08:00:00",
      },
      {
        id: "p4",
        authorId: "u1",
        content: {
          en: "First session last week was genuinely the best conversation I've had since moving here.",
          zh: "上周第一次参加，是我搬来伦敦后聊得最好的一次。",
        },
        createdAt: "2026-08-30T17:20:00",
      },
    ],
  },
  {
    id: "c3",
    name: { en: "Newcomers Supper Club", zh: "新客晚餐会" },
    category: { en: "Food & Drink", zh: "美食与酒" },
    imageUrl: "https://picsum.photos/seed/hearth-club-supper/900/1200",
    description: {
      en: "Monthly dinners for people who've just landed in London and want a table full of familiar strangers.",
      zh: "为刚落地伦敦的人准备的每月晚餐 —— 一桌熟悉的陌生人。",
    },
    memberIds: ["u9", "u2", "u5", "u7", "u1"],
    posts: [
      {
        id: "p5",
        authorId: "u9",
        content: {
          en: "Booked Rochelle Canteen for next month — 8 spots, first come first served.",
          zh: "下个月订了 Rochelle Canteen，8 个名额，先到先得。",
        },
        createdAt: "2026-09-01T12:00:00",
      },
      {
        id: "p6",
        authorId: "u7",
        content: {
          en: "Last night's roast was so good. Already counting down to the next one.",
          zh: "昨晚的烤肉太好吃了，已经在期待下一次。",
        },
        createdAt: "2026-08-26T19:05:00",
      },
    ],
  },
  {
    id: "c4",
    name: { en: "London Trail Walkers", zh: "伦敦徒步小组" },
    category: { en: "Outdoors", zh: "户外" },
    imageUrl: "https://picsum.photos/seed/hearth-club-walkers/900/1200",
    description: {
      en: "Weekend walks around London's parks and green spaces. All paces welcome, coffee always at the end.",
      zh: "周末在伦敦公园与绿地漫步。各种速度都欢迎，结束后一定喝咖啡。",
    },
    memberIds: ["u3", "u1", "u6", "u8"],
    posts: [
      {
        id: "p7",
        authorId: "u3",
        content: {
          en: "Sunrise walk Sunday in Richmond Park — Pembroke Lodge, 7:30am sharp.",
          zh: "周日里士满公园日出漫步 —— 彭布罗克小屋，7:30 准时出发。",
        },
        createdAt: "2026-09-04T08:30:00",
      },
      {
        id: "p8",
        authorId: "u6",
        content: {
          en: "Anyone up for something longer this month? Thinking Epping Forest.",
          zh: "这个月有人想走长一点的吗？在考虑埃平森林。",
        },
        createdAt: "2026-08-29T17:20:00",
      },
    ],
  },
];

export function getClubById(id: string): Club | undefined {
  return CLUBS.find((club) => club.id === id);
}
