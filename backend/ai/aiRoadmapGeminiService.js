import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const aiRoadmapGeminiService = {
  async generateRoadmap({ userName, currentBand, targetBand, targetDate, prioritySkills }) {
    const model = "gemini-2.0-flash";
    const prompt = `
You are an IELTS learning planner AI.

Given this student's info:
- Name: ${userName}
- Current Band: ${currentBand}
- Target Band: ${targetBand}
- Deadline: ${targetDate}
- Priority Skills: ${prioritySkills.join(", ")}

Create a **personalized IELTS roadmap** with exactly 4 clear steps.

Each step must have:
- step_order (1–4)
- title (short, motivating)
- description (concise, around 25–35 words, one sentence only)
- estimated_duration_days

Respond ONLY in **valid JSON**, structure exactly like this:
{
  "summary": "Short overview of the student's recommended plan (one sentence).",
  "steps": [
    { "step_order": 1, "title": "Initial Assessment", "description": "Take a short IELTS mock test to identify your starting level and key improvement areas.", "estimated_duration_days": 7 },
    { "step_order": 2, "title": "Focused Skill Practice", "description": "Strengthen priority skills through structured daily practice and short review sessions.", "estimated_duration_days": 30 },
    { "step_order": 3, "title": "Mock Tests & Feedback", "description": "Take mock tests bi-weekly and apply targeted feedback to boost performance.", "estimated_duration_days": 45 },
    { "step_order": 4, "title": "Final Preparation", "description": "Refine your test strategy, manage time effectively, and build exam confidence.", "estimated_duration_days": 30 }
  ]
}
    `;

    try {
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      let rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      // ✅ Làm sạch ký hiệu ```json nếu có
      rawText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      // ✅ Parse JSON
      const parsed = JSON.parse(rawText);
      return parsed;
    } catch (error) {
      console.error("⚠️ Gemini returned invalid JSON or API error:", error);
      return {
        summary: "General IELTS improvement plan (fallback).",
        steps: [
          {
            step_order: 1,
            title: "Diagnostic Test & Goal Setup",
            description: "Take a short IELTS test and set clear learning goals for improvement.",
            estimated_duration_days: 7,
          },
          {
            step_order: 2,
            title: "Skill Practice",
            description: "Focus on your weakest skills through short, daily, structured practice.",
            estimated_duration_days: 30,
          },
          {
            step_order: 3,
            title: "Mock Tests & Feedback",
            description: "Simulate test conditions and learn from detailed performance feedback.",
            estimated_duration_days: 45,
          },
          {
            step_order: 4,
            title: "Final Review",
            description: "Refine exam techniques, manage timing, and build confidence before test day.",
            estimated_duration_days: 30,
          },
        ],
      };
    }
  },
};
