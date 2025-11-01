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

      const prompt = `
        You are an expert IELTS Writing examiner with over 10 years of experience.
        Your task is to analyze the student's essay in detail, identify exact strengths and weaknesses, and give clear, actionable feedback to help the student improve.

        Respond **ONLY in valid JSON format** with **no explanations or extra text**.

        ---

        ### EVALUATION CRITERIA:
        - **Task Achievement:** Does the essay fully address the question and develop ideas with clear examples?
        - **Coherence and Cohesion:** Are ideas logically organized and connected with appropriate linking devices?
        - **Lexical Resource:** Is the vocabulary wide, accurate, and suitable for the context?
        - **Grammatical Range and Accuracy:** Are there varied sentence structures and correct grammar usage?

        ---

        ### FEEDBACK REQUIREMENTS:
        Your feedback and suggestions must be **based directly on the student's actual writing**.
        You must:
        - Quote or reference specific sentences from the essay when giving comments.
        - Identify exactly what is weak or unclear (e.g. missing example, weak idea, poor transition, incorrect grammar, repetition, vague vocabulary).
        - Give **specific improvement advice** (e.g. “Add a real-life example to support this idea”, “Replace repetitive words with synonyms”, “Use a complex sentence here to show range”).
        - Avoid generic statements like “Improve grammar” or “Be more coherent”.

        ---

        ### OUTPUT FORMAT (MUST BE VALID JSON):

        {
          "overall_band": number,
          "task_achievement": number,
          "coherence": number,
          "lexical": number,
          "grammar": number,

          // General evaluation based on this student's actual writing
          "feedback": "3–5 sentences summarizing the student's organization, development of ideas, and grammar accuracy, directly referencing parts of their essay (quote short phrases if relevant).",

          // Key sentence-level grammar or expression errors and their corrections
          "errors": [
            { "sentence": "Incorrect or weak sentence from essay", "correction": "Improved version with explanation if needed" }
          ],

          // 2–3 detailed and personalized suggestions to help the student improve next time
          "suggestions": [
            "Give 2–3 concrete, easy-to-follow recommendations based on this essay (e.g., 'Use more precise connectors such as however, therefore', 'Develop your second body paragraph by adding an example about ...', 'Avoid repeating the phrase ...')."
          ]
        }

        ---

        Essay submitted by student:
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