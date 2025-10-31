export class ReadingPractice {
  static collectionName = "reading_practices";

  constructor({
    section,
    title,
    type,
    image_url = null,
    content = "",
    content_text = "",
    correct_answer = "",
    time_limit = "",
    created_at = new Date(),
    updated_at = new Date(),
    is_active = true,
  }) {
    this.section = section;
    this.title = title;
    this.type = type;
    this.image_url = image_url;
    this.content = content;
    this.content_text = content_text;
    this.correct_answer = correct_answer;
    this.time_limit = time_limit;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.is_active = is_active;
  }
}
