import { GoalService } from "../services/goalService.js";

// Tạo mới goal
export const createGoal = async (req, res) => {
  try {
    const goalData = req.body;
    const savedGoal = await GoalService.saveGoal(goalData);
    res.status(201).json({ message: "Goal saved successfully", data: savedGoal });
  } catch (error) {
    console.error("Error in createGoal:", error);
    res.status(500).json({ error: "Failed to save goal" });
  }
};

// Lấy danh sách goal theo user_id
export const getGoalsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const goals = await GoalService.getGoalsByUser(userId);
    res.status(200).json(goals);
  } catch (error) {
    console.error("Error in getGoalsByUser:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};
