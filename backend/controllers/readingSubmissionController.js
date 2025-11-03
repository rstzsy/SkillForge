import {
  submitReadingPractice,
  getUserReadingSubmissions,
  getReadingSubmissionById,
  gradeReadingSubmission,
} from "../services/readingSubmissionService.js";

// save user submission
export const submitUserReading = async (req, res) => {
  try {
    const { user_id, practice_id, user_answers, time_spent, attempt_number } = req.body;

    if (!user_id || !practice_id || !user_answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const submission = await submitReadingPractice({
      user_id,
      practice_id,
      user_answers,
      time_spent,
      attempt_number,
    });

    res.status(200).json({
      message: "Reading submission saved successfully",
      data: submission,
    });
  } catch (err) {
    console.error("Error submitting reading:", err);
    res.status(500).json({ message: err.message });
  }
};

// get all submission user list
export const getUserReadingSubmissionsController = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id" });
    }

    const submissions = await getUserReadingSubmissions(user_id);
    res.status(200).json({
      message: "User reading submissions fetched successfully",
      data: submissions,
    });
  } catch (err) {
    console.error("Error fetching reading submissions:", err);
    res.status(500).json({ message: err.message });
  }
};

// get detail submission
export const getReadingSubmissionDetailController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing submission ID" });
    }

    const submission = await getReadingSubmissionById(id);
    res.status(200).json({
      message: "Reading submission detail fetched successfully",
      data: submission,
    });
  } catch (err) {
    console.error("Error fetching reading submission detail:", err);
    res.status(404).json({ message: err.message });
  }
};

// score and ai feedback
export const gradeReadingSubmissionController = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!submissionId) {
      return res.status(400).json({ message: "Missing submission ID" });
    }

    const result = await gradeReadingSubmission(submissionId);
    res.status(200).json({
      message: "Reading submission graded successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error grading reading submission:", err);
    res.status(500).json({ message: err.message });
  }
};
