import { aiRoadmapGeminiService } from "../ai/aiRoadmapGeminiService.js";
import { RoadmapService } from "../services/roadmapService.js";

export const RoadmapController = {
  async generate(req, res) {
    try {
      // ✅ Lấy dữ liệu chính xác từ body
      const { user_id, goal_id, name, current_band, target_band, target_date, priority_skills } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: "Missing user_id in request body" });
      }

      console.log("📩 Generating roadmap for user:", user_id);

      // ✅ Gọi AI để tạo roadmap
      const roadmapData = await aiRoadmapGeminiService.generateRoadmap({
        userName: name,
        currentBand: current_band,
        targetBand: target_band,
        targetDate: target_date,
        prioritySkills: typeof priority_skills === "string" 
          ? priority_skills.split(",") 
          : priority_skills || [],
      });

      // ✅ Lưu roadmap vào Firestore
      const saved = await RoadmapService.saveRoadmap(
        user_id,
        goal_id || "unknown",
        roadmapData
      );

      res.json(saved);
    } catch (err) {
      console.error("🔥 Error generating roadmap:", err);
      res.status(500).json({ error: "Failed to generate roadmap" });
    }
  },

  async getUserRoadmap(req, res) {
    try {
      const { userId } = req.params;
      console.log("📥 Fetching roadmap for user:", userId);

      const roadmap = await RoadmapService.getRoadmapByUser(userId);
      res.json(roadmap);
    } catch (err) {
      console.error("🔥 Error fetching roadmap:", err);
      res.status(500).json({ error: "Failed to fetch roadmap" });
    }
  },
};
