import {
  submitListeningPractice,
  getUserSubmissions,
  getSubmissionById,
  gradeListeningSubmission,
} from "../services/listeningSubmissionService.js";

// post submission
export const submitUserListening = async (req, res) => {
  try {
    const { user_id, practice_id, user_answer, duration_seconds } = req.body;
    if (!user_id || !practice_id || !user_answer)
      return res.status(400).json({ message: "Missing required fields" });

    const submission = await submitListeningPractice({
      user_id,
      practice_id,
      user_answer,
      duration_seconds,
    });

    res.status(200).json({
      message: "Submission saved successfully",
      data: submission,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// get submisison
export const getUserSubmissionsController = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ message: "Missing user_id" });

    const submissions = await getUserSubmissions(user_id);
    res.status(200).json({
      message: "User submissions fetched successfully",
      data: submissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// get submission detail
export const getSubmissionDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing submission ID" });

    const submission = await getSubmissionById(id);
    res.status(200).json({
      message: "Submission detail fetched successfully",
      data: submission,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

// get score submission
export const gradeSubmissionController = async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!submissionId)
      return res.status(400).json({ message: "Missing submission ID" });

    const result = await gradeListeningSubmission(submissionId);
    res.status(200).json({
      message: "Submission graded successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error grading submission:", err);
    res.status(500).json({ message: err.message });
  }
};

