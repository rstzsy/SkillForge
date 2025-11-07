import express from "express";
import { RoadmapController } from "../controllers/roadmapController.js";

const router = express.Router();

router.post("/generate", RoadmapController.generate);
router.get("/user/:userId", RoadmapController.getUserRoadmap);

export default router;
