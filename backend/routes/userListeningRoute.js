import express from "express";
import { getUserListeningListController, getUserListeningDetailController } from "../controllers/userListeningController.js";

const router = express.Router();

router.get("/", getUserListeningListController);
router.get("/:id", getUserListeningDetailController);

export default router;
