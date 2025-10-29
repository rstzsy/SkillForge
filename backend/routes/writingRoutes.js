import express from "express";
import multer from "multer";
import { importExcel } from "../controllers/writingController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/import-excel", upload.single("file"), importExcel);

export default router;
