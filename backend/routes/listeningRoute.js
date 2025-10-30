import express from "express";
import multer from "multer";
import { addListeningPracticeController, getListeningPracticesController, getListeningPracticeByIdController, 
         updateListeningPracticeController, deleteListeningPracticeController } from "../controllers/listeningController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

router.post("/", uploadFields, addListeningPracticeController);
router.get("/", getListeningPracticesController);
router.get("/:id", getListeningPracticeByIdController);
router.put("/:id", uploadFields, updateListeningPracticeController);
router.delete("/:id", deleteListeningPracticeController);
export default router;
