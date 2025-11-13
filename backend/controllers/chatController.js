import * as chatService from "../services/chatService.js";

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userName, message, type } = req.body;

    const data = await chatService.sendMessageService({ roomId, userId, userName, message, type });

    res.json({
      success: true,
      message: "Gửi tin nhắn thành công",
      data
    });
  } catch (err) {
    console.error("Lỗi khi gửi tin nhắn:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit, before } = req.query;

    const data = await chatService.getMessagesService({ roomId, limit, before });

    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Lỗi khi lấy tin nhắn:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const sendBotMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, type } = req.body;

    const data = await chatService.sendBotMessageService({ roomId, message, type });

    res.json({
      success: true,
      message: "Gửi tin nhắn bot thành công",
      data
    });
  } catch (err) {
    console.error("Lỗi khi gửi bot message:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
