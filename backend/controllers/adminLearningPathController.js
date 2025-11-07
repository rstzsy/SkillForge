import { getLearningPathForUser } from "../services/adminLearningPathService.js";

export const getUserLearningPath = async (req, res) => {
  const { userId } = req.params;

  try {
    const learningPath = await getLearningPathForUser(userId);
    return res.status(200).json({ learningPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch learning path" });
  }
};
