import express from "express";
import {
  submitUserListening,
  getUserSubmissionsController,
  getSubmissionDetailController,
  gradeSubmissionController
} from "../controllers/listeningSubmissionController.js";

const router = express.Router();


router.post("/", submitUserListening);
router.get("/listening/:user_id", getUserSubmissionsController);
router.get("/listening/detail/:id", getSubmissionDetailController);
router.get("/grade/:submissionId", gradeSubmissionController);

export default router;
