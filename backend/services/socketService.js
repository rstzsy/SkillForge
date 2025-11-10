import { db } from "../config/firebase.js";

/**
 * Tham gia phòng
 */
export const joinRoomService = async ({ roomId, userId, socketId }) => {
  const participantRef = db.collection("rooms").doc(roomId).collection("participants").doc(userId);
  await participantRef.update({
    socketId,
    status: "active"
  });
};

/**
 * Gửi tin nhắn
 */
export const sendMessageService = async ({ roomId, userId, userName, message }) => {
  const messageData = {
    userId,
    userName,
    message,
    timestamp: new Date(),
    type: "text"
  };

  const messageRef = await db.collection("rooms").doc(roomId).collection("messages").add(messageData);

  return {
    messageId: messageRef.id,
    ...messageData,
    timestamp: messageData.timestamp.toISOString()
  };
};

/**
 * Toggle audio/video
 */
export const toggleAudioService = async ({ roomId, userId, audioEnabled }) => {
  await db.collection("rooms").doc(roomId).collection("participants").doc(userId).update({
    audioEnabled
  });
};

export const toggleVideoService = async ({ roomId, userId, videoEnabled }) => {
  await db.collection("rooms").doc(roomId).collection("participants").doc(userId).update({
    videoEnabled
  });
};

/**
 * Leave room
 */
export const leaveRoomService = async ({ roomId, userId }) => {
  await db.collection("rooms").doc(roomId).collection("participants").doc(userId).update({
    status: "left",
    leftAt: new Date()
  });
};
