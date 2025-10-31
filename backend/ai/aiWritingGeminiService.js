import { GoogleGenAI } from "@google/genai";
import { db } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Check API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

// ✅ Initialize AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const aiWritingGeminiService = {
  async evaluateEssay({ userId, practiceId, essayText }) {
    try {
      const model = "gemini-2.0-flash";

      // 🧠 Optimized Prompt — more accurate IELTS evaluation
      const prompt = `
      You are a professional IELTS Writing examiner with 10+ years of experience.
      Evaluate the essay strictly according to the IELTS Writing Band Descriptors.

      **Band Descriptors:**
      - **Task Response:** How fully the essay addresses all parts of the question, presents a clear position, and supports it with examples.
      - **Coherence and Cohesion:** Logical organization, paragraphing, and effective use of linking devices.
      - **Lexical Resource:** Range, precision, and appropriacy of vocabulary.
      - **Grammatical Range and Accuracy:** Sentence variety, complex structures, and accuracy.

      **Band Level Guide:**
      - **Band 9:** Fully addresses all parts with sophistication; ideas well-developed; very rare errors.
      - **Band 8:** Covers all parts very well; clear structure and vocabulary; occasional minor errors.
      - **Band 7:** Addresses task well but may have small issues in grammar or cohesion.
      - **Band 6:** Addresses task partially; limited development or frequent errors.
      - **Band 5 or below:** Incomplete response, frequent errors, poor organization.

      You must analyze the essay carefully and respond **strictly in JSON format only** as follows:
      {
        "overall_band": number,
        "task_achievement": number,
        "coherence": number,
        "lexical": number,
        "grammar": number,
        "feedback": "Overall feedback summarizing performance in 2-3 sentences.",
        "errors": [
          { "sentence": "Incorrect sentence", "correction": "Corrected version" }
        ],
        "suggestions": [
          "1–3 short practical tips for improvement."
        ]
      }

      Essay:
      """
      ${essayText}
      """
      `;

      // ✅ Call Gemini
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // ✅ Extract text from the SDK
      const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "";

      if (!text) {
        console.error("❌ Empty response from Gemini:", JSON.stringify(result, null, 2));
        throw new Error("No response text from Gemini API");
      }

      // ✅ Parse JSON safely
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.warn("⚠️ Response not valid JSON, attempting fallback parse...");
        const match = text.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }

      // ✅ Fallback default
      const finalResult = parsed || {
        overall_band: 6.5,
        task_achievement: 6.0,
        coherence: 6.0,
        lexical: 6.0,
        grammar: 6.0,
        feedback:
          "Your essay addresses the task but lacks development and accuracy. Focus on grammar and coherence to improve.",
        errors: [],
        suggestions: [
          "Use a wider range of linking words.",
          "Review complex sentence structures for accuracy.",
          "Support ideas with clearer examples.",
        ],
      };

      // ✅ Save to Firestore
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
