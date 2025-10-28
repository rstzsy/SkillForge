import express from "express";
import { createGoal, getGoalsByUser, deleteGoal } from "../controllers/goalController.js";

const router = express.Router();

router.post("/", createGoal);
router.get("/:userId", getGoalsByUser);
router.delete("/:goalId", deleteGoal); 

export default router;
