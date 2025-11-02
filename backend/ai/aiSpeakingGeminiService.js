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
        You are an expert IELTS Speaking examiner with over 10 years of experience.
        Evaluate this spoken response based on IELTS Speaking criteria.

        **Section:** ${section}
        **Question:** ${questionText}
        **Student's transcribed answer:** ${transcript}

        Respond **ONLY in valid JSON format** with no extra text.

        ### EVALUATION CRITERIA:
        - **Pronunciation:** Clarity, accent, word stress, intonation (0-9 scale)
        - **Fluency & Coherence:** Natural flow, pauses, hesitation, logical organization (0-9 scale)
        - **Lexical Resource:** Vocabulary range, accuracy, collocations, paraphrasing (0-9 scale)
        - **Grammatical Range & Accuracy:** Sentence variety, grammar correctness, complexity (0-9 scale)

        ### OUTPUT FORMAT (MUST BE VALID JSON):
        {
          "overall_band": number (0-9, can be decimal like 6.5),
          "pronunciation_score": number (0-9),
          "fluency_score": number (0-9),
          "lexical_score": number (0-9),
          "grammar_score": number (0-9),
          "feedback": "2-3 sentences summarizing the response quality.",
          "errors": [
            { 
              "type": "pronunciation/grammar/vocabulary", 
              "text": "problem phrase",
              "correction": "suggestion",
              "explanation": "why"
            }
          ],
          "suggestions": [
            "Specific tip 1",
            "Specific tip 2",
            "Specific tip 3"
          ]
        }
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
        parsed = JSON.parse(text);
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
          "Your answer needs improvement in pronunciation and fluency. Try to speak more naturally.",
        errors: [],
        suggestions: [
          "Practice pronunciation of difficult words",
          "Reduce hesitation and filler words",
          "Use more varied vocabulary",
        ],
      };

      console.log("💾 Saving to Firestore...");

      // ✅ Lưu kết quả chi tiết từng câu hỏi
      const submissionRef = db.collection("speaking_question_submissions").doc();
      await submissionRef.set({
        question_submission_id: submissionRef.id,
        user_id: userId,
        speaking_id: speakingId,
        speaking_questions_id: questionId,
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

      console.log("✅ Speaking question evaluation saved:", submissionRef.id);
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
        throw new Error("No submissions found for this speaking practice");
      }

      const submissions = snapshot.docs.map((doc) => doc.data());

      const avgPronunciation =
        submissions.reduce((sum, s) => sum + s.pronunciation_score, 0) /
        submissions.length;
      const avgFluency =
        submissions.reduce((sum, s) => sum + s.fluency_score, 0) /
        submissions.length;
      const avgGrammar =
        submissions.reduce((sum, s) => sum + s.grammar_score, 0) /
        submissions.length;
      const avgVocab =
        submissions.reduce((sum, s) => sum + s.vocab_score, 0) /
        submissions.length;

      const overallBand =
        (avgPronunciation + avgFluency + avgGrammar + avgVocab) / 4;

      const overallFeedback = `
        Overall Speaking Performance:
        - Pronunciation: ${avgPronunciation.toFixed(1)}/9
        - Fluency & Coherence: ${avgFluency.toFixed(1)}/9
        - Grammatical Range: ${avgGrammar.toFixed(1)}/9
        - Lexical Resource: ${avgVocab.toFixed(1)}/9
        
        You have completed all questions in this topic. Keep practicing to improve!
      `;

      // ✅ Lưu kết quả tổng
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

      // ✅ FIX: dùng admin.firestore.FieldValue thay vì db.FieldValue
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
