import { aiWritingGeminiService } from "../ai/aiWritingGeminiService.js";

export const evaluateEssay = async (req, res) => {
  try {
    const { userId, practiceId, essayText } = req.body;
    console.log("🧩 Received:", { userId, practiceId, essayTextLength: essayText?.length });

    if (!essayText || !userId || !practiceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await aiWritingGeminiService.evaluateEssay({
      userId,
      practiceId,
      essayText,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ AI evaluate error:", error);
    res.status(500).json({ message: "Failed to evaluate essay", error: error.message });
  }
};

