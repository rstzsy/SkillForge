export class ListeningSubmission {
  static collectionName = "listening_submissions";

  constructor({ userId, practiceId, userAnswer, correctAnswer, score = 0, durationSeconds = 0, feedback = "", status = "submitted", submittedAt = new Date() }) {
    this.userId = userId;
    this.practiceId = practiceId;
    this.userAnswer = userAnswer;         
    this.correctAnswer = correctAnswer;
    this.score = score;
    this.durationSeconds = durationSeconds;
    this.feedback = feedback;
    this.status = status;                 
    this.submittedAt = submittedAt;
  }
}
