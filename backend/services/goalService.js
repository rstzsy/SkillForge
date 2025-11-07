import { db } from "../config/firebase.js";
import { LearningGoal } from "../models/goalModel.js";

export const GoalService = {
  async saveGoal(goalData) {
    try {
      const goal = new LearningGoal(goalData);
      const docRef = await db.collection("learning_goals").add({
        user_id: goal.user_id,
        name: goal.name,
        email: goal.email,
        current_band: goal.current_band || null,
        target_band: goal.target_band,
        target_date: goal.target_date,
        priority_skills: goal.priority_skills,
        notes: goal.notes,
        saved_at: goal.saved_at,
      });

      await docRef.update({ goal_id: docRef.id });
      return { goal_id: docRef.id, ...goalData };
    } catch (error) {
      console.error("🔥 Error saving goal to Firestore:", error);
      throw new Error("Failed to save goal");
    }
  },

  async getGoalsByUser(userId) {
    try {
      const snapshot = await db
        .collection("learning_goals")
        .where("user_id", "==", userId)
        .get();

      if (snapshot.empty) return [];

      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() : {};

      return snapshot.docs.map((doc) => {
        const goal = doc.data();
        return {
          id: doc.id,
          name: userData.userName || "Unknown",
          email: userData.email || "Unknown",
          current_band: goal.current_band || "-",
          target_band: goal.target_band,
          target_date: goal.target_date,
          priority_skills: goal.priority_skills,
          notes: goal.notes,
          saved_at: goal.saved_at,
        };
      });
    } catch (error) {
      console.error("Error fetching goals:", error);
      throw new Error("Failed to fetch goals");
    }
  },


  async deleteGoal(goalId) {
    try {
      await db.collection("learning_goals").doc(goalId).delete();
      return { message: `Goal ${goalId} deleted successfully` };
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw new Error("Failed to delete goal");
    }
  },
};
