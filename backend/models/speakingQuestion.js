export class SpeakingQuestion {
  constructor({
    speaking_questions_id = null,
    speaking_id,
    question_text,
    question_order = 1,
    created_at = new Date(),
    updated_at = new Date(),
  }) {
    this.speaking_questions_id = speaking_questions_id;
    this.speaking_id = speaking_id;
    this.question_text = question_text;
    this.question_order = question_order;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
