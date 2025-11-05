import { GoogleGenAI } from "@google/genai";
import { db } from "../config/firebase.js";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  async evaluateEssay({ userId, practiceId, essayText, imageUrl, section }) {
    try {
      const model = "gemini-2.0-flash";

      let prompt = "";
      let parts = [];

      if (section === "Task 1" && imageUrl) {
        const prompt = `
          You are a certified IELTS Writing Task 1 examiner with extensive experience in assessing visual data descriptions.

          CRITICAL INSTRUCTIONS:
          - Respond ONLY with a valid JSON object.
          - Do NOT include Markdown formatting, backticks, or extra explanations.
          - Follow the structure EXACTLY as shown below.

          TASK CONTEXT:
          The student was asked to describe the chart, graph, or diagram provided in the image.

          STEP 1 — IMAGE ANALYSIS:
          Examine the provided image carefully and summarize:
          - The **type of visual** (bar chart, line graph, pie chart, process diagram, map, etc.)
          - The **main features, trends, and data patterns** visible
          - **Key comparisons** or contrasts that stand out
          - Any **important details or anomalies**

          STEP 2 — ESSAY EVALUATION:
          Now evaluate the student's essay in relation to the image:
          - **Task Achievement:** Does the essay accurately describe the key features of the visual? Are important data and comparisons mentioned? Is there an overview?
          - **Coherence & Cohesion:** Are ideas logically organized? Are linking devices used effectively?
          - **Lexical Resource:** Is vocabulary varied, precise, and suitable for describing data and trends?
          - **Grammatical Range & Accuracy:** Are sentence structures varied and mostly error-free?
          - Identify **specific factual, lexical, or grammatical mistakes**, and show **corrected versions**.

          STEP 3 — FEEDBACK GENERATION:
          Provide a rich, detailed feedback section that includes:
          - Clear explanation of major strengths and weaknesses
          - Specific examples from the student's essay
          - Practical suggestions for improvement with examples (e.g., “Instead of saying ‘increase a lot’, try ‘rose sharply from 20% to 40%’”)

          RESPOND WITH THIS EXACT JSON STRUCTURE:

          {
            "overall_band": 7.0,
            "task_achievement": 7.0,
            "coherence": 7.0,
            "lexical": 7.0,
            "grammar": 7.0,
            "feedback": "Comprehensive evaluation explaining how accurately and effectively the essay describes the image.",
            "errors": [
              {
                "sentence": "Incorrect sentence from the essay",
                "correction": "Corrected and improved version",
                "explanation": "Explain why it is wrong and how it can be improved"
              }
            ],
            "suggestions": [
              "Detailed improvement advice with concrete examples of better phrasing and organization",
              "Explain how to better interpret and summarize key trends from the image"
            ],
            "image_analysis": "Describe in 2–4 sentences what the image shows (e.g., 'The bar chart compares the percentage of renewable energy used in five European countries between 2000 and 2020. Germany shows a steady rise while France remains stable.')"
          }

          STUDENT'S ESSAY:
          """
          ${essayText}
          """
        `;


        // ✅ Đọc ảnh từ file local
        const imageData = await this.fetchImageAsBase64(imageUrl);
        
        parts = [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png", // hoặc "image/jpeg"
              data: imageData,
            },
          },
        ];
      } else {
        // Task 2 - giữ nguyên prompt cũ
        prompt = `
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
          - Give **specific improvement advice** (e.g. "Add a real-life example to support this idea", "Replace repetitive words with synonyms", "Use a complex sentence here to show range").
          - Avoid generic statements like "Improve grammar" or "Be more coherent".

          ---

          ### OUTPUT FORMAT (MUST BE VALID JSON):

          {
            "overall_band": number,
            "task_achievement": number,
            "coherence": number,
            "lexical": number,
            "grammar": number,
            "feedback": "3–5 sentences summarizing the student's organization, development of ideas, and grammar accuracy, directly referencing parts of their essay (quote short phrases if relevant).",
            "errors": [
              { "sentence": "Incorrect or weak sentence from essay", "correction": "Improved version with explanation if needed" }
            ],
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
        parts = [{ text: prompt }];
      }

      // ✅ Call Gemini
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
      });

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
        // Thử parse trực tiếp
        parsed = JSON.parse(text);
      } catch (err) {
        console.warn("⚠️ Response not valid JSON, attempting fallback parse...");
        console.log("📄 Raw response:", text); // ✅ DEBUG: Xem response thô
        
        // Loại bỏ markdown code fence nếu có
        let cleanText = text
          .replace(/```json\n/g, "")
          .replace(/```\n/g, "")
          .replace(/```/g, "")
          .trim();
        
        try {
          parsed = JSON.parse(cleanText);
        } catch {
          // Fallback: Tìm JSON object trong text
          const match = cleanText.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch {
              console.error("❌ Cannot parse JSON from response");
            }
          }
        }
      }

      // ✅ Log kết quả để kiểm tra
      console.log("🧠 Parsed result:", JSON.stringify(parsed, null, 2));

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
        image_analysis: "Image analysis failed",
      };

      // ✅ Save to Firestore
      const docRef = await db.collection("writing_submissions").add({
        user_id: userId,
        practice_id: practiceId,
        essay_text: essayText,
        image_url: imageUrl || null,
        section: section,
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

  // ✅ Đọc ảnh từ local hoặc fetch từ URL
  async fetchImageAsBase64(imageUrl) {
    try {
      // ✅ Nếu là URL đầy đủ → fetch từ internet
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        console.log("🖼️ Fetching image from URL:", imageUrl);
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      }

      // ✅ Nếu là đường dẫn tương đối → đọc từ frontend/public
      // Giả sử cấu trúc: backend/ và frontend/ cùng cấp
      const frontendPublicPath = path.join(__dirname, "../../frontend/public", imageUrl);
      console.log("🖼️ Reading local image:", frontendPublicPath);

      const buffer = await fs.readFile(frontendPublicPath);
      return buffer.toString("base64");
    } catch (error) {
      console.error("❌ Error fetching image:", error);
      throw new Error(`Cannot read image from ${imageUrl}`);
    }
  },
};