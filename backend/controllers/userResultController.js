import { fetchUserResults, deleteSubmissionById } from "../services/userResultService.js";


export const getUserResultsController = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const data = await fetchUserResults(userId);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in getUserResultsController:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// delete
export const deleteSubmissionController = async (req, res) => {
  try {
    const { skill, submissionId } = req.params;
    // gan userid trong body cua postman
    const userId = req.body.userId || req.headers["x-user-id"];
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const result = await deleteSubmissionById(skill, submissionId, userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};