import express from "express";
import * as chatController from "../controllers/chatController.js";

const router = express.Router();

router.post("/:roomId/messages", chatController.sendMessage);
router.get("/:roomId/messages", chatController.getMessages);
router.post("/:roomId/bot-message", chatController.sendBotMessage);

export default router; // <-- default export
