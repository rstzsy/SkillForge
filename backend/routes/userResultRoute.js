import express from "express";
import { getUserResultsController, deleteSubmissionController } from "../controllers/userResultController.js";

const router = express.Router();

router.get("/user/:userId", getUserResultsController);
router.delete("/submission/:skill/:submissionId", deleteSubmissionController);

export default router;
