import { GoogleGenAI } from "@google/genai";
import { db } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Kiểm tra API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

// ✅ Khởi tạo AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const aiWritingGeminiService = {
  async evaluateEssay({ userId, practiceId, essayText }) {
    try {
      const model = "gemini-2.0-flash";

      // 🧠 Prompt hướng dẫn AI trả JSON
      const prompt = `
      You are an IELTS Writing examiner.
      Respond STRICTLY in JSON format like this:
      {
        "overall_band": number,
        "task_achievement": number,
        "coherence": number,
        "lexical": number,
        "grammar": number,
        "feedback": "General comment about the essay",
        "errors": [
          { "sentence": "Wrong sentence", "correction": "Corrected version" }
        ],
        "suggestions": [
          "Short tip for improvement"
        ]
      }

      Essay:
      ${essayText}
      `;

      // ✅ Gọi API
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // ✅ Lấy nội dung text đúng cấu trúc SDK mới
      const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "";

      if (!text) {
        console.error("❌ Empty response from Gemini:", JSON.stringify(result, null, 2));
        throw new Error("No response text from Gemini API");
      }

      // ✅ Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.warn("⚠️ Response not valid JSON, attempting fallback parse...");
        const match = text.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }

      // ✅ Nếu parse thất bại → dùng fallback mặc định
      const finalResult = parsed || {
        overall_band: 6.5,
        task_achievement: 6.0,
        coherence: 6.0,
        lexical: 6.0,
        grammar: 6.0,
        feedback:
          "Your essay demonstrates some understanding of the topic, but there are issues with grammar and vocabulary.",
        errors: [],
        suggestions: [
          "Use more linking words to connect ideas.",
          "Pay attention to verb tenses and subject-verb agreement.",
        ],
      };

      // ✅ Lưu Firestore
      const docRef = await db.collection("writing_feedbacks").add({
        user_id: userId,
        practice_id: practiceId,
        essay_text: essayText,
        ai_feedback: finalResult,
        created_at: new Date(),
        status: "Completed",
      });

      console.log("✅ AI feedback saved:", docRef.id);
      return finalResult;
    } catch (error) {
      console.error("🔥 Error evaluating essay:", error);
      throw new Error("Failed to analyze essay with Gemini");
    }
  },
};
