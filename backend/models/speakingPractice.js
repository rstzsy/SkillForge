export class SpeakingPractice {
  constructor({
    speaking_practices_id = null,
    section,
    topic,
    type,
    time_limit = 2,
    attempts = 0,
    is_active = true,
    created_at = new Date(),
    updated_at = new Date(),
  }) {
    this.speaking_practices_id = speaking_practices_id;
    this.section = section;
    this.topic = topic;
    this.type = type;
    this.time_limit = time_limit;
    this.attempts = attempts;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
