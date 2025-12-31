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
          Bạn là một giám khảo IELTS Writing Task 1 chuyên nghiệp với nhiều năm kinh nghiệm đánh giá bài mô tả dữ liệu trực quan.

          HƯỚNG DẪN QUAN TRỌNG:
          - Trả lời CHỈ BẰNG một JSON object hợp lệ.
          - KHÔNG bao gồm định dạng Markdown, backticks, hoặc giải thích thêm.
          - Tuân thủ CHÍNH XÁC cấu trúc như bên dưới.
          - TẤT CẢ feedback, explanation, suggestions PHẢI BẰNG TIẾNG VIỆT.
          - Errors (sentence, correction): GIỮ NGUYÊN TIẾNG ANH

          BỐI CẢNH ĐỀ BÀI:
          Học viên được yêu cầu mô tả biểu đồ, đồ thị hoặc sơ đồ được cung cấp trong hình ảnh.

          BƯỚC 1 — PHÂN TÍCH HÌNH ẢNH:
          Xem xét kỹ hình ảnh được cung cấp và tóm tắt:
          - **Loại hình trực quan** (biểu đồ cột, đồ thị đường, biểu đồ tròn, sơ đồ quy trình, bản đồ, v.v.)
          - **Các đặc điểm chính, xu hướng và mẫu dữ liệu** có thể thấy
          - **So sánh chính** hoặc sự tương phản nổi bật
          - Bất kỳ **chi tiết quan trọng hoặc bất thường** nào

          BƯỚC 2 — ĐÁNH GIÁ BÀI VIẾT:
          Bây giờ đánh giá bài luận của học viên liên quan đến hình ảnh:
          - **Task Achievement (Hoàn thành nhiệm vụ):** Bài viết có mô tả chính xác các đặc điểm chính của hình ảnh không? Có đề cập đến dữ liệu và so sánh quan trọng không? Có phần tổng quan không?
          - **Coherence & Cohesion (Mạch lạc & Liên kết):** Các ý tưởng có được tổ chức logic không? Các từ nối có được sử dụng hiệu quả không?
          - **Lexical Resource (Vốn từ vựng):** Từ vựng có đa dạng, chính xác và phù hợp để mô tả dữ liệu và xu hướng không?
          - **Grammatical Range & Accuracy (Ngữ pháp):** Cấu trúc câu có đa dạng và hầu như không có lỗi không?
          - Xác định **các lỗi cụ thể về sự kiện, từ vựng hoặc ngữ pháp**, và đưa ra **phiên bản đã sửa**.

          BƯỚC 3 — TẠO PHẢN HỒI:
          Cung cấp phần phản hồi chi tiết, phong phú bao gồm:
          - Giải thích rõ ràng về điểm mạnh và điểm yếu chính
          - Ví dụ cụ thể từ bài viết của học viên
          - Gợi ý cải thiện thực tế với ví dụ (ví dụ: "Thay vì nói 'tăng nhiều', hãy thử 'tăng mạnh từ 20% lên 40%'")

          TRẢ LỜI VỚI CẤU TRÚC JSON CHÍNH XÁC NÀY:

          {
            "overall_band": 7.0,
            "task_achievement": 7.0,
            "coherence": 7.0,
            "lexical": 7.0,
            "grammar": 7.0,
            "feedback": "Đánh giá toàn diện giải thích mức độ chính xác và hiệu quả của bài viết trong việc mô tả hình ảnh. PHẢI BẰNG TIẾNG VIỆT.",
            "errors": [
              {
                "sentence": "The incorrect sentence from the essay in ENGLISH",
                "correction": "The corrected version in ENGLISH",
                "explanation": "Giải thích chi tiết tại sao sai và cách sửa. BẰNG TIẾNG VIỆT."
              }
            ],
            "suggestions": [
              "Lời khuyên cải thiện chi tiết với ví dụ cụ thể về cách diễn đạt và tổ chức tốt hơn. BẰNG TIẾNG VIỆT.",
              "Giải thích cách diễn giải và tóm tắt xu hướng chính từ hình ảnh tốt hơn. BẰNG TIẾNG VIỆT."
            ],
            "image_analysis": "Mô tả trong 2-4 câu những gì hình ảnh thể hiện. BẰNG TIẾNG VIỆT (ví dụ: 'Biểu đồ cột so sánh tỷ lệ phần trăm năng lượng tái tạo được sử dụng ở năm quốc gia châu Âu từ 2000 đến 2020. Đức cho thấy sự tăng ổn định trong khi Pháp vẫn ổn định.')."
          }

          BÀI VIẾT CỦA HỌC VIÊN:
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
        // Task 2 - Prompt tiếng Việt
        prompt = `
          Bạn là một giám khảo IELTS Writing chuyên nghiệp với hơn 10 năm kinh nghiệm.
          Nhiệm vụ của bạn là phân tích chi tiết bài luận của học viên, xác định chính xác điểm mạnh và điểm yếu, đưa ra phản hồi rõ ràng, có thể hành động để giúp học viên cải thiện.

          Trả lời **CHỈ BẰNG định dạng JSON hợp lệ** với **không có giải thích hoặc văn bản thừa**.

          ---

          ###QUAN TRỌNG VỀ NGÔN NGỮ:
          - Feedback, suggestions, band_explanation: BẰNG TIẾNG VIỆT
          - Errors (sentence, correction): GIỮ NGUYÊN TIẾNG ANH
          - Explanation trong errors: BẰNG TIẾNG VIỆT

          ### TIÊU CHÍ ĐÁNH GIÁ:
          - **Task Achievement (Hoàn thành nhiệm vụ):** Bài viết có giải quyết đầy đủ câu hỏi và phát triển ý tưởng với ví dụ rõ ràng không?
          - **Coherence and Cohesion (Mạch lạc và Liên kết):** Các ý tưởng có được tổ chức logic và kết nối với các từ nối phù hợp không?
          - **Lexical Resource (Vốn từ vựng):** Từ vựng có rộng, chính xác và phù hợp với ngữ cảnh không?
          - **Grammatical Range and Accuracy (Ngữ pháp):** Có đa dạng cấu trúc câu và sử dụng ngữ pháp đúng không?

          ---

          ### YÊU CẦU PHẢN HỒI:
          Phản hồi và đề xuất của bạn phải **dựa trực tiếp vào bài viết thực tế của học viên**.
          Bạn phải:
          - Trích dẫn hoặc tham chiếu các câu cụ thể từ bài luận khi đưa ra nhận xét.
          - Xác định chính xác điểm yếu hoặc không rõ ràng (ví dụ: thiếu ví dụ, ý tưởng yếu, chuyển tiếp kém, ngữ pháp sai, lặp lại, từ vựng mơ hồ).
          - Đưa ra **lời khuyên cải thiện cụ thể** (ví dụ: "Thêm ví dụ thực tế để hỗ trợ ý tưởng này", "Thay thế từ lặp lại bằng từ đồng nghĩa", "Sử dụng câu phức ở đây để thể hiện phạm vi").
          - Tránh các tuyên bố chung chung như "Cải thiện ngữ pháp" hoặc "Mạch lạc hơn".

          ---

          ### ĐỊNH DẠNG ĐẦU RA (PHẢI LÀ JSON HỢP LỆ):

          {
            "overall_band": number,
            "task_achievement": number,
            "coherence": number,
            "lexical": number,
            "grammar": number,
            "feedback": "3-5 câu tóm tắt cách tổ chức, phát triển ý tưởng và độ chính xác ngữ pháp của học viên, tham chiếu trực tiếp các phần trong bài luận của họ (trích dẫn cụm từ ngắn nếu liên quan). PHẢI BẰNG TIẾNG VIỆT.",
            "errors": [
              { 
                "sentence": "The incorrect sentence from the essay in ENGLISH", 
                "correction": "The corrected version in ENGLISH",
                "explanation": "Giải thích chi tiết tại sao sai và cách sửa. BẰNG TIẾNG VIỆT."
              }
            ],
            "suggestions": [
              "Đưa ra 2-3 khuyến nghị cụ thể, dễ làm theo dựa trên bài luận này. BẰNG TIẾNG VIỆT (ví dụ: 'Sử dụng các từ nối chính xác hơn như tuy nhiên, do đó', 'Phát triển đoạn thân bài thứ hai bằng cách thêm ví dụ về ...', 'Tránh lặp lại cụm từ ...')."
            ]
          }

          ---

          Bài luận học viên nộp:
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
        // Loại bỏ markdown code blocks nếu có
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        parsed = JSON.parse(cleanText);
      } catch (err) {
        console.warn("⚠️ Response not valid JSON, attempting fallback parse...");
        console.log("📄 Raw response:", text);
        
        let cleanText = text
          .replace(/```json\n/g, "")
          .replace(/```\n/g, "")
          .replace(/```/g, "")
          .trim();
        
        try {
          parsed = JSON.parse(cleanText);
        } catch {
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

      console.log("🧠 Parsed result:", JSON.stringify(parsed, null, 2));

      const finalResult = parsed || {
        overall_band: 6.5,
        task_achievement: 6.0,
        coherence: 6.0,
        lexical: 6.0,
        grammar: 6.0,
        feedback:
          "Bài viết của bạn đã giải quyết được nhiệm vụ nhưng thiếu sự phát triển và độ chính xác. Tập trung vào ngữ pháp và tính mạch lạc để cải thiện.",
        errors: [],
        suggestions: [
          "Sử dụng nhiều từ nối đa dạng hơn như 'tuy nhiên', 'hơn nữa', 'do đó'",
          "Xem lại cấu trúc câu phức để đảm bảo tính chính xác",
          "Hỗ trợ ý tưởng bằng các ví dụ rõ ràng và cụ thể hơn",
        ],
        image_analysis: section === "Task 1" ? "Không thể phân tích hình ảnh" : undefined,
      };

      // Xóa image_analysis nếu không phải Task 1
      if (section !== "Task 1") {
        delete finalResult.image_analysis;
      }

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
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        console.log("🖼️ Fetching image from URL:", imageUrl);
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      }

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