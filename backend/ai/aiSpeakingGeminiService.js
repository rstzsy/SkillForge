// ✅ Import các thư viện cần thiết
import admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";
import { db } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Kiểm tra API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

// ✅ Khởi tạo Google Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ✅ Service chính
export const aiSpeakingGeminiService = {
  /**
   * Đánh giá một câu trả lời Speaking
   */
  async evaluateSpeakingAnswer({
    userId,
    speakingId,
    questionId,
    questionText,
    transcript,
    audioUrl,
    section,
  }) {
    try {
      console.log("🤖 Starting AI evaluation...");
      console.log("📋 Input data:", {
        userId,
        speakingId,
        questionId,
        questionText: questionText.substring(0, 50),
        transcript: transcript.substring(0, 100),
        section,
      });

      const model = "gemini-2.0-flash";

      const prompt = `
        Bạn là một giám khảo IELTS Speaking chuyên nghiệp với hơn 10 năm kinh nghiệm.
        Đánh giá bài nói này dựa trên tiêu chí chấm điểm IELTS Speaking.

        **Phần thi:** ${section}
        **Câu hỏi:** ${questionText}
        **Câu trả lời của học viên (đã chuyển âm):** ${transcript}

        Trả lời **CHỈ BẰNG JSON HỢP LỆ**, không có text thừa.

        ### TIÊU CHÍ ĐÁNH GIÁ:
        - **Pronunciation (Phát âm):** Độ rõ ràng, giọng điệu, trọng âm từ, ngữ điệu (thang điểm 0-9)
        - **Fluency & Coherence (Độ trưu chảy & Mạch lạc):** Tự nhiên, dừng nghỉ, do dự, tổ chức logic (0-9)
        - **Lexical Resource (Vốn từ vựng):** Phạm vi từ vựng, độ chính xác, cụm từ, diễn đạt (0-9)
        - **Grammatical Range & Accuracy (Ngữ pháp):** Đa dạng cấu trúc câu, độ chính xác, độ phức tạp (0-9)

        ### ĐỊNH DẠNG ĐẦU RA (PHẢI LÀ JSON HỢP LỆ):
        {
          "overall_band": number (0-9, có thể là số thập phân như 6.5),
          "pronunciation_score": number (0-9),
          "fluency_score": number (0-9),
          "lexical_score": number (0-9),
          "grammar_score": number (0-9),
          "feedback": "2-3 câu nhận xét tổng quan về chất lượng bài nói BẰNG TIẾNG VIỆT",
          "errors": [
            { 
              "type": "pronunciation/grammar/vocabulary", 
              "text": "cụm từ/câu có lỗi",
              "correction": "đề xuất sửa",
              "explanation": "giải thích lỗi BẰNG TIẾNG VIỆT"
            }
          ],
          "suggestions": [
            "Gợi ý cụ thể 1 BẰNG TIẾNG VIỆT",
            "Gợi ý cụ thể 2 BẰNG TIẾNG VIỆT",
            "Gợi ý cụ thể 3 BẰNG TIẾNG VIỆT"
          ]
        }

        **LƯU Ý QUAN TRỌNG:**
        - Tất cả feedback, explanation và suggestions PHẢI BẰNG TIẾNG VIỆT
        - Chỉ giữ nguyên tiếng Anh ở phần "text" và "correction" trong errors
        - Phản hồi phải chi tiết, cụ thể và có tính xây dựng
      `;

      console.log("📤 Sending request to Gemini...");

      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      console.log("📥 Received response from Gemini");

      const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "";

      if (!text) {
        console.error("❌ Empty response from Gemini:", JSON.stringify(result, null, 2));
        throw new Error("No response from Gemini API");
      }

      console.log("📄 Raw Gemini response:", text.substring(0, 200));

      let parsed;
      try {
        // Loại bỏ markdown code blocks nếu có
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        parsed = JSON.parse(cleanText);
      } catch {
        console.warn("⚠️ Response not valid JSON, attempting fallback parse...");
        const match = text.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }

      const finalResult = parsed || {
        overall_band: 5.5,
        pronunciation_score: 5.5,
        fluency_score: 5.5,
        lexical_score: 5.5,
        grammar_score: 5.5,
        feedback:
          "Bài nói của bạn cần cải thiện về phát âm và độ trưu chảy. Hãy cố gắng nói tự nhiên hơn và giảm các từ lấp đầy.",
        errors: [],
        suggestions: [
          "Luyện phát âm các từ khó",
          "Giảm sự do dự và các từ lấp đầy như 'um', 'uh'",
          "Sử dụng từ vựng đa dạng hơn",
        ],
      };

      console.log("💾 Saving to Firestore...");

      // ✅ CHECK EXISTING SUBMISSION
      const submissionsRef = db.collection("speaking_question_submissions");
      const existingSnap = await submissionsRef
        .where("user_id", "==", userId)
        .where("speaking_id", "==", speakingId)
        .where("speaking_questions_id", "==", questionId)
        .limit(1)
        .get();

      let submissionRef;

      if (!existingSnap.empty) {
        // 🔁 Nếu đã tồn tại → Cập nhật lại
        submissionRef = existingSnap.docs[0].ref;
        await submissionRef.update({
          question_text: questionText,
          audio_url: audioUrl,
          transcript,
          ai_score: finalResult.overall_band,
          pronunciation_score: finalResult.pronunciation_score,
          fluency_score: finalResult.fluency_score,
          grammar_score: finalResult.grammar_score,
          vocab_score: finalResult.lexical_score,
          feedback: JSON.stringify(finalResult),
          updated_at: new Date(),
        });
        console.log("🔁 Updated existing speaking question submission:", submissionRef.id);
      } else {
        // 🆕 Nếu chưa có → Tạo mới
        submissionRef = submissionsRef.doc();
        await submissionRef.set({
          question_submission_id: submissionRef.id,
          user_id: userId,
          speaking_id: speakingId,
          speaking_questions_id: questionId,
          question_text: questionText,
          audio_url: audioUrl,
          transcript,
          ai_score: finalResult.overall_band,
          pronunciation_score: finalResult.pronunciation_score,
          fluency_score: finalResult.fluency_score,
          grammar_score: finalResult.grammar_score,
          vocab_score: finalResult.lexical_score,
          feedback: JSON.stringify(finalResult),
          created_at: new Date(),
          updated_at: new Date(),
        });
        console.log("✅ Created new speaking question submission:", submissionRef.id);
      }

      return { ...finalResult, submission_id: submissionRef.id };
    } catch (error) {
      console.error("🔥 Error evaluating speaking:", error);
      throw new Error("Failed to analyze speaking with Gemini: " + error.message);
    }
  },

  /**
   * Tính điểm tổng khi hoàn thành tất cả câu hỏi trong 1 topic
   */
  async calculateOverallScore({ userId, speakingId }) {
    try {
      const snapshot = await db
        .collection("speaking_question_submissions")
        .where("user_id", "==", userId)
        .where("speaking_id", "==", speakingId)
        .get();

      if (snapshot.empty) {
        throw new Error("Không tìm thấy bài nộp nào cho bài luyện tập này");
      }

      const submissions = snapshot.docs.map((doc) => doc.data());

      const avgPronunciation =
        submissions.reduce((sum, s) => sum + s.pronunciation_score, 0) / submissions.length;
      const avgFluency =
        submissions.reduce((sum, s) => sum + s.fluency_score, 0) / submissions.length;
      const avgGrammar =
        submissions.reduce((sum, s) => sum + s.grammar_score, 0) / submissions.length;
      const avgVocab =
        submissions.reduce((sum, s) => sum + s.vocab_score, 0) / submissions.length;

      const overallBand =
        (avgPronunciation + avgFluency + avgGrammar + avgVocab) / 4;

      const overallFeedback = `
        Kết quả tổng thể kỹ năng Speaking:
        - Phát âm: ${avgPronunciation.toFixed(1)}/9
        - Độ trưu chảy & Mạch lạc: ${avgFluency.toFixed(1)}/9
        - Ngữ pháp: ${avgGrammar.toFixed(1)}/9
        - Vốn từ vựng: ${avgVocab.toFixed(1)}/9
        
        Bạn đã hoàn thành tất cả các câu hỏi trong chủ đề này. Hãy tiếp tục luyện tập để cải thiện!
      `;

      const submissionRef = db.collection("speaking_submissions").doc();
      await submissionRef.set({
        submission_id: submissionRef.id,
        user_id: userId,
        speaking_id: speakingId,
        ai_score: parseFloat(overallBand.toFixed(1)),
        pronunciation_score: parseFloat(avgPronunciation.toFixed(1)),
        fluency_score: parseFloat(avgFluency.toFixed(1)),
        grammar_score: parseFloat(avgGrammar.toFixed(1)),
        vocab_score: parseFloat(avgVocab.toFixed(1)),
        feedback: overallFeedback,
        status: "Completed",
        submitted_at: new Date(),
      });

      await db.collection("speaking_practices").doc(speakingId).update({
        attempts: admin.firestore.FieldValue.increment(1),
        updated_at: new Date(),
      });

      console.log("✅ Overall speaking score saved:", submissionRef.id);

      return {
        submission_id: submissionRef.id,
        overall_band: parseFloat(overallBand.toFixed(1)),
        pronunciation_score: parseFloat(avgPronunciation.toFixed(1)),
        fluency_score: parseFloat(avgFluency.toFixed(1)),
        grammar_score: parseFloat(avgGrammar.toFixed(1)),
        vocab_score: parseFloat(avgVocab.toFixed(1)),
        feedback: overallFeedback,
      };
    } catch (error) {
      console.error("🔥 Error calculating overall score:", error);
      throw error;
    }
  },
};