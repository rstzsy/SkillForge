import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { importSpeakingExcel, SpeakingController } from "../controllers/speakingController.js";

const router = express.Router();

// ✅ Multer config cho Excel upload
const excelUpload = multer({ dest: path.join(process.cwd(), "uploads") });

// ✅ Multer config cho audio upload (TƯƠNG THÍCH CẢ WIN & MAC)
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "audio");

    // Tự động tạo thư mục nếu chưa có
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📁 Created upload directory:", uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const audioUpload = multer({ storage: audioStorage });

// ========== CRUD ROUTES ==========
router.get("/", SpeakingController.getAllSpeaking);
router.get("/:id", SpeakingController.getSpeakingById);
router.post("/", SpeakingController.createSpeaking);
router.put("/:id", SpeakingController.updateSpeaking);
router.delete("/:id", SpeakingController.deleteSpeaking);

// ========== EXCEL IMPORT ==========
router.post("/import-excel", excelUpload.single("file"), importSpeakingExcel);

// ========== AI EVALUATION ROUTES ==========
router.post("/submit-answer", audioUpload.single("audio"), SpeakingController.submitSpeakingAnswer);
router.post("/finalize", SpeakingController.finalizeSpeaking);
router.get("/submissions/:userId/:speakingId", SpeakingController.getUserSubmissions);

export default router;
