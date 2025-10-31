import express from "express";
import multer from "multer";
import { addReadingPracticeController, getReadingPracticesController, getReadingPracticeByIdController, 
         updateReadingPracticeController, deleteReadingPracticeController } from "../controllers/readingController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

router.post("/", uploadFields, addReadingPracticeController);
router.get("/", getReadingPracticesController);
router.get("/:id", getReadingPracticeByIdController);
router.put("/:id", uploadFields, updateReadingPracticeController);
router.delete("/:id", deleteReadingPracticeController);
export default router;


