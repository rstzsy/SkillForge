import express from "express";
import multer from "multer";
import { importSpeakingExcel, SpeakingController } from "../controllers/speakingController.js";

const router = express.Router();

// ✅ Multer config cho Excel upload
const excelUpload = multer({ dest: "uploads/" });

// ✅ Multer config cho audio upload
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webm`;
    cb(null, uniqueName);
  },
});
const audioUpload = multer({ storage: audioStorage });

// ========== CRUD ROUTES ==========
router.get("/", SpeakingController.getAllSpeaking);              // Lấy tất cả
router.get("/:id", SpeakingController.getSpeakingById);          // Lấy một topic
router.post("/", SpeakingController.createSpeaking);             // Tạo mới
router.put("/:id", SpeakingController.updateSpeaking);           // Cập nhật
router.delete("/:id", SpeakingController.deleteSpeaking);        // Xóa

// ========== EXCEL IMPORT ==========
router.post("/import-excel", excelUpload.single("file"), importSpeakingExcel);

// ========== AI EVALUATION ROUTES ==========
router.post("/submit-answer", audioUpload.single("audio"), SpeakingController.submitSpeakingAnswer);
router.post("/finalize", SpeakingController.finalizeSpeaking);
router.get("/submissions/:userId/:speakingId", SpeakingController.getUserSubmissions);

export default router;