import { db } from "../config/firebase.js";

export const RoadmapService = {
  async saveRoadmap(userId, goalId, roadmapData) {
    const { summary, steps } = roadmapData;

    

    console.log("💾 Saving roadmap for user:", userId, "goal:", goalId);

    // Nếu goalId trống thì gán tạm
    const validGoalId = goalId || "unknown";

    // 🔹 Lưu roadmap chính
    const roadmapRef = await db.collection("suggested_roadmaps").add({
      user_id: userId,
      goal_id: validGoalId,
      recommendation_summary: summary || "No summary provided",
      generated_at: new Date(),
    });

    // 🔹 Lưu từng step (tối đa 4 step, mô tả ngắn 30 chữ)
    if (Array.isArray(steps)) {
      for (const s of steps.slice(0, 4)) {
        const shortDesc =
          (s.description || "")
            .split(" ")
            .slice(0, 30)
            .join(" ")
            .trim() + (s.description?.split(" ").length > 30 ? "..." : "");

        await db.collection("roadmap_steps").add({
          roadmap_id: roadmapRef.id,
          step_order: s.step_order,
          title: s.title,
          description: shortDesc,
          estimated_duration_days: s.estimated_duration_days || 7,
          status: "Pending",
        });
      }
    }

    console.log("✅ Roadmap saved with ID:", roadmapRef.id);

    return {
      roadmap_id: roadmapRef.id,
      goal_id: validGoalId,
      summary,
      steps: steps ? steps.slice(0, 4) : [],
    };
  },

  async getRoadmapByUser(userId) {
    console.log("📥 Fetching roadmap for user:", userId);

    // ⚠️ Bỏ orderBy để tránh lỗi "requires an index"
    const snap = await db
      .collection("suggested_roadmaps")
      .where("user_id", "==", userId)
      .get();

    if (snap.empty) return null;

    // 🔹 Lấy roadmap gần nhất theo generated_at (tự xử lý ở code JS)
    const docs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.generated_at.toDate() - a.generated_at.toDate());

    const roadmap = docs[0];

    // 🔹 Lấy các bước theo step_order
    const stepsSnap = await db
      .collection("roadmap_steps")
      .where("roadmap_id", "==", roadmap.id)
      .get();

    const steps = stepsSnap.docs
      .map((d) => d.data())
      .sort((a, b) => a.step_order - b.step_order);

    return {
      id: roadmap.id,
      goal_id: roadmap.goal_id,
      summary: roadmap.recommendation_summary,
      steps,
    };
  },
};
