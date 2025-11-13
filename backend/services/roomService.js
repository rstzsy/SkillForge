import { db } from "../config/firebase.js"; // đảm bảo import storage
import { v4 as uuidv4 } from "uuid";

export const uploadRoomFile = async (roomData, fileName) => {
  try {
    const bucket = admin.storage().bucket(); // Sử dụng bucket default
    const file = bucket.file(`rooms/${fileName}`);
    await file.save(JSON.stringify(roomData), {
      contentType: "application/json",
    });
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // link đọc được lâu dài
    });
    return url;
  } catch (err) {
    console.error("Error uploading room file:", err);
    throw err;
  }
};

/**
 * Tạo phòng mới trong Firestore
 */
export const createRoomService = async ({ roomName, hostName, hostId, settings }) => {
  if (!hostName || !hostId) {
    throw new Error("Thiếu thông tin host");
  }

  const roomId = uuidv4();

  const roomData = {
    roomId,
    roomName: roomName || `Phòng họp ${Date.now()}`,
    hostId,
    hostName,
    createdAt: new Date(),
    isActive: true,
    maxParticipants: 50,
    participantCount: 1,
    settings: settings || {
      enableChat: true,
      enableScreenShare: true,
      requireAdmission: false,
      recordingEnabled: false
    }
  };

  // Tạo room
  await db.collection("rooms").doc(roomId).set(roomData);

  // Thêm host làm participant đầu tiên
  const participantData = {
    userId: hostId,
    userName: hostName,
    joinedAt: new Date(),
    isHost: true,
    audioEnabled: true,
    videoEnabled: true,
    status: "active",
    agoraUid: Math.floor(Math.random() * 1000000)
  };

  await db.collection("rooms").doc(roomId)
    .collection("participants").doc(hostId).set(participantData);

  return { roomData, participantData, roomId };
};


/**
 * Lấy thông tin phòng và danh sách participant
 */
export const getRoomDetailsService = async (roomId) => {
  const roomDoc = await db.collection("rooms").doc(roomId).get();

  if (!roomDoc.exists) throw new Error("Không tìm thấy phòng");

  const roomData = roomDoc.data();

  const participantsSnapshot = await db
    .collection("rooms")
    .doc(roomId)
    .collection("participants")
    .where("status", "==", "active")
    .get();

  const participants = participantsSnapshot.docs.map(doc => doc.data());

  return { roomData, participants, participantCount: participants.length };
};

/**
 * Tham gia phòng
 */
export const joinRoomService = async ({ roomId, userId, userName }) => {
  if (!userId || !userName) throw new Error("Thiếu thông tin người dùng");

  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();

  if (!roomDoc.exists) throw new Error("Không tìm thấy phòng");

  const roomData = roomDoc.data();

  if (!roomData.isActive) throw new Error("Phòng đã đóng");

  // Kiểm tra yêu cầu phê duyệt
  if (roomData.settings.requireAdmission) {
    await db.collection("pendingUsers").doc(`${roomId}_${userId}`).set({
      roomId,
      userId,
      userName,
      requestedAt: new Date(),
      status: "pending"
    });

    return { status: "pending" };
  }

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

  await roomRef.collection("participants").doc(userId).set(participantData);

  await roomRef.update({
    participantCount: roomData.participantCount + 1
  });

  return { status: "joined", participantData, roomData };
};

/**
 * Rời phòng
 */
export const leaveRoomService = async ({ roomId, userId }) => {
  if (!userId) throw new Error("Thiếu userId");

  const roomRef = db.collection("rooms").doc(roomId);
  const participantRef = roomRef.collection("participants").doc(userId);

  await participantRef.update({ status: "left", leftAt: new Date() });

  const roomDoc = await roomRef.get();
  if (roomDoc.exists) {
    const currentCount = roomDoc.data().participantCount;
    await roomRef.update({ participantCount: Math.max(0, currentCount - 1) });
  }

  return true;
};

/**
 * Đóng phòng
 */
export const closeRoomService = async ({ roomId, hostId }) => {
  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();

  if (!roomDoc.exists) throw new Error("Không tìm thấy phòng");

  if (roomDoc.data().hostId !== hostId) throw new Error("Chỉ host mới có thể đóng phòng");

  await roomRef.update({ isActive: false, closedAt: new Date() });

  return true;
};
