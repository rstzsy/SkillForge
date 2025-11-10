// routes/participantRoutes.js
import express from "express";
import * as participantController from "../controllers/participantController.js";

const router = express.Router();

router.get("/:roomId/list", participantController.getParticipants);
router.post("/:roomId/admit", participantController.admitUser);
router.post("/:roomId/deny", participantController.denyUser);
router.get("/:roomId/pending", participantController.getPendingUsers);
router.post("/:roomId/update-status", participantController.updateParticipantStatus);

export default router;
