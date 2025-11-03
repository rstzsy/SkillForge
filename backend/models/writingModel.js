export class WritingPractice {
  static collectionName = "writing_practices";
  constructor({
    writing_practices_id = null,
    section,
    title,
    type,
    question_text,
    image_url = null,
    time_limit = 40,
    attempts = 0,
    status = "Not Started",
    created_at = new Date(),
    updated_at = new Date(),
  }) {
    this.writing_practices_id = writing_practices_id;
    this.section = section;
    this.title = title;
    this.type = type;
    this.question_text = question_text;
    this.image_url = image_url;
    this.time_limit = time_limit;
    this.attempts = attempts;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
