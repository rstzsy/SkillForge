import express from "express";
import { evaluateEssay } from "../controllers/aiWritingController.js";

const router = express.Router();

router.post("/evaluate", evaluateEssay);

export default router;
