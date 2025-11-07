export class SuggestedRoadmap {
  constructor({ roadmap_id, user_id, goal_id, recommendation_summary }) {
    this.roadmap_id = roadmap_id || null;
    this.user_id = user_id;
    this.goal_id = goal_id;
    this.recommendation_summary = recommendation_summary;
    this.generated_at = new Date();
  }
}