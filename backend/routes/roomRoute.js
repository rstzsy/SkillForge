// routes/roomRoute.js
import express from "express";
import * as roomController from "../controllers/roomController.js"; // dùng named import

const router = express.Router();

router.post("/create", roomController.createRoom);
router.get("/:roomId", roomController.getRoomDetails);
router.post("/:roomId/join", roomController.joinRoom);
router.post("/:roomId/leave", roomController.leaveRoom);
router.delete("/:roomId", roomController.closeRoom);

export default router; // default export
