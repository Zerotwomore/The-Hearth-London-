import { Conversation } from "@/lib/types/chat";
import { CURRENT_USER_ID } from "@/lib/data/users";

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv-e1",
    eventId: "e1",
    participantIds: [CURRENT_USER_ID, "u10", "u4", "u8", "u5"],
    unreadCount: 3,
    messages: [
      {
        id: "g1",
        senderId: "u10",
        text: "欢迎大家 —— 这是周四国家美术馆导览的群聊，集合地点我会发在这里。",
        sentAt: "2026-09-05T09:00:00",
      },
      {
        id: "g2",
        senderId: "u10",
        text: "集合地点：特拉法加广场正门柱廊下，下午 2:50，方便分发耳机。",
        sentAt: "2026-09-05T09:01:00",
      },
      {
        id: "g3",
        senderId: "u4",
        text: "好的。有寄存处吗？我下班直接过去，会带包。",
        sentAt: "2026-09-05T09:14:00",
      },
      {
        id: "g4",
        senderId: "u10",
        text: "有的，进门左手边有免费寄存，大包也必须寄存。",
        sentAt: "2026-09-05T09:16:00",
      },
      {
        id: "g5",
        senderId: "u8",
        text: "可以拍照吗？如果可以我想拍透纳展厅。",
        sentAt: "2026-09-05T10:02:00",
      },
      {
        id: "g6",
        senderId: "u10",
        text: "不能用闪光灯和三脚架，其他都可以。透纳是压轴，我们会在那儿待十分钟左右。",
        sentAt: "2026-09-05T10:05:00",
      },
      {
        id: "g7",
        senderId: "u5",
        text: "结束后有人想去咖啡厅坐坐吗？我不急着走。",
        sentAt: "2026-09-05T11:20:00",
      },
      {
        id: "g8",
        senderId: CURRENT_USER_ID,
        text: "我也去。",
        sentAt: "2026-09-05T11:26:00",
      },
      {
        id: "g9",
        senderId: "u4",
        text: "同去。周四见！",
        sentAt: "2026-09-05T11:31:00",
      },
    ],
  },
  {
    id: "conv1",
    participantIds: [CURRENT_USER_ID, "u10"],
    messages: [
      {
        id: "m1",
        senderId: "u10",
        text: "你好，周四国家美术馆导览已经帮你登记好了。",
        sentAt: "2026-09-04T18:02:00",
      },
      {
        id: "m2",
        senderId: CURRENT_USER_ID,
        text: "谢谢！我们具体在哪里集合？",
        sentAt: "2026-09-04T18:05:00",
      },
      {
        id: "m3",
        senderId: "u10",
        text: "特拉法加广场正门柱廊下集合，我会带着耳机。",
        sentAt: "2026-09-04T18:06:00",
      },
      {
        id: "m4",
        senderId: "u10",
        text: "2:50 到就好，方便开始前发耳机。",
        sentAt: "2026-09-04T18:07:00",
      },
      {
        id: "m5",
        senderId: CURRENT_USER_ID,
        text: "好的。路线里包含透纳的作品吗？",
        sentAt: "2026-09-04T18:10:00",
      },
      {
        id: "m6",
        senderId: "u10",
        text: "那是压轴 —— 我们会在画前待上十分钟。",
        sentAt: "2026-09-04T18:11:00",
      },
      {
        id: "m7",
        senderId: CURRENT_USER_ID,
        text: "太期待了，周四见！",
        sentAt: "2026-09-04T18:12:00",
      },
    ],
  },
  {
    id: "conv3",
    participantIds: [CURRENT_USER_ID, "u2"],
    messages: [
      {
        id: "m13",
        senderId: "u2",
        text: "Still coming to board games Tuesday?",
        sentAt: "2026-09-03T12:00:00",
      },
      {
        id: "m14",
        senderId: CURRENT_USER_ID,
        text: "Wouldn't miss it. Are we doing Catan again?",
        sentAt: "2026-09-03T12:04:00",
      },
      {
        id: "m15",
        senderId: "u2",
        text: "Yes, bringing the expansion so we can fit more players.",
        sentAt: "2026-09-03T12:05:00",
      },
      {
        id: "m16",
        senderId: CURRENT_USER_ID,
        text: "Nice, I'll bring snacks.",
        sentAt: "2026-09-03T12:06:00",
      },
      {
        id: "m17",
        senderId: "u2",
        text: "You're the real MVP of this club.",
        sentAt: "2026-09-03T12:07:00",
      },
    ],
  },
];

export function getConversationById(id: string): Conversation | undefined {
  return CONVERSATIONS.find((conversation) => conversation.id === id);
}

export function getOtherParticipantId(conversation: Conversation): string {
  return (
    conversation.participantIds.find((id) => id !== CURRENT_USER_ID) ??
    conversation.participantIds[0]
  );
}
