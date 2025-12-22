import { db } from "../config/firebase.js";
import { getReadingPracticeById } from "./readingService.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const COLLECTION_NAME = "reading_submissions";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// save submission task in firestore
export const submitReadingPractice = async (submissionData) => {
  const {
    user_id,
    practice_id,
    user_answers,
    score = 0,
    time_spent = 0,
    attempt_number = 1,
  } = submissionData;

  if (!user_id || !practice_id || !user_answers) {
    throw new Error(
      "Missing required fields: user_id, practice_id, user_answers"
    );
  }

  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      user_id: String(user_id),
      practice_id: String(practice_id),
      user_answers: JSON.stringify(user_answers),
      score: Number(score),
      time_spent: Number(time_spent),
      attempt_number: Number(attempt_number),
      submitted_at: new Date(),
      updated_at: new Date(),
    });

    return { id: docRef.id, ...submissionData };
  } catch (err) {
    console.error("Error saving reading submission:", err);
    throw new Error(err.message);
  }
};

// get all user submission
export const getUserReadingSubmissions = async (user_id) => {
  if (!user_id) throw new Error("Missing user_id");
  try {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("user_id", "==", String(user_id))
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching reading submissions:", err);
    throw new Error(err.message);
  }
};

// get submission by id
export const getReadingSubmissionById = async (id) => {
  if (!id) throw new Error("Missing submission ID");
  try {
    const doc = await db.collection("reading_submissions").doc(id).get();
    if (!doc.exists) throw new Error("Reading submission not found");
    return { submission_id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("Error fetching reading submission:", err);
    throw new Error(err.message);
  }
};

// score and ai feedback
export const gradeReadingSubmission = async (submissionId) => {
  if (!submissionId) throw new Error("Missing submission ID");

  // ---------- LẤY SUBMISSION ----------
  const submission = await getReadingSubmissionById(submissionId);

  let userAnswers = {};
  try {
    userAnswers = JSON.parse(submission.user_answers || "{}");
  } catch (err) {
    console.warn("Cannot parse user_answers:", err);
  }

  // ---------- LẤY PRACTICE ----------
  const practice = await getReadingPracticeById(submission.practice_id);

  let correctAnswers = {};
  let score = 0;
  let total = 0;
  let mcqQuestions = [];

  if (practice.type === "Multiple Choice") {
    // MCQ: parse câu hỏi
    const text = practice.content_text || "";
    const blocks = text.split(/Question\s*\d+:/g).filter(b => b.trim());
    total = blocks.length;

    blocks.forEach((raw, index) => {
      const block = raw.trim();
      if (!block) return;

      const questionMatch = block.match(/^(.*?)(?=A\.)/s);
      const questionText = questionMatch ? questionMatch[1].trim() : "";

      const choice = (letter) => {
        const regex = new RegExp(`${letter}\\.\\s*(.*?)(?=(A\\.|B\\.|C\\.|D\\.|$))`, "s");
        const match = block.match(regex);
        return match ? match[1].trim() : "";
      };

      const qNum = index + 1;
      mcqQuestions.push({
        number: qNum,
        question: questionText,
        A: choice("A"),
        B: choice("B"),
        C: choice("C"),
        D: choice("D"),
      });

      const correctLetter = (practice.correct_answer || "").split(",")[index]?.trim() || "";
      correctAnswers[qNum] = correctLetter;

      const userAns = userAnswers[qNum] || "";
      const correctArr = correctLetter.split(",").map(l => l.trim().toUpperCase());
      const userArr = userAns.split(",").map(l => l.trim().toUpperCase());

      if (
        userArr.length === correctArr.length &&
        userArr.every((v, i) => v === correctArr[i])
      ) {
        score++;
      }
    });

    userAnswers.mcqQuestions = mcqQuestions;

  } else {
    // non-MCQ
    (practice.correct_answer || "").split(",").forEach((ans, index) => {
      const qNum = index + 1;
      correctAnswers[qNum] = ans.trim();
      if (
        userAnswers[qNum] &&
        userAnswers[qNum].trim().toLowerCase() === correctAnswers[qNum].trim().toLowerCase()
      ) {
        score++;
      }
    });
    total = Object.keys(correctAnswers).length;
  }

  const percent = total > 0 ? (score / total) * 100 : 0;

  // ---------- AI FEEDBACK ----------
  let aiFeedback = {};
  try {
    const prompt = `
Bạn là giáo viên tiếng Anh chuyên về Reading. Hãy phân tích bài làm đọc hiểu của học viên chi tiết.

User Answers: ${JSON.stringify(userAnswers)}
Correct Answers: ${JSON.stringify(correctAnswers)}

Yêu cầu:
- Đánh giá từng câu trả lời đúng/sai
- Phân tích lý do sai (từ vựng, ngữ pháp, hiểu sai đoạn)
- Đưa ra các gợi ý cải thiện
- ước lượng điểm IELTS Reading (overband)
- Phản hồi bắt buộc ở JSON format như sau:
{
  "feedback": "Tóm tắt nhận xét 2-3 câu",
  "detailed_feedback": {
    "1": "Nhận xét câu 1",
    "2": "Nhận xét câu 2"
  },
  "suggestions": [
    "1-3 gợi ý cải thiện kỹ năng reading"
  ],
  "overband": 0
}
`;
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.7,
      max_output_tokens: 400,
    });

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (text) {
      try {
        const match = text.match(/\{[\s\S]*\}/);
        let jsonString = match ? match[0] : null;
        if (jsonString) {
          jsonString = jsonString.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
          aiFeedback = JSON.parse(jsonString);
        } else {
          aiFeedback = { feedback: text, detailed_feedback: {}, suggestions: [], overband: null };
        }
      } catch (err) {
        console.warn("⚠️ Cannot parse AI response as JSON:", err);
        aiFeedback = { feedback: text, detailed_feedback: {}, suggestions: [], overband: null };
      }
    }

    if (!aiFeedback) {
      aiFeedback = {
        feedback: "Your reading is partially correct. Focus on comprehension and inference.",
        detailed_feedback: {},
        suggestions: [
          "Practice identifying main ideas.",
          "Improve vocabulary comprehension.",
          "Read articles and summarize key points.",
        ],
        overband: null,
      };
    }
  } catch (err) {
    console.error("Error generating AI feedback:", err);
    aiFeedback = {
      feedback: "Your reading is partially correct. Focus on comprehension and inference.",
      detailed_feedback: {},
      suggestions: [
        "Practice identifying main ideas.",
        "Improve vocabulary comprehension.",
        "Read articles and summarize key points.",
      ],
      overband: null,
    };
  }

  // ---------- LƯU VÀ FIRESTORE ----------
  await db.collection("reading_submissions").doc(submissionId).update({
    score,
    updated_at: new Date(),
    overband: aiFeedback.overband ?? null,
    aiFeedback,
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
    type: practice.type,
    content_text: practice.content_text,
    mcqQuestions: userAnswers.mcqQuestions || [],
  };
};


