import { db } from "../config/firebase.js";
import { LearningGoal } from "../models/goalModel.js";

export const GoalService = {
  async saveGoal(goalData) {
    try {
      const goal = new LearningGoal(goalData);
      const docRef = await db.collection("learning_goals").add({
        user_id: goal.user_id,
        target_band: goal.target_band,
        target_date: goal.target_date,
        priority_skills: goal.priority_skills,
        notes: goal.notes,
        saved_at: goal.saved_at,
      });

      // Cập nhật lại goal_id trong Firestore
      await docRef.update({ goal_id: docRef.id });

      return { id: docRef.id, ...goal };
    } catch (error) {
      console.error("Error saving goal to Firestore:", error);
      throw new Error("Failed to save goal");
    }
  },

  async getGoalsByUser(userId) {
    try {
      const snapshot = await db.collection("learning_goals")
        .where("user_id", "==", userId)
        .get();

      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching goals:", error);
      throw new Error("Failed to fetch goals");
    }
  }
};
