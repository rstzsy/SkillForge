import { db } from "../config/firebase.js";

/**
 * Gửi tin nhắn
 */
export const sendMessageService = async ({ roomId, userId, userName, message, type = "text" }) => {
  if (!message || !message.trim()) throw new Error("Tin nhắn không được để trống");
  if (!userId || !userName) throw new Error("Thiếu thông tin người gửi");

  const messageData = {
    userId,
    userName,
    message: message.trim(),
    timestamp: new Date(),
    type,
    reactions: []
  };

  const messageRef = await db
    .collection("rooms")
    .doc(roomId)
    .collection("messages")
    .add(messageData);

  return {
    messageId: messageRef.id,
    ...messageData
  };
};

/**
 * Lấy danh sách tin nhắn
 */
export const getMessagesService = async ({ roomId, limit = 50, before }) => {
  let query = db
    .collection("rooms")
    .doc(roomId)
    .collection("messages")
    .orderBy("timestamp", "desc")
    .limit(parseInt(limit));

  if (before) {
    const beforeDate = new Date(before);
    query = query.where("timestamp", "<", beforeDate);
  }

  const messagesSnapshot = await query.get();

  const messages = messagesSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp.toDate().toISOString()
    };
  });

  messages.reverse(); // Đảo ngược để tin nhắn cũ nhất ở đầu

  return {
    messages,
    count: messages.length,
    hasMore: messages.length === parseInt(limit)
  };
};

/**
 * Gửi tin nhắn bot/system
 */
export const sendBotMessageService = async ({ roomId, message, type = "bot" }) => {
  const botMessages = [
    "👋 Chào mừng đến với cuộc họp!",
    "🔴 Đã bắt đầu ghi hình",
    "🖥️ Chia sẻ màn hình đang hoạt động",
    "👤 Có người tham gia phòng",
    "👋 Có người rời phòng",
    "⏰ Cuộc họp sẽ kết thúc trong 5 phút",
    "🎉 Cảm ơn các bạn đã tham gia!",
    "📝 Hãy ghi chú những điểm quan trọng",
    "🤝 Đừng quên tắt mic khi không nói",
    "✨ Chúc các bạn có buổi họp hiệu quả!"
  ];

  const messageData = {
    userId: "system",
    userName: "VirtuFit Bot",
    message: message || botMessages[Math.floor(Math.random() * botMessages.length)],
    timestamp: new Date(),
    type,
    reactions: []
  };

  const messageRef = await db
    .collection("rooms")
    .doc(roomId)
    .collection("messages")
    .add(messageData);

  return {
    messageId: messageRef.id,
    ...messageData
  };
};
