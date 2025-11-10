import { db } from "../config/firebase.js";

/**
 * Lấy danh sách participants
 */
export const getParticipantsService = async ({ roomId, status = "active" }) => {
  let query = db.collection("rooms").doc(roomId).collection("participants");

  if (status) {
    query = query.where("status", "==", status);
  }

  const snapshot = await query.get();
  const participants = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      joinedAt: data.joinedAt ? data.joinedAt.toDate().toISOString() : null
    };
  });

  return participants;
};

/**
 * Lấy danh sách người đang chờ
 */
export const getPendingUsersService = async ({ roomId }) => {
  const snapshot = await db
    .collection("pendingUsers")
    .where("roomId", "==", roomId)
    .where("status", "==", "pending")
    .get();

  const pendingUsers = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      requestedAt: data.requestedAt ? data.requestedAt.toDate().toISOString() : null
    };
  });

  return pendingUsers;
};

/**
 * Chấp nhận người dùng vào phòng
 */
export const admitUserService = async ({ roomId, userId, userName }) => {
  if (!userId || !userName) throw new Error("Thiếu thông tin người dùng");

  const participantData = {
    userId,
    userName,
    joinedAt: new Date(),
    isHost: false,
    audioEnabled: true,
    videoEnabled: true,
    status: "active",
    agoraUid: Math.floor(Math.random() * 1000000)
  };

  await db
    .collection("rooms")
    .doc(roomId)
    .collection("participants")
    .doc(userId)
    .set(participantData);

  await db
    .collection("pendingUsers")
    .doc(`${roomId}_${userId}`)
    .update({
      status: "admitted",
      admittedAt: new Date()
    });

  // Cập nhật số lượng participants
  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();
  if (roomDoc.exists) {
    await roomRef.update({
      participantCount: roomDoc.data().participantCount + 1
    });
  }

  return participantData;
};

/**
 * Từ chối người dùng
 */
export const denyUserService = async ({ roomId, userId }) => {
  if (!userId) throw new Error("Thiếu userId");

  await db
    .collection("pendingUsers")
    .doc(`${roomId}_${userId}`)
    .update({
      status: "denied",
      deniedAt: new Date()
    });

  return true;
};

/**
 * Cập nhật trạng thái participant (audio/video)
 */
export const updateParticipantStatusService = async ({ roomId, userId, audioEnabled, videoEnabled }) => {
  if (!userId) throw new Error("Thiếu userId");

  const updateData = {};
  if (typeof audioEnabled === "boolean") updateData.audioEnabled = audioEnabled;
  if (typeof videoEnabled === "boolean") updateData.videoEnabled = videoEnabled;

  if (Object.keys(updateData).length === 0) throw new Error("Không có dữ liệu để cập nhật");

  await db
    .collection("rooms")
    .doc(roomId)
    .collection("participants")
    .doc(userId)
    .update(updateData);

  return updateData;
};
