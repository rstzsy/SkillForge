// ✅ Import các thư viện cần thiết
import admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";
import { db } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Kiểm tra API key
if (!process.env.GEMINI_API_KEY) {
  console.error(" Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

// ✅ Khởi tạo Google Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ✅ Service chính
export const aiSpeakingGeminiService = {
  /**
   * Đánh giá một câu trả lời Speaking (ACCENT-AWARE)
   */
  async evaluateSpeakingAnswer({
    userId,
    speakingId,
    questionId,
    questionText,
    transcript,
    expectedText = "",         
    pronunciationIssues = [],  
    audioUrl,
    section,
  }) {
    try {
      console.log("🤖 Starting AI evaluation...");
      console.log("📋 Input data:", {
        userId,
        speakingId,
        questionId,
        section,
        transcriptPreview: transcript?.substring(0, 80),
        expectedTextPreview: expectedText?.substring(0, 80),
      });

      const model = "gemini-2.0-flash";

      // ================= PROMPT ACCENT-AWARE =================
      const prompt = `
      Bạn là một giám khảo IELTS Speaking với hơn 10 năm kinh nghiệm.

      ==============================
      NGUYÊN TẮC QUAN TRỌNG
      ==============================
      - Người học có thể nói với giọng địa phương (Vietnamese / Asian accent).
      - Accent KHÔNG bị coi là lỗi nếu người nghe vẫn hiểu dễ dàng.
      - Transcript được tạo tự động (ASR), có thể có sai sót.
      - KHÔNG trừ điểm nặng pronunciation nếu lỗi có khả năng do accent hoặc ASR.

      ==============================
      THÔNG TIN BÀI NÓI
      ==============================
      Phần thi: ${section}
      Câu hỏi: ${questionText}

      Transcript của học viên:
      "${transcript}"

      Câu trả lời mong đợi (nếu có, chỉ để so sánh phát âm):
      "${expectedText || "Không có"}"

      ==============================
      PHÂN TÍCH PHÁT ÂM RULE-BASED
      ==============================
      Các lỗi phát hiện khi so sánh transcript và expected answer
      (có thể do accent hoặc nuốt âm):

      ${JSON.stringify(pronunciationIssues, null, 2)}

      ==============================
      YÊU CẦU ĐÁNH GIÁ
      ==============================
      1. Ưu tiên khả năng hiểu (intelligibility).
      2. Accent chỉ ghi chú, KHÔNG trừ điểm nặng.
      3. Chỉ trừ điểm pronunciation nếu:
        - Gây hiểu nhầm nghĩa
        - Người nghe phải đoán
      4. Nếu lỗi có thể do accent/ASR:
        - Giải thích rõ trong explanation

      ==============================
      TIÊU CHÍ IELTS (0–9)
      ==============================
      - Pronunciation
      - Fluency & Coherence
      - Lexical Resource
      - Grammatical Range & Accuracy

      ==============================
      ĐỊNH DẠNG OUTPUT (CHỈ JSON)
      ==============================
      {
        "overall_band": number,
        "pronunciation_score": number,
        "fluency_score": number,
        "lexical_score": number,
        "grammar_score": number,
        "feedback": "2–3 câu nhận xét tổng quan BẰNG TIẾNG VIỆT",
        "errors": [
          {
            "type": "pronunciation | grammar | vocabulary",
            "text": "từ/cụm từ gốc (EN)",
            "correction": "phiên bản đúng (EN)",
            "explanation": "giải thích BẰNG TIẾNG VIỆT (ghi rõ nếu do accent)"
          }
        ],
        "suggestions": [
          "Gợi ý cải thiện 1 (TV)",
          "Gợi ý cải thiện 2 (TV)",
          "Gợi ý cải thiện 3 (TV)"
        ]
      }

      LƯU Ý:
      - Feedback & explanation PHẢI BẰNG TIẾNG VIỆT
      - Không phạt accent
      - Phản hồi mang tính GIẢNG DẠY
      `;

      console.log("📤 Sending request to Gemini...");

      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      let parsed;
      try {
        const cleanText = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(cleanText);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }

      // ================= FALLBACK AN TOÀN ACCENT =================
      const finalResult = parsed || {
        overall_band: 6.0,
        pronunciation_score: 6.5,
        fluency_score: 6.0,
        lexical_score: 6.0,
        grammar_score: 6.0,
        feedback:
          "Bài nói có thể hiểu được dù còn ảnh hưởng bởi giọng địa phương. Phát âm nhìn chung ổn, cần cải thiện một số âm dễ gây nhầm lẫn.",
        errors: pronunciationIssues.slice(0, 3),
        suggestions: [
          "Luyện các âm dễ nhầm như /θ/, /ð/, /r/, /l/",
          "Nói chậm và rõ để tránh nuốt âm",
          "Nghe và bắt chước người bản xứ để cải thiện ngữ điệu",
        ],
      };

      // ================= SAVE FIRESTORE =================
      const submissionsRef = db.collection("speaking_question_submissions");
      const existingSnap = await submissionsRef
        .where("user_id", "==", userId)
        .where("speaking_id", "==", speakingId)
        .where("speaking_questions_id", "==", questionId)
        .limit(1)
        .get();

      let submissionRef;

      const payload = {
        question_text: questionText,
        audio_url: audioUrl,
        transcript,
        expected_text: expectedText,
        pronunciation_issues: pronunciationIssues,
        ai_score: finalResult.overall_band,
        pronunciation_score: finalResult.pronunciation_score,
        fluency_score: finalResult.fluency_score,
        grammar_score: finalResult.grammar_score,
        vocab_score: finalResult.lexical_score,
        
        feedback_text: finalResult.feedback,
        errors: JSON.stringify(finalResult.errors || []),
        suggestions: JSON.stringify(finalResult.suggestions || []),
        
        updated_at: new Date(),
      };

      if (!existingSnap.empty) {
        submissionRef = existingSnap.docs[0].ref;
        await submissionRef.update(payload);
      } else {
        submissionRef = submissionsRef.doc();
        await submissionRef.set({
          ...payload,
          question_submission_id: submissionRef.id,
          user_id: userId,
          speaking_id: speakingId,
          speaking_questions_id: questionId,
          created_at: new Date(),
        });
      }

      return { ...finalResult, submission_id: submissionRef.id };
    } catch (error) {
      console.error("🔥 Error evaluating speaking:", error);
      throw new Error("Failed to analyze speaking: " + error.message);
    }
  },

  /**
   * Tính điểm tổng khi hoàn thành topic
   */
  async calculateOverallScore({ userId, speakingId }) {
    const snapshot = await db
      .collection("speaking_question_submissions")
      .where("user_id", "==", userId)
      .where("speaking_id", "==", speakingId)
      .get();

    if (snapshot.empty) {
      throw new Error("Không tìm thấy bài nộp");
    }

    const subs = snapshot.docs.map((d) => d.data());

    const avg = (key) =>
      subs.reduce((s, x) => s + x[key], 0) / subs.length;

    const overallBand =
      (avg("pronunciation_score") +
        avg("fluency_score") +
        avg("grammar_score") +
        avg("vocab_score")) / 4;

    const submissionRef = db.collection("speaking_submissions").doc();

    await submissionRef.set({
      submission_id: submissionRef.id,
      user_id: userId,
      speaking_id: speakingId,
      ai_score: +overallBand.toFixed(1),
      pronunciation_score: +avg("pronunciation_score").toFixed(1),
      fluency_score: +avg("fluency_score").toFixed(1),
      grammar_score: +avg("grammar_score").toFixed(1),
      vocab_score: +avg("vocab_score").toFixed(1),
      status: "Completed",
      submitted_at: new Date(),
    });

    await db.collection("speaking_practices").doc(speakingId).update({
      attempts: admin.firestore.FieldValue.increment(1),
      updated_at: new Date(),
    });

    return { submission_id: submissionRef.id, overall_band: +overallBand.toFixed(1) };
  },
};
