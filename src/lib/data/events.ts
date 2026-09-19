import { EventItem } from "@/lib/types/event";

export const EVENTS: EventItem[] = [
  {
    id: "e1",
    title: {
      en: "National Gallery: Expert-Led Highlights Tour",
      zh: "伦敦国家美术馆 · 权威专家导览",
    },
    category: "art-culture",
    posterUrl: "https://picsum.photos/seed/hearth-gallery-poster/900/1200",
    gallery: [
      "https://picsum.photos/seed/hearth-gallery-1/800/1000",
      "https://picsum.photos/seed/hearth-gallery-2/800/1000",
      "https://picsum.photos/seed/hearth-gallery-3/800/1000",
    ],
    dateTime: "2026-09-10T15:00:00",
    endTime: "2026-09-10T17:00:00",
    location: {
      name: { en: "The National Gallery", zh: "伦敦国家美术馆" },
      area: { en: "Trafalgar Square", zh: "特拉法加广场" },
    },
    hostId: "u10",
    attendeeIds: ["u4", "u8", "u5"],
    capacity: 15,
    description: {
      en: "Too crowded at the weekend? Want the stories behind the paintings? A two-hour walk through 700 years of European painting with a history teacher who knows where to linger.",
      zh: "周末人太多？想深入了解名画背后的故事？由历史人文老师带队，两小时穿越七百年欧洲绘画史。",
    },
    highlights: [
      {
        en: "Meet the masters — Monet's Water Lilies and Turner's Fighting Temeraire, up close.",
        zh: "邂逅大师真迹 —— 近距离欣赏莫奈《睡莲》与透纳《被拖去解体的战舰无畏号》。",
      },
      {
        en: "Behind the canvas — the history and gossip behind each painting.",
        zh: "揭秘画布背后 —— 聆听艺术家与名画背后的历史趣闻。",
      },
      {
        en: "Personal VOX headset so you catch every word.",
        zh: "配备个人 VOX 耳机，不错过任何一句讲解。",
      },
      {
        en: "Thursday 3pm — deliberately off-peak, no weekend crush.",
        zh: "周四下午三点 —— 避开人潮，享受完美的艺术午后。",
      },
    ],
    price: { en: "£20 per person", zh: "£20/人" },
    vipPrice: { en: "£16 per person", zh: "£16/人" },
  },
  {
    id: "e2",
    title: {
      en: "Reading Group: NERVOUS — Anxiety & Discipline",
      zh: "读书会 NERVOUS · 焦虑与规律",
    },
    category: "reading",
    posterUrl: "https://picsum.photos/seed/hearth-reading-poster/900/1200",
    dateTime: "2026-09-11T16:30:00",
    endTime: "2026-09-11T18:00:00",
    location: {
      name: { en: "Hearth Studio", zh: "The Hearth 工作室" },
      area: { en: "Bloomsbury", zh: "布鲁姆斯伯里" },
    },
    hostId: "u5",
    attendeeIds: ["u1", "u10", "u2"],
    capacity: 12,
    description: {
      en: "Eastern and Western thinking on anxiety, routine and why we struggle to sit still. Come having read anything or nothing — the conversation matters more than the homework.",
      zh: "从东西方智慧聊焦虑、规律，以及我们为何难以静下来。读没读完都欢迎 —— 聊天比作业重要。",
    },
    highlights: [
      {
        en: "Small group, everyone speaks — no lecture, no expert at the front.",
        zh: "小组讨论，人人发言 —— 没有讲座，没有权威。",
      },
      {
        en: "Bilingual discussion, switch between 中文 and English freely.",
        zh: "中英双语讨论，随时切换。",
      },
      {
        en: "Friday 16:30, tea and something sweet included.",
        zh: "周五 16:30，含茶点。",
      },
    ],
    price: { en: "£9.90 per person", zh: "£9.9/人" },
    vipPrice: { en: "£7.90 per person", zh: "£7.9/人" },
  },
  {
    id: "e3",
    title: {
      en: "Newcomers Supper Club: Autumn Roast",
      zh: "新客晚餐会 · 秋日烤肉",
    },
    category: "dinner",
    posterUrl: "https://picsum.photos/seed/hearth-supper-poster/900/1200",
    dateTime: "2026-09-12T19:00:00",
    location: {
      name: { en: "The Ten Bells", zh: "十钟酒馆" },
      area: { en: "Shoreditch", zh: "肖尔迪奇" },
    },
    hostId: "u9",
    attendeeIds: ["u2", "u5", "u7"],
    capacity: 10,
    description: {
      en: "A relaxed, home-style roast for anyone new to London. Come solo — that's the point. Dietary needs accommodated, just tell the host.",
      zh: "为初到伦敦的人准备的家常烤肉晚餐。一个人来最好 —— 这就是重点。有饮食需求请提前告知主办人。",
    },
    highlights: [
      {
        en: "Long table, everyone introduced, no awkward hovering.",
        zh: "长桌就座，逐一介绍，不必尴尬站着。",
      },
      { en: "Three courses, wine optional.", zh: "三道菜，酒水自选。" },
      {
        en: "Half the table arrived in London this year.",
        zh: "一半的人都是今年才来伦敦。",
      },
    ],
    price: { en: "£18 per person", zh: "£18/人" },
  },
  {
    id: "e4",
    title: {
      en: "Richmond Park Sunrise Walk",
      zh: "里士满公园 · 日出漫步",
    },
    category: "outdoors",
    posterUrl: "https://picsum.photos/seed/hearth-richmond-poster/900/1200",
    dateTime: "2026-09-13T07:30:00",
    location: {
      name: { en: "Pembroke Lodge", zh: "彭布罗克小屋" },
      area: { en: "Richmond", zh: "里士满" },
    },
    hostId: "u3",
    attendeeIds: ["u1", "u6", "u8"],
    capacity: 14,
    description: {
      en: "An easy 8km loop to catch the deer waking and mist over the ponds. Bring a flask — we stop for coffee halfway.",
      zh: "轻松的八公里环线，看鹿群苏醒、薄雾笼罩池塘。带上保温杯 —— 中途会停下喝咖啡。",
    },
    highlights: [
      { en: "Flat, easy pace, no one gets left behind.", zh: "路线平缓，节奏轻松，不会掉队。" },
      { en: "Deer at close range if we're early enough.", zh: "来得够早就能近距离看到鹿。" },
      { en: "Free — just bring yourself.", zh: "免费 —— 人来就好。" },
    ],
    price: { en: "Free", zh: "免费" },
  },
  {
    id: "e5",
    title: {
      en: "Board Game Fireside: Settlers Night",
      zh: "The Hearth 桌游夜 · 卡坦岛专场",
    },
    category: "board-games",
    posterUrl: "https://picsum.photos/seed/hearth-boardgame-poster/900/1200",
    dateTime: "2026-09-15T18:30:00",
    location: {
      name: { en: "Draughts Board Game Café", zh: "Draughts 桌游咖啡" },
      area: { en: "Hackney", zh: "哈克尼" },
    },
    hostId: "u2",
    attendeeIds: ["u5", "u7", "u9", "u1"],
    capacity: 12,
    description: {
      en: "Catan, Ticket to Ride, and whatever else is on the shelf. Beginners very welcome — we'll teach you as we go.",
      zh: "卡坦岛、铁路之旅，架子上有什么玩什么。欢迎新手 —— 边玩边教。",
    },
    highlights: [
      { en: "Rules taught from scratch, no experience needed.", zh: "从零开始教规则，无需经验。" },
      { en: "Table booked for six hours, come and go.", zh: "包桌六小时，随时来去。" },
    ],
    price: { en: "£6 table fee", zh: "£6 桌费" },
  },
  {
    id: "e6",
    title: {
      en: "Clapham Common Pub Wind-Down",
      zh: "克拉彭公园 · 周末小酌",
    },
    category: "bar",
    posterUrl: "https://picsum.photos/seed/hearth-pub-poster/900/1200",
    dateTime: "2026-09-18T18:00:00",
    location: {
      name: { en: "The Sun", zh: "太阳酒馆" },
      area: { en: "Clapham", zh: "克拉彭" },
    },
    hostId: "u7",
    attendeeIds: ["u1", "u6", "u9"],
    capacity: 16,
    description: {
      en: "End-of-week pints in the garden if it's dry, inside by the fire if it isn't. Drop in, stay as long as you like.",
      zh: "周末收工小酌，天气好就在花园，下雨就坐在壁炉边。随时加入，想待多久待多久。",
    },
    highlights: [
      { en: "No booking, no pressure, come after work.", zh: "无需预约，下班后直接来。" },
      { en: "Look for the group by the fireplace.", zh: "在壁炉旁找我们。" },
    ],
    price: { en: "Pay your own way", zh: "各付各的" },
  },
  {
    id: "e7",
    title: {
      en: "Camden Live: New Voices Night",
      zh: "卡姆登现场 · 新声之夜",
    },
    category: "live-event",
    posterUrl: "https://picsum.photos/seed/hearth-live-poster/900/1200",
    dateTime: "2026-09-19T20:00:00",
    location: {
      name: { en: "The Green Note", zh: "Green Note 音乐酒吧" },
      area: { en: "Camden", zh: "卡姆登" },
    },
    hostId: "u4",
    attendeeIds: ["u8", "u3"],
    capacity: 20,
    description: {
      en: "A rotating lineup of new singer-songwriters in a tiny, cosy venue. We take the group table by the window if we arrive early.",
      zh: "小而温馨的场地，轮番上阵的新晋创作歌手。来得早就能占到窗边的大桌。",
    },
    highlights: [
      { en: "Three acts, 40 minutes each.", zh: "三组演出，每组四十分钟。" },
      { en: "Standing room, arrive by 7:45pm.", zh: "站席，建议 19:45 前到场。" },
    ],
    price: { en: "£12 per person", zh: "£12/人" },
  },
  {
    id: "e8",
    title: {
      en: "After Hours: The Wallace Collection, Privately",
      zh: "闭馆之后 · 华莱士典藏私享导览",
    },
    category: "art-culture",
    posterUrl: "https://picsum.photos/seed/hearth-afterhours-poster/900/1200",
    dateTime: "2026-09-24T18:45:00",
    endTime: "2026-09-24T20:30:00",
    location: {
      name: { en: "The Wallace Collection", zh: "华莱士典藏馆" },
      area: { en: "Marylebone", zh: "马里波恩" },
    },
    hostId: "u10",
    attendeeIds: ["u4", "u8"],
    capacity: 12,
    description: {
      en: "The galleries to ourselves after the doors close — twelve people, no crowds, a glass of something in the armoury. Members only.",
      zh: "闭馆之后的私享时光 —— 仅十二人，没有人潮，在军械厅小酌一杯。仅限会员。",
    },
    highlights: [
      {
        en: "After-hours access, twelve places only",
        zh: "闭馆后专场，仅十二个名额",
      },
      {
        en: "Curator-led route through the Great Gallery",
        zh: "策展人带队参观大画廊",
      },
      { en: "A drink in the armoury afterwards", zh: "结束后于军械厅小酌" },
    ],
    price: { en: "£38 per person", zh: "£38/人" },
    vipPrice: { en: "£30 per person", zh: "£30/人" },
    vipOnly: true,
  },
  {
    id: "e9",
    title: {
      en: "Members' Table: Dinner at The Ivy Tower Bridge",
      zh: "会员长桌 · The Ivy 塔桥店晚宴",
    },
    category: "dinner",
    posterUrl: "https://picsum.photos/seed/hearth-ivy-poster/900/1200",
    dateTime: "2026-09-27T19:00:00",
    endTime: "2026-09-27T22:00:00",
    location: {
      name: { en: "The Ivy Tower Bridge", zh: "The Ivy 塔桥店" },
      area: { en: "Tower Bridge", zh: "塔桥" },
    },
    hostId: "u9",
    attendeeIds: ["u2", "u5"],
    capacity: 10,
    description: {
      en: "One long table by the river, ten members, and the bridge lit up through the windows. Champagne on arrival, three courses, and nobody hurrying you out.",
      zh: "临河的一张长桌，十位会员，窗外是灯火通明的塔桥。入座香槟、三道式晚餐，没有人催你离席。",
    },
    highlights: [
      {
        en: "Champagne reception with river and bridge views",
        zh: "香槟迎宾，坐拥河景与塔桥夜色",
      },
      {
        en: "Three courses from the seasonal menu, wine pairing included",
        zh: "时令三道式晚餐，含配酒",
      },
      {
        en: "Private long table — ten members, bring one guest",
        zh: "专属长桌 —— 十位会员，可携伴一位",
      },
    ],
    price: { en: "£85 per person", zh: "£85/人" },
    vipPrice: { en: "£68 per person", zh: "£68/人" },
    vipOnly: true,
  },
  {
    id: "e10",
    title: {
      en: "Members' Champagne Afternoon at Sketch",
      zh: "会员香槟午后 · Sketch",
    },
    category: "dinner",
    posterUrl: "https://picsum.photos/seed/hearth-sketch-poster/900/1200",
    dateTime: "2026-10-03T15:00:00",
    endTime: "2026-10-03T17:00:00",
    location: {
      name: { en: "Sketch, The Gallery", zh: "Sketch 画廊厅" },
      area: { en: "Mayfair", zh: "梅费尔" },
    },
    hostId: "u10",
    attendeeIds: ["u4", "u8", "u2"],
    capacity: 8,
    description: {
      en: "Afternoon tea in the pink room everyone photographs, with an art historian on hand to explain the David Shrigley drawings on the walls.",
      zh: "在人人拍照的粉色厅享用下午茶，并由艺术史学者为你讲解墙上 David Shrigley 的画作。",
    },
    highlights: [
      { en: "Champagne afternoon tea for eight", zh: "八人香槟下午茶" },
      {
        en: "A short talk on the room's artwork",
        zh: "关于厅内艺术作品的小型导览",
      },
      { en: "Members only, eight places", zh: "仅限会员，八个名额" },
    ],
    price: { en: "£95 per person", zh: "£95/人" },
    vipPrice: { en: "£76 per person", zh: "£76/人" },
    vipOnly: true,
  },
];

export function getEventById(id: string): EventItem | undefined {
  return EVENTS.find((event) => event.id === id);
}
