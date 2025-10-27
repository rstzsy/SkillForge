import express from "express";
import { createGoal, getGoalsByUser } from "../controllers/goalController.js";

const router = express.Router();

router.post("/", createGoal);

router.get("/:userId", getGoalsByUser);

export default router;
