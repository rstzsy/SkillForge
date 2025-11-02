import { db } from "../config/firebase.js";
import fs from "fs";
import path from "path";
import { SpeakingService } from "../services/speakingService.js";
import { aiSpeakingGeminiService } from "../ai/aiSpeakingGeminiService.js";
import { transcribeAudio } from "../services/whisperService.js";

export const SpeakingController = {
  // ✅ Lấy toàn bộ speaking từ Firestore
  async getAllSpeaking(req, res) {
    try {
      const snapshot = await db.collection("speaking_practices").get();
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const questionsSnap = await db
            .collection("speaking_practices")
            .doc(doc.id)
            .collection("questions")
            .get();

          return {
            speaking_practices_id: doc.id,
            ...doc.data(),
            questions: questionsSnap.docs.map((q) => ({
              id: q.id,
              ...q.data(),
            })),
          };
        })
      );

      res.json(data);
    } catch (error) {
      console.error("🔥 Error fetching speaking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch speaking practices",
        error: error.message,
      });
    }
  },

  // ✅ Lấy một speaking topic cụ thể
  async getSpeakingById(req, res) {
    try {
      const { id } = req.params;
      const docRef = await db.collection("speaking_practices").doc(id).get();
      
      if (!docRef.exists) {
        return res.status(404).json({ message: "Speaking topic not found" });
      }

      const questionsSnap = await docRef.ref.collection("questions").orderBy("question_order").get();
      
      res.json({
        speaking_practices_id: docRef.id,
        ...docRef.data(),
        questions: questionsSnap.docs.map((q) => ({
          id: q.id,
          ...q.data(),
        })),
      });
    } catch (error) {
      console.error("🔥 Error fetching speaking:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ✅ Xóa một speaking + các câu hỏi con
  async deleteSpeaking(req, res) {
    try {
      const { id } = req.params;
      const ref = db.collection("speaking_practices").doc(id);

      const questionsSnap = await ref.collection("questions").get();
      const batch = db.batch();
      questionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      await ref.delete();

      res.json({ success: true, message: "Speaking topic deleted successfully" });
    } catch (error) {
      console.error("🔥 Error deleting speaking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete speaking topic",
        error: error.message,
      });
    }
  },

  // ✅ Thêm speaking thủ công
  async createSpeaking(req, res) {
    try {
      const { section, topic, type, time_limit = 2, questions = [] } = req.body;

      const practiceRef = db.collection("speaking_practices").doc();
      const speakingData = {
        speaking_practices_id: practiceRef.id,
        section,
        topic,
        type,
        time_limit,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await practiceRef.set(speakingData);

      for (let i = 0; i < questions.length; i++) {
        const q = {
          question_text: questions[i],
          question_order: i + 1,
          created_at: new Date(),
          updated_at: new Date(),
        };
        await practiceRef.collection("questions").add(q);
      }

      res.json({
        success: true,
        message: "Speaking topic created successfully",
        speaking_practices_id: practiceRef.id,
      });
    } catch (error) {
      console.error("🔥 Error creating speaking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create speaking topic",
        error: error.message,
      });
    }
  },

  // ✅ Cập nhật speaking
  async updateSpeaking(req, res) {
    try {
      const { id } = req.params;
      const { section, topic, type, time_limit, questions = [] } = req.body;

      const ref = db.collection("speaking_practices").doc(id);

      const docSnap = await ref.get();
      if (!docSnap.exists)
        return res.status(404).json({ message: "Speaking topic not found" });

      await ref.update({
        section,
        topic,
        type,
        time_limit,
        updated_at: new Date(),
      });

      const questionsSnap = await ref.collection("questions").get();
      const batch = db.batch();
      questionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      for (let i = 0; i < questions.length; i++) {
        const q = {
          question_text: questions[i],
          question_order: i + 1,
          created_at: new Date(),
          updated_at: new Date(),
        };
        await ref.collection("questions").add(q);
      }

      res.json({
        success: true,
        message: "Speaking topic updated successfully",
      });
    } catch (error) {
      console.error("🔥 Error updating speaking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update speaking topic",
        error: error.message,
      });
    }
  },

  // ✅ Submit audio và nhận điểm AI cho một câu hỏi
  async submitSpeakingAnswer(req, res) {
    console.log("🎤 Received audio submission request");
    
    try {
      const { userId, speakingId, questionId, questionText, section } = req.body;
      
      console.log("📋 Request body:", { userId, speakingId, questionId, questionText, section });
      
      if (!req.file) {
        console.error("❌ No file in request");
        return res.status(400).json({ 
          success: false,
          message: "No audio file uploaded" 
        });
      }

      const audioPath = path.resolve(req.file.path);
      console.log("📁 Audio file received:", audioPath);
      console.log("📦 File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        exists: fs.existsSync(audioPath)
      });

      // ✅ Kiểm tra file có tồn tại không
      if (!fs.existsSync(audioPath)) {
        console.error("❌ Audio file does not exist at path:", audioPath);
        return res.status(400).json({
          success: false,
          message: "Audio file not found on server"
        });
      }

      // 1️⃣ Transcribe audio bằng Whisper
      let transcript = "";
      let transcriptError = null;
      
      try {
        console.log("🎯 Starting Whisper transcription...");
        console.log("🎯 Audio path being sent to Whisper:", audioPath);
        
        const transcriptResult = await transcribeAudio(audioPath, "");
        
        console.log("📝 Whisper result:", transcriptResult);
        
        if (transcriptResult && transcriptResult.transcript) {
          transcript = transcriptResult.transcript.trim();
          console.log("✅ Transcript successful:", transcript);
        } else {
          throw new Error("Whisper returned empty transcript");
        }
        
      } catch (error) {
        transcriptError = error;
        console.error("❌ Whisper transcription failed:");
        console.error("  - Error message:", error.message);
        console.error("  - Error stack:", error.stack);
        
        // ❌ KHÔNG dùng fallback nữa - throw error để user biết
        return res.status(500).json({
          success: false,
          message: "Failed to transcribe audio. Please check your audio file and try again.",
          error: error.message,
          details: {
            audioPath,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
          }
        });
      }

      // ✅ Kiểm tra transcript có hợp lệ không
      if (!transcript || transcript.length < 5) {
        console.error("❌ Transcript too short or empty:", transcript);
        return res.status(400).json({
          success: false,
          message: "Could not detect speech in audio. Please speak clearly and try again.",
          transcript: transcript
        });
      }

      // 2️⃣ Audio URL để lưu vào database
      const audioUrl = `/uploads/audio/${req.file.filename}`;
      console.log("🔗 Audio URL:", audioUrl);

      // 3️⃣ Gửi transcript cho AI Gemini để chấm điểm
      try {
        console.log("🤖 Calling AI evaluation service...");
        const aiResult = await aiSpeakingGeminiService.evaluateSpeakingAnswer({
          userId,
          speakingId,
          questionId,
          questionText,
          transcript,
          audioUrl,
          section: section || "Part 1"
        });

        console.log("✅ AI evaluation completed:", aiResult.submission_id);

        res.json({
          success: true,
          message: "Speaking answer evaluated successfully",
          transcript,
          evaluation: aiResult,
        });
      } catch (aiError) {
        console.error("❌ AI evaluation failed:", aiError.message);
        console.error("❌ AI error stack:", aiError.stack);
        throw aiError;
      }
      
    } catch (error) {
      console.error("🔥 Error submitting speaking answer:", error);
      console.error("🔥 Error stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Failed to evaluate speaking answer",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // ✅ Tính điểm tổng khi hoàn thành tất cả câu hỏi
  async finalizeSpeaking(req, res) {
    try {
      const { userId, speakingId } = req.body;

      if (!userId || !speakingId) {
        return res.status(400).json({ message: "Missing userId or speakingId" });
      }

      const result = await aiSpeakingGeminiService.calculateOverallScore({
        userId,
        speakingId,
      });

      res.json({
        success: true,
        message: "Speaking practice completed and scored",
        overall_score: result,
      });
    } catch (error) {
      console.error("🔥 Error finalizing speaking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to finalize speaking score",
        error: error.message,
      });
    }
  },

  // ✅ Lấy lịch sử làm bài của user cho một topic
  async getUserSubmissions(req, res) {
    try {
      const { userId, speakingId } = req.params;

      const snapshot = await db
        .collection("speaking_question_submissions")
        .where("user_id", "==", userId)
        .where("speaking_id", "==", speakingId)
        .get();

      const submissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ success: true, submissions });
    } catch (error) {
      console.error("🔥 Error fetching user submissions:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

// ✅ Import Excel từ file
export const importSpeakingExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "❌ No file uploaded" });
    }

    const filePath = req.file.path;
    const result = await SpeakingService.importExcel(filePath);

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("🔥 Error in importSpeakingExcel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import Speaking Excel",
      error: error.message,
    });
  }
};