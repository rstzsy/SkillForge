import { transcribeAudio } from "../ai/whisperService.js";
import { db } from "../config/firebase.js";
import fs from "fs";
import path from "path";
import multer from "multer";

// Lưu file audio tạm
const upload = multer({ dest: "uploads/" });

export const uploadAndEvaluate = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { userId, speakingId, questionId } = req.body;
      const filePath = req.file.path;

      // ✅ Gọi Whisper + BLIP (file analyze_audio.py)
      const analysis = await transcribeAudio(filePath);

      // 🔹 Lưu kết quả transcript & điểm từng câu vào DB
      const questionSubmission = {
        submission_id: null, // sẽ cập nhật khi hoàn thành toàn bài
        speaking_questions_id: questionId,
        audio_url: filePath,
        transcript: analysis.transcript,
        pronunciation_score: analysis.pronunciation_score,
        fluency_score: analysis.fluency_score,
        grammar_score: analysis.grammar_score,
        vocab_score: analysis.vocab_score,
        ai_score: analysis.ai_score,
        feedback: analysis.feedback,
        created_at: new Date(),
      };

      // Giả sử đang dùng Firestore (bạn có thể đổi sang MySQL)
      await db.collection("speaking_question_submissions").add(questionSubmission);

      fs.unlinkSync(filePath); // Xóa file tạm

      res.json({
        success: true,
        message: "Audio analyzed successfully",
        analysis: questionSubmission,
      });
    } catch (error) {
      console.error("🔥 Error analyzing audio:", error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze speaking audio",
      });
    }
  },
];
