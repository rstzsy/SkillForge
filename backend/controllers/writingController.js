import { WritingService } from "../services/writingService.js";
import path from "path";
import fs from "fs";

export const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);
    const result = await WritingService.importExcel(filePath);

    fs.unlinkSync(filePath); // Xóa file tạm sau khi đọc

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Import failed:", error);
    res.status(500).json({ message: "Failed to import Excel", error: error.message });
  }
};
