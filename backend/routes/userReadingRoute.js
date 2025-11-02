import express from "express";
import { getUserReadingListController, getUserReadingDetailController } from "../controllers/userReadingController.js";

const router = express.Router();

router.get("/", getUserReadingListController);
router.get("/:id", getUserReadingDetailController);

export default router;
