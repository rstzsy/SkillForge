import fs from "fs";
import FormData from "form-data";
import axios from "axios";

export async function transcribeAudio(filePath, expectedText = "") {
  try {
    // Kiểm tra file tồn tại
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    // Đọc file audio
    const audioBuffer = fs.readFileSync(filePath);
    
    // Tạo FormData
    const formData = new FormData();
    formData.append("file", audioBuffer, {
      filename: "audio.webm",
      contentType: "audio/webm"
    });
    formData.append("model", "whisper-large-v3");
    formData.append("language", "en");
    formData.append("response_format", "json");

    // Gọi Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        maxBodyLength: Infinity,
        timeout: 30000
      }
    );

    const transcript = response.data.text.trim();
    
    if (!transcript) {
      throw new Error("No speech detected in the audio.");
    }

    console.log("✅ Transcript:", transcript);

    // Phần chấm điểm mô phỏng
    const wordCount = transcript.split(/\s+/).length;
    const hasGoodLength = wordCount >= 5;
    
    const analysis = {
      transcript: transcript,
      pronunciation_score: hasGoodLength ? 7.5 : 6.0,
      fluency_score: hasGoodLength ? 7.0 : 6.0,
      grammar_score: 6.5,
      vocab_score: 7.0,
      ai_score: 7.0,
      feedback: hasGoodLength 
        ? "Your pronunciation and fluency are acceptable. Improve your grammar in complex sentences."
        : "Try to speak more. Your answer is too short."
    };

    return analysis;

  } catch (error) {
    console.error("❌ Transcription error:", error.message);
    
    // Trả về error nhưng vẫn có structure
    return {
      error: error.message,
      transcript: "Error transcribing audio",
      pronunciation_score: 0,
      fluency_score: 0,
      grammar_score: 0,
      vocab_score: 0,
      ai_score: 0,
      feedback: `Transcription failed: ${error.message}`
    };
  }
}