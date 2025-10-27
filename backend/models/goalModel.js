export class LearningGoal {
  constructor({
    goal_id = null,
    user_id = null,
    name,
    email,
    target_band,
    target_date,
    priority_skills = "",
    notes = "",
    saved_at = new Date().toISOString(),
  }) {
    this.goal_id = goal_id;
    this.user_id = user_id;
    this.name = name;
    this.email = email;
    this.target_band = target_band;
    this.target_date = target_date;
    this.priority_skills = priority_skills;
    this.notes = notes;
    this.saved_at = saved_at;
  }
}
