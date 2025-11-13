import * as participantService from "../services/participantService.js";

export const getParticipants = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.query;

    const participants = await participantService.getParticipantsService({ roomId, status });

    res.json({
      success: true,
      data: {
        participants,
        count: participants.length
      }
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách participants:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const { roomId } = req.params;

    const pendingUsers = await participantService.getPendingUsersService({ roomId });

    res.json({
      success: true,
      data: {
        pendingUsers,
        count: pendingUsers.length
      }
    });
  } catch (err) {
    console.error("Lỗi khi lấy pending users:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const admitUser = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userName } = req.body;

    const participantData = await participantService.admitUserService({ roomId, userId, userName });

    res.json({
      success: true,
      message: "Đã chấp nhận người dùng",
      data: participantData
    });
  } catch (err) {
    console.error("Lỗi khi admit user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const denyUser = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    await participantService.denyUserService({ roomId, userId });

    res.json({
      success: true,
      message: "Đã từ chối người dùng"
    });
  } catch (err) {
    console.error("Lỗi khi deny user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateParticipantStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, audioEnabled, videoEnabled } = req.body;

    const updatedData = await participantService.updateParticipantStatusService({ roomId, userId, audioEnabled, videoEnabled });

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: updatedData
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật participant status:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
