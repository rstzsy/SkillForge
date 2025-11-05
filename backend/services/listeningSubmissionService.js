import { db } from "../config/firebase.js";
import { getListeningPracticeById } from "./listeningService.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const COLLECTION_NAME = "listening_submissions";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// saving user tesst
export const submitListeningPractice = async (submissionData) => {
  const {
    user_id,
    practice_id,
    user_answer,
    correct_answer = "",
    score = 0,
    duration_seconds = 0,
    feedback = "",
  } = submissionData;

  // check data
  if (!user_id || !practice_id || !user_answer) {
    throw new Error(
      "Missing required fields: user_id, practice_id, user_answer"
    );
  }

  try {
    // firestore khong chap nhan undefine
    const docRef = await db.collection(COLLECTION_NAME).add({
      user_id: String(user_id),
      practice_id: String(practice_id),
      user_answer: JSON.stringify(user_answer), 
      correct_answer: String(correct_answer),
      score: Number(score),
      duration_seconds: Number(duration_seconds),
      status: "submitted",
      submitted_at: new Date(),
      feedback: String(feedback),
    });

    return { id: docRef.id, ...submissionData };
  } catch (err) {
    console.error("Error saving submission:", err);
    throw new Error(err.message);
  }
};

// submission list
export const getUserSubmissions = async (user_id) => {
  if (!user_id) throw new Error("Missing user_id");
  try {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("user_id", "==", String(user_id))
      .get();

    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (err) {
    console.error("Error fetching user submissions:", err);
    throw new Error(err.message);
  }
};

// submission by id
export const getSubmissionById = async (id) => {
  if (!id) throw new Error("Missing submission ID");
  try {
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) throw new Error("Submission not found");
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("Error fetching submission:", err);
    throw new Error(err.message);
  }
};

// cham diem submission theo id
export const gradeListeningSubmission = async (submissionId) => {
  if (!submissionId) throw new Error("Missing submission ID");

  // get submission id
  const submission = await getSubmissionById(submissionId);

  // Parse user_answer
  let userAnswers = {};
  try {
    userAnswers = JSON.parse(submission.user_answer || "{}");
  } catch (err) {
    console.warn("Cannot parse user_answer:", err);
  }

  // get practice to get correct answer
  const practice = await getListeningPracticeById(submission.practice_id);
  const correctAnswerString = practice.correct_answer || "";

  const correctAnswers = {};
  correctAnswerString.split(",").forEach((ans, index) => {
    correctAnswers[index + 1] = ans.trim();
  });

  // tính điểm
  const total = Object.keys(correctAnswers).length;
  let score = 0;
  Object.keys(correctAnswers).forEach((key) => {
    if (
      userAnswers[key] &&
      userAnswers[key].trim().toLowerCase() ===
        correctAnswers[key].trim().toLowerCase()
    ) {
      score++;
    }
  });
  const percent = total > 0 ? (score / total) * 100 : 0;

  // call AI for feedback + predicted IELTS band
  let aiFeedback = {};
  let overband = null;
  try {
    const prompt = `
Bạn là giáo viên IELTS Listening chuyên nghiệp. Hãy phân tích bài làm của học viên:

User Answers: ${JSON.stringify(userAnswers)}
Correct Answers: ${JSON.stringify(correctAnswers)}

Yêu cầu:
- Đánh giá từng câu trả lời đúng/sai
- Phân tích chi tiết từng blank
- Đưa ra các gợi ý cải thiện
- Đưa ra **ước lượng điểm IELTS Listening (band score từ 0–9)** dựa trên bài làm
- Phản hồi bắt buộc ở JSON format như sau:
{
  "feedback": "Tóm tắt nhận xét 2-3 câu",
  "detailed_feedback": {
    "1": "Nhận xét blank 1",
    "2": "Nhận xét blank 2"
  },
  "suggestions": [
    "1–3 gợi ý ngắn gọn cải thiện kỹ năng listening"
  ],
  "overband": 0 // điểm IELTS Listening do AI ước lượng
}
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.7,
      max_output_tokens: 400,
    });

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (text) {
      try {
        // Parse JSON
        const match = text.match(/\{[\s\S]*\}/);
        aiFeedback = match ? JSON.parse(match[0]) : null;
        overband = aiFeedback?.overband ?? null;
      } catch (err) {
        console.warn("⚠️ Cannot parse AI response as JSON:", err);
        aiFeedback = { feedback: text, detailed_feedback: {}, suggestions: [] };
      }
    }

    if (!aiFeedback) {
      aiFeedback = {
        feedback:
          "Your listening is partially correct. Focus on keywords and vocabulary.",
        detailed_feedback: {},
        suggestions: [
          "Listen carefully to keywords.",
          "Practice with similar exercises.",
          "Review vocabulary for common topics.",
        ],
        overband: null,
      };
    }
  } catch (err) {
    console.error("Error fetching AI feedback:", err);
    aiFeedback = {
      feedback:
        "Your listening is partially correct. Focus on keywords and vocabulary.",
      detailed_feedback: {},
      suggestions: [
        "Listen carefully to keywords.",
        "Practice with similar exercises.",
        "Review vocabulary for common topics.",
      ],
      overband: null,
    };
  }

  // update overband to firestore
  await db.collection("listening_submissions").doc(submissionId).update({
    score,
    overband, 
    updated_at: new Date(),
  });

  return {
    submissionId,
    score,
    total,
    percent,
    userAnswers,
    correctAnswers,
    practiceTitle: practice.title,
    aiFeedback,
    overband,
  };
};

