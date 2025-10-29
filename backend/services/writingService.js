import * as XLSX from "xlsx";
import fs from "fs";
import { db } from "../config/firebase.js";

export const WritingService = {
  async importExcel(filePath) {
    try {
      // Đọc file Excel từ đường dẫn tạm
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (!data.length) throw new Error("Excel file is empty");

      console.log("🧾 Read rows from Excel:", data.length);

      // Duyệt từng dòng trong Excel và lưu vào Firestore
      for (const row of data) {
        const {
          section = "Task 1",
          title = "Untitled",
          type = "Academic",
          question_text = "",
          image_url = "",
          time_limit = 40,
          attempts = 0,
          status = "Not Started",
        } = row;

        // ✅ Dùng cú pháp chuẩn của Firebase Admin SDK
        const docRef = await db.collection("writing_practices").add({
          section,
          title,
          type,
          question_text,
          image_url,
          time_limit,
          attempts,
          status,
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log(`✅ Added doc: ${docRef.id} (${title})`);
      }

      console.log("✅ Import completed successfully!");
      return { message: `Imported ${data.length} writing tasks successfully.` };
    } catch (error) {
      console.error("🔥 Error importing Excel:", error);
      throw new Error("Failed to import Excel file");
    }
  },
};
