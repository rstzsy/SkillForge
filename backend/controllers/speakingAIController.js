import fs from "fs";
import path from "path";
import { transcribeAudio } from "../ai/transcribeService.js";
import { db } from "../config/firebase.js";
import { aiSpeakingGeminiService } from "../ai/aiSpeakingGeminiService.js";

export const SpeakingAIController = {
  async evaluateSpeaking(req, res) {
    try {
      const { user_id, speaking_id, question_text, question_index } = req.body;
      const audioPath = req.file.path;

      // 1️⃣ Dùng Whisper để lấy transcript
      const whisperResult = await transcribeAudio(audioPath, question_text);

      // 2️⃣ Dùng Gemini để đánh giá transcript
      const aiResult = await aiSpeakingGeminiService.evaluateSpeaking({
        transcript: whisperResult.transcript,
        expectedText: question_text,
      });

      // 3️⃣ Lưu vào Firestore hoặc MySQL
      const record = {
        user_id,
        speaking_id,
        question_index: Number(question_index),
        question_text,
        transcript: whisperResult.transcript,
        ai_score: aiResult.ai_score,
        pronunciation_score: aiResult.pronunciation,
        fluency_score: aiResult.fluency,
        grammar_score: aiResult.grammar,
        vocab_score: aiResult.vocab,
        feedback: aiResult.feedback,
        created_at: new Date(),
      };

      await db.collection("speaking_question_submissions").add(record);
      fs.unlinkSync(audioPath); // Xóa file tạm

      res.json({
        success: true,
        ...record,
      });
    } catch (error) {
      console.error("🔥 Speaking AI Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
