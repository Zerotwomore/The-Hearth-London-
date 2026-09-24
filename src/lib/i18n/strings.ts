import { Lang } from "@/lib/types/i18n";

export const STRINGS = {
  brand: { en: "The Hearth", zh: "The Hearth" },
  brandFull: { en: "The Hearth London", zh: "The Hearth London" },
  tagline: {
    en: "Gather around something worth talking about.",
    zh: "围炉相聚，聊点值得聊的。",
  },

  // Navigation
  navEvents: { en: "Events", zh: "活动" },
  navClubs: { en: "Clubs", zh: "社群" },
  navChat: { en: "Chat", zh: "消息" },
  navProfile: { en: "Profile", zh: "我的" },

  // Events
  eventsTitle: { en: "What's on", zh: "近期活动" },
  eventsSubtitle: { en: "London · this fortnight", zh: "伦敦 · 近两周" },
  searchPlaceholder: { en: "Search events", zh: "搜索活动" },
  allCategories: { en: "All", zh: "全部" },
  going: { en: "going", zh: "人已报名" },
  spotsLeft: { en: "spots left", zh: "个名额" },
  hostedBy: { en: "Hosted by", zh: "主办人" },
  whatYouGet: { en: "What you'll experience", zh: "活动亮点" },
  aboutEvent: { en: "About this event", zh: "活动详情" },
  attendees: { en: "Who's coming", zh: "参与成员" },
  join: { en: "Join this event", zh: "报名参加" },
  joined: { en: "You're going", zh: "已报名" },
  requestJoin: { en: "Request to join", zh: "申请加入" },
  noEvents: { en: "No events match that search.", zh: "没有找到相关活动。" },

  // Clubs
  clubsTitle: { en: "Clubs", zh: "社群" },
  clubsSubtitle: { en: "Find your people", zh: "找到同好" },
  members: { en: "members", zh: "位成员" },
  joinClub: { en: "Join club", zh: "加入社群" },
  joinedClub: { en: "Joined", zh: "已加入" },
  clubPosts: { en: "Recent posts", zh: "最新动态" },
  aboutClub: { en: "About", zh: "社群介绍" },

  // Chat
  chatTitle: { en: "Messages", zh: "消息" },
  messagePlaceholder: { en: "Write a message", zh: "输入消息" },
  eventGroup: { en: "Event group", zh: "活动群聊" },
  groupMembers: { en: "members", zh: "位成员" },
  viewEvent: { en: "View event", zh: "查看活动" },
  you: { en: "You", zh: "我" },
  send: { en: "Send", zh: "发送" },
  noMessages: { en: "No messages yet.", zh: "还没有消息。" },

  // Profile
  profileTitle: { en: "Profile", zh: "我的" },
  yourInterests: { en: "Your interests", zh: "我的兴趣" },
  upcomingEvents: { en: "Your upcoming events", zh: "我的活动" },
  yourClubs: { en: "Your clubs", zh: "我的社群" },
  eventsJoined: { en: "Events", zh: "活动" },
  clubsJoined: { en: "Clubs", zh: "社群" },
  editProfile: { en: "Edit profile", zh: "编辑资料" },
  noJoinedEvents: {
    en: "Nothing booked yet — browse what's on.",
    zh: "还没有报名的活动，去看看吧。",
  },
  noJoinedClubs: {
    en: "You haven't joined a club yet.",
    zh: "还没有加入任何社群。",
  },
  browseEvents: { en: "Browse events", zh: "浏览活动" },
  browseClubs: { en: "Browse clubs", zh: "浏览社群" },
  language: { en: "Language", zh: "语言" },

  // Onboarding / auth
  welcomeTitle: {
    en: "Welcome to The Hearth London",
    zh: "欢迎来到“The Hearth London”",
  },
  welcomeBody: {
    en: "Gallery tours, reading groups, supper clubs and long walks — for people making London home.",
    zh: "美术馆导览、读书会、晚餐聚会与城市漫步 —— 为正在把伦敦变成家的人而设。",
  },
  getStarted: { en: "Get started", zh: "开始" },
  haveAccount: { en: "I already have an account", zh: "我已有账号" },
  continue: { en: "Continue", zh: "继续" },
  back: { en: "Back", zh: "返回" },
  finish: { en: "Enter The Hearth", zh: "进入 The Hearth" },
  allSet: { en: "You're all set", zh: "一切就绪" },
  allSetBody: {
    en: "Your account is verified. We'll show you gatherings around London worth leaving the house for.",
    zh: "账号验证完成。我们会为你推荐伦敦值得出门的聚会。",
  },

  // Onboarding steps
  yourName: { en: "What should we call you?", zh: "怎么称呼你？" },
  yourNameHint: {
    en: "This is the name others see on events.",
    zh: "其他人在活动中会看到这个名字。",
  },
  namePlaceholder: { en: "Your name", zh: "你的名字" },
  pickAvatar: { en: "Pick a photo", zh: "选择头像" },
  interestsTitle: { en: "What are you into?", zh: "你对什么感兴趣？" },
  interestsHint: { en: "Choose at least one", zh: "至少选择一项" },

  logIn: { en: "Log in", zh: "登录" },
  signUp: { en: "Sign up", zh: "注册" },
  email: { en: "Email", zh: "邮箱" },
  password: { en: "Password", zh: "密码" },
  continueAsGuest: { en: "Continue as guest", zh: "以访客身份继续" },
  noAccount: { en: "New here?", zh: "第一次来？" },
  hasAccount: { en: "Already a member?", zh: "已经是会员？" },

  // SSO
  continueWithWechat: { en: "Continue with WeChat", zh: "微信登录" },
  continueWithApple: { en: "Continue with Apple", zh: "通过 Apple 登录" },
  orDivider: { en: "or", zh: "或" },
  ssoMockNote: {
    en: "Prototype — no real accounts will connect",
    zh: "原型演示 —— 不会连接任何真实账号",
  },
  connecting: { en: "Connecting…", zh: "连接中…" },
  signedInWith: { en: "Signed in with", zh: "登录方式" },
  signOut: { en: "Sign out", zh: "退出登录" },
  providerWechat: { en: "WeChat", zh: "微信" },
  providerApple: { en: "Apple", zh: "Apple" },
  providerEmail: { en: "Email", zh: "邮箱" },
  providerGuest: { en: "Guest", zh: "访客" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang] || STRINGS[key].en;
}
