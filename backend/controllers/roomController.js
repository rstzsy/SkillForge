import * as roomService from "../services/roomService.js";

export const createRoom = async (req, res) => {
  try {
    const { roomName, hostName, hostId, settings } = req.body;

    // 1️⃣ Tạo room trong Firestore
    const { roomData, participantData, roomId } = await roomService.createRoomService({
      roomName,
      hostName,
      hostId,
      settings
    });

    // 2️⃣ Upload JSON room lên Firebase Storage
    const roomUrl = await roomService.uploadRoomFile(roomData, `${roomId}.json`);

    res.status(201).json({
      success: true,
      message: "Tạo phòng thành công",
      data: {
        roomData,
        participantData,
        roomId,
        roomUrl // đây chính là zoomLink để client join
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { roomData, participants, participantCount } = await roomService.getRoomDetailsService(roomId);

    res.json({ success: true, data: { room: roomData, participants, participantCount } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userName } = req.body;
    const result = await roomService.joinRoomService({ roomId, userId, userName });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    await roomService.leaveRoomService({ roomId, userId });

    res.json({ success: true, message: "Rời phòng thành công" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const closeRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { hostId } = req.body;
    await roomService.closeRoomService({ roomId, hostId });

    res.json({ success: true, message: "Đóng phòng thành công" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
