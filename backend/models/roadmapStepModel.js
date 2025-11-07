export class RoadmapStep {
  constructor({ roadmap_id, step_order, title, description, estimated_duration_days }) {
    this.step_id = null;
    this.roadmap_id = roadmap_id;
    this.step_order = step_order;
    this.title = title;
    this.description = description;
    this.estimated_duration_days = estimated_duration_days;
    this.status = "Pending";
  }
}