import { Lang } from "@/lib/types/i18n";

export const STRINGS = {
  brandFull: { en: "The Hearth London", zh: "The Hearth London" },

  // General
  loading: { en: "Loading…", zh: "加载中…" },
  retry: { en: "Try again", zh: "重试" },
  errorLoading: {
    en: "Couldn't load this. Check your connection and try again.",
    zh: "加载失败，请检查网络后重试。",
  },
  saving: { en: "Saving…", zh: "保存中…" },
  saveChanges: { en: "Save changes", zh: "保存修改" },
  formerMember: { en: "Former member", zh: "已注销用户" },

  // Errors
  errorGeneric: { en: "Something went wrong. Please try again.", zh: "出了点问题，请重试。" },
  errorOffline: { en: "You seem to be offline.", zh: "网络似乎已断开。" },
  errorNotFound: { en: "We couldn't find that.", zh: "没有找到相关内容。" },
  errorSignInRequired: { en: "Please log in first.", zh: "请先登录。" },
  errorEventFull: { en: "Sorry — this event is full.", zh: "抱歉，活动名额已满。" },
  errorEventStarted: { en: "This event has already started.", zh: "活动已经开始。" },
  errorRequestDeclined: {
    en: "The host declined your request for this event.",
    zh: "主办人未通过你的报名申请。",
  },
  errorRateLimited: {
    en: "You're sending messages too quickly. Wait a moment.",
    zh: "发送太频繁了，请稍等片刻。",
  },
  errorImageLimit: {
    en: "You've reached today's limit of 20 photos.",
    zh: "今天已达到 20 张图片的上限。",
  },
  errorInvalidLogin: { en: "That email or password isn't right.", zh: "邮箱或密码不正确。" },
  errorEmailNotConfirmed: {
    en: "Please confirm your email first — check your inbox.",
    zh: "请先验证邮箱，查看收件箱中的邮件。",
  },
  errorEmailTaken: { en: "An account with this email already exists.", zh: "该邮箱已注册。" },
  errorWeakPassword: { en: "Choose a stronger password.", zh: "请设置更安全的密码。" },
  errorTooManyEmails: {
    en: "Too many emails sent. Try again in a little while.",
    zh: "发送邮件过于频繁，请稍后再试。",
  },
  errorTooManyAttempts: {
    en: "Too many attempts. Try again shortly.",
    zh: "尝试次数过多，请稍后再试。",
  },
  errorSamePassword: {
    en: "Choose a password different from your current one.",
    zh: "新密码不能与当前密码相同。",
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
  join: { en: "Ask to join", zh: "申请参加" },
  requestSent: { en: "Request sent", zh: "已申请" },
  withdrawRequest: { en: "Withdraw", zh: "撤回申请" },
  requestPendingNote: {
    en: "The host will accept or decline your request.",
    zh: "主办人会审核你的申请。",
  },
  requestDeclined: { en: "The host declined your request", zh: "主办人未通过你的申请" },
  hostApprovesNote: {
    en: "The host approves everyone who joins.",
    zh: "所有报名需经主办人同意。",
  },
  joinRequests: { en: "Requests to join", zh: "报名申请" },
  noJoinRequests: { en: "No requests waiting.", zh: "暂无待处理的申请。" },
  accept: { en: "Accept", zh: "同意" },
  decline: { en: "Decline", zh: "拒绝" },
  joined: { en: "You're going", zh: "已报名" },
  noEvents: { en: "No events match that search.", zh: "没有找到相关活动。" },
  noUpcomingEvents: {
    en: "No events coming up yet — check back soon.",
    zh: "暂时还没有活动，敬请期待。",
  },
  eventNotFound: {
    en: "This event doesn't exist or has been removed.",
    zh: "活动不存在或已被删除。",
  },
  leaveEvent: { en: "Cancel my place", zh: "取消报名" },
  hosting: { en: "You're hosting this event", zh: "你是本场活动的主办人" },
  eventFull: { en: "This event is full", zh: "名额已满" },
  eventStarted: { en: "This event has started", zh: "活动已开始" },
  logInToJoin: { en: "Log in to join", zh: "登录后报名" },
  payAtEvent: { en: "Pay at the event", zh: "现场付款" },
  openGroupChat: { en: "Open the group chat", zh: "进入活动群聊" },
  logInToSeeAttendees: { en: "Log in to see who's coming.", zh: "登录后查看参与成员。" },

  // Hosting
  hostEvent: { en: "Host an event", zh: "发起活动" },
  hostShort: { en: "Host", zh: "发起" },
  hostEventIntro: {
    en: "Every event is checked by The Hearth team before it goes live.",
    zh: "所有活动都会经过 The Hearth 团队审核后才会发布。",
  },
  activeEventCount: { en: "active events", zh: "个进行中的活动" },
  eventLimitReached: {
    en: "You have 20 active events — the most you can host at once. You can host another once one has ended.",
    zh: "你已有 20 个进行中的活动，已达上限。待其中一个结束后即可再发起。",
  },
  posterLabel: { en: "Poster", zh: "海报" },
  posterHint: { en: "Portrait works best — it's cropped to 3:4.", zh: "建议竖版图片，将裁剪为 3:4。" },
  choosePoster: { en: "Choose a poster", zh: "选择海报" },
  changePoster: { en: "Change poster", zh: "更换海报" },
  eventTitleLabel: { en: "Title", zh: "活动名称" },
  categoryLabel: { en: "Category", zh: "类别" },
  dateLabel: { en: "Date", zh: "日期" },
  startTimeLabel: { en: "Starts", zh: "开始时间" },
  endTimeLabel: { en: "Ends (optional)", zh: "结束时间（可选）" },
  venueLabel: { en: "Venue", zh: "地点" },
  venuePlaceholder: { en: "e.g. The Hearth, 12 Greek St", zh: "例如：The Hearth，12 Greek St" },
  areaLabel: { en: "Area", zh: "区域" },
  areaPlaceholder: { en: "e.g. Soho", zh: "例如：Soho" },
  capacityLabel: { en: "Places", zh: "名额" },
  capacityHint: { en: "Not counting you — up to 200.", zh: "不含你本人，最多 200。" },
  priceLabel: { en: "Price per person (£)", zh: "每人费用（£）" },
  priceHint: { en: "Leave at 0 for free. Guests pay you at the event.", zh: "免费请填 0。参与者现场向你付款。" },
  descriptionLabel: { en: "About the event", zh: "活动介绍" },
  submitForReview: { en: "Submit for review", zh: "提交审核" },
  publishEvent: { en: "Publish event", zh: "发布活动" },
  submitting: { en: "Submitting…", zh: "提交中…" },
  errorStartInPast: { en: "Pick a start time in the future.", zh: "请选择未来的开始时间。" },
  errorEndTooLong: { en: "Events can last up to 2 days.", zh: "活动时长最多 2 天。" },
  logInToHost: { en: "Log in to host an event.", zh: "登录后发起活动。" },

  // Review status
  statusPending: { en: "Awaiting approval", zh: "待审核" },
  statusRejected: { en: "Not approved", zh: "未通过" },
  pendingNotice: {
    en: "This event is waiting for approval. Only you and the admins can see it.",
    zh: "活动正在等待审核，目前只有你和管理员可以看到。",
  },
  rejectedNotice: {
    en: "This event wasn't approved, so it isn't listed.",
    zh: "活动未通过审核，不会公开展示。",
  },
  reviewNoteLabel: { en: "Note from the team", zh: "团队留言" },
  yourHostedEvents: { en: "Events you're hosting", zh: "我发起的活动" },
  noHostedEvents: { en: "You aren't hosting anything yet.", zh: "你还没有发起活动。" },

  // Admin review
  reviewEvents: { en: "Review events", zh: "审核活动" },
  reviewQueueEmpty: { en: "Nothing waiting for review.", zh: "暂无待审核的活动。" },
  approve: { en: "Approve", zh: "通过" },
  reject: { en: "Reject", zh: "拒绝" },
  rejectNotePlaceholder: {
    en: "Optional note to the host",
    zh: "给主办人的留言（可选）",
  },
  confirmReject: { en: "Reject event", zh: "确认拒绝" },
  cancel: { en: "Cancel", zh: "取消" },
  adminsOnly: { en: "Only admins can review events.", zh: "只有管理员可以审核活动。" },
  submittedBy: { en: "Submitted by", zh: "提交人" },
  errorEventLimit: {
    en: "You already have 20 active events, the most you can host at once.",
    zh: "你已有 20 个进行中的活动，已达上限。",
  },
  errorInvalidEvent: {
    en: "Some details aren't valid. Check the form and try again.",
    zh: "部分信息无效，请检查后重试。",
  },
  errorNotAllowed: { en: "You don't have permission to do that.", zh: "你没有权限执行此操作。" },

  // Clubs
  clubsTitle: { en: "Clubs", zh: "社群" },
  clubsSubtitle: { en: "Find your people", zh: "找到同好" },
  members: { en: "members", zh: "位成员" },
  joinClub: { en: "Join club", zh: "加入社群" },
  joinedClub: { en: "Joined", zh: "已加入" },
  clubPosts: { en: "Recent posts", zh: "最新动态" },
  aboutClub: { en: "About", zh: "社群介绍" },
  leaveClub: { en: "Leave club", zh: "退出社群" },
  logInToJoinClub: { en: "Log in to join", zh: "登录后加入" },
  noClubs: { en: "No clubs yet — check back soon.", zh: "暂时还没有社群，敬请期待。" },
  noPosts: { en: "No posts yet.", zh: "还没有动态。" },
  clubNotFound: {
    en: "This club doesn't exist or has been removed.",
    zh: "社群不存在或已被删除。",
  },

  // Chat
  chatTitle: { en: "Messages", zh: "消息" },
  messagePlaceholder: { en: "Write a message", zh: "输入消息" },
  eventGroup: { en: "Event group", zh: "活动群聊" },
  groupMembers: { en: "members", zh: "位成员" },
  viewEvent: { en: "View event", zh: "查看活动" },
  you: { en: "You", zh: "我" },
  send: { en: "Send", zh: "发送" },
  noMessages: { en: "No messages yet.", zh: "还没有消息。" },
  noChats: {
    en: "Join an event to chat with everyone going.",
    zh: "报名活动后即可与其他参与者聊天。",
  },
  chatClosed: {
    en: "This chat is now read-only — it closed a week after the event.",
    zh: "群聊已在活动结束一周后关闭，仅可查看。",
  },
  chatNotFound: {
    en: "This chat doesn't exist, or you're not part of the event.",
    zh: "群聊不存在，或你未参加该活动。",
  },
  photo: { en: "Photo", zh: "图片" },
  logInForChat: { en: "Log in to see your event chats.", zh: "登录后查看活动群聊。" },
  logInForProfile: { en: "Log in to see your profile.", zh: "登录后查看个人资料。" },

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

  // Onboarding / auth
  welcomeTitle: {
    en: "Welcome to The Hearth London",
    zh: "欢迎来到“The Hearth London”",
  },
  welcomeBody: {
    en: "Gallery tours, reading groups, supper clubs and long walks — for people making London home.",
    zh: "美术馆导览、读书会、晚餐聚会与城市漫步 —— 为正在把伦敦变成家的人而设。",
  },
  haveAccount: { en: "I already have an account", zh: "我已有账号" },
  continue: { en: "Continue", zh: "继续" },
  back: { en: "Back", zh: "返回" },
  finish: { en: "Enter The Hearth", zh: "进入 The Hearth" },
  allSet: { en: "You're all set", zh: "一切就绪" },
  allSetBody: {
    en: "We'll show you gatherings around London worth leaving the house for.",
    zh: "我们会为你推荐伦敦值得出门的聚会。",
  },

  // Onboarding steps
  yourName: { en: "What should we call you?", zh: "怎么称呼你？" },
  yourNameHint: {
    en: "This is the name others see on events.",
    zh: "其他人在活动中会看到这个名字。",
  },
  namePlaceholder: { en: "Your name", zh: "你的名字" },
  pickAvatar: { en: "Add a photo", zh: "添加头像" },
  photoHint: { en: "Optional — you can add one later.", zh: "可选，之后也可以添加。" },
  uploadPhoto: { en: "Upload a photo", zh: "上传照片" },
  changePhoto: { en: "Change photo", zh: "更换照片" },
  removePhoto: { en: "Remove", zh: "移除" },
  uploading: { en: "Uploading…", zh: "上传中…" },
  interestsTitle: { en: "What are you into?", zh: "你对什么感兴趣？" },
  interestsHint: { en: "Choose at least one", zh: "至少选择一项" },

  logIn: { en: "Log in", zh: "登录" },
  signUp: { en: "Sign up", zh: "注册" },
  email: { en: "Email", zh: "邮箱" },
  password: { en: "Password", zh: "密码" },
  passwordHint: { en: "At least 8 characters", zh: "至少 8 个字符" },
  createAccount: { en: "Create an account", zh: "创建账号" },
  justBrowsing: { en: "Just browsing? See what's on", zh: "随便看看？浏览近期活动" },
  forgotPassword: { en: "Forgot password?", zh: "忘记密码？" },
  checkEmailTitle: { en: "Check your email", zh: "请查收邮件" },
  checkEmailBody: {
    en: "We've sent a confirmation link to the address below. Open it to finish setting up your account.",
    zh: "我们已向以下邮箱发送验证链接，点击链接即可完成注册。",
  },
  resendEmail: { en: "Resend the email", zh: "重新发送邮件" },
  emailResent: { en: "Sent again — check your inbox.", zh: "已重新发送，请查收。" },
  resetTitle: { en: "Reset your password", zh: "重置密码" },
  resetBody: {
    en: "Enter your email and we'll send you a link to choose a new password.",
    zh: "输入邮箱，我们会发送重置密码的链接。",
  },
  sendResetLink: { en: "Send reset link", zh: "发送重置链接" },
  resetSent: {
    en: "If there's an account for that email, a reset link is on its way.",
    zh: "如果该邮箱已注册，重置链接将发送到你的邮箱。",
  },
  newPasswordTitle: { en: "Choose a new password", zh: "设置新密码" },
  newPassword: { en: "New password", zh: "新密码" },
  savePassword: { en: "Save password", zh: "保存密码" },
  resetLinkInvalid: {
    en: "This reset link has expired or was already used. Request a new one.",
    zh: "重置链接已过期或已使用，请重新申请。",
  },
  noAccount: { en: "New here?", zh: "第一次来？" },
  hasAccount: { en: "Already a member?", zh: "已经是会员？" },

  // Account
  signOut: { en: "Sign out", zh: "退出登录" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang] || STRINGS[key].en;
}
