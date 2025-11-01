import express from "express";
import multer from "multer";
import { importSpeakingExcel, SpeakingController } from "../controllers/speakingController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", SpeakingController.getAllSpeaking);
router.post("/import-excel", upload.single("file"), importSpeakingExcel);
router.delete("/:id", SpeakingController.deleteSpeaking);

export default router;
