import * as XLSX from "xlsx";
import fs from "fs";
import { db } from "../config/firebase.js";
import { SpeakingPractice } from "../models/speakingPractice.js";
import { SpeakingQuestion } from "../models/speakingQuestion.js";

export const SpeakingService = {
  async importExcel(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (!data.length) throw new Error("Excel file is empty");
      console.log(`🧾 Found ${data.length} rows in Excel`);

      for (const row of data) {
        const {
          Section = "Part 1",
          Topic = "Untitled Topic",
          Type = "General",
          TimeLimit = 2,
          ...questions
        } = row;

        // ✅ Tạo document ID trước để dùng cho cả practice & questions
        const practiceRef = db.collection("speaking_practices").doc();

        const practice = new SpeakingPractice({
          speaking_practices_id: practiceRef.id, // ✅ Gán ID vào đây
          section: Section,
          topic: Topic,
          type: Type,
          time_limit: Number(TimeLimit),
        });

        // ✅ Lưu vào Firestore (dùng set thay vì add)
        await practiceRef.set({ ...practice });

        console.log(`🗂️ Added SpeakingPractice: ${Topic}`);

        // ✅ Lấy tất cả cột có chứa "Question"
        const questionList = Object.keys(questions)
          .filter((key) => key.toLowerCase().includes("question"))
          .map((key, index) => ({
            question_text: questions[key],
            question_order: index + 1,
          }))
          .filter((q) => q.question_text && q.question_text.trim() !== "");

        // ✅ Lưu các câu hỏi
        for (const q of questionList) {
          const question = new SpeakingQuestion({
            speaking_id: practiceRef.id,
            question_text: q.question_text,
            question_order: q.question_order,
          });

          await practiceRef.collection("questions").add({ ...question });
        }

        console.log(`✅ Added ${questionList.length} questions for "${Topic}"`);
      }

      return { message: `Imported ${data.length} speaking practices successfully.` };
    } catch (error) {
      console.error("🔥 Error importing Speaking Excel:", error);
      throw new Error("Failed to import Speaking Excel file");
    }
  },
};