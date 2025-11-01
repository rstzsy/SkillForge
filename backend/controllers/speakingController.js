import { db } from "../config/firebase.js";
import fs from "fs";
import { SpeakingService } from "../services/speakingService.js";

export const SpeakingController = {
  // ✅ Lấy toàn bộ speaking từ Firestore
  async getAllSpeaking(req, res) {
    try {
      const snapshot = await db.collection("speaking_practices").get();
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const questionsSnap = await db
            .collection("speaking_practices")
            .doc(doc.id)
            .collection("questions")
            .get();

          return {
            speaking_practices_id: doc.id,
            ...doc.data(),
            questions: questionsSnap.docs.map((q) => ({
              id: q.id,
              ...q.data(),
            })),
          };
        })
      );

      res.json(data);
    } catch (error) {
      console.error("🔥 Error fetching speaking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch speaking practices",
        error: error.message,
      });
    }
  },

  // ✅ Xóa một speaking + các câu hỏi con
  async deleteSpeaking(req, res) {
    try {
      const { id } = req.params;
      const ref = db.collection("speaking_practices").doc(id);

      // Xóa subcollection "questions"
      const questionsSnap = await ref.collection("questions").get();
      const batch = db.batch();
      questionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      // Xóa thực thể chính
      await ref.delete();

      res.json({ success: true, message: "Speaking topic deleted successfully" });
    } catch (error) {
      console.error("🔥 Error deleting speaking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete speaking topic",
        error: error.message,
      });
    }
  },
};

// ✅ Import Excel từ file (phần bạn đã có)
export const importSpeakingExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "❌ No file uploaded" });
    }

    const filePath = req.file.path;
    const result = await SpeakingService.importExcel(filePath);

    fs.unlinkSync(filePath); // Xóa file Excel tạm

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("🔥 Error in importSpeakingExcel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import Speaking Excel",
      error: error.message,
    });
  }
};
