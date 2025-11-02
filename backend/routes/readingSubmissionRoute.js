import express from "express";
import {
  submitUserReading,
  getUserReadingSubmissionsController,
  getReadingSubmissionDetailController,
  gradeReadingSubmissionController,
} from "../controllers/readingSubmissionController.js";

const router = express.Router();

router.post("/", submitUserReading);
router.get("/reading/:user_id", getUserReadingSubmissionsController);
router.get("/reading/:id", getReadingSubmissionDetailController);
router.get("/grade/:submissionId", gradeReadingSubmissionController);

export default router;
