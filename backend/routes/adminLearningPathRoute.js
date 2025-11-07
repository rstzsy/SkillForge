import express from "express";
import { getUserLearningPath } from "../controllers/adminLearningPathController.js";

const router = express.Router();

router.get("/user/:userId", getUserLearningPath);

export default router;
