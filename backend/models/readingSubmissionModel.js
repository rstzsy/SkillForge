export class ReadingSubmission {
  static collectionName = "reading_submissions";

  constructor({
    userId,                
    practiceId,             
    userAnswers = {},       
    score = 0,              
    timeSpent = 0,         
    attemptNumber = 1,      
    submittedAt = new Date(), 
    updatedAt = new Date(),   
  }) {
    this.userId = userId;
    this.practiceId = practiceId;
    this.userAnswers = userAnswers;
    this.score = score;
    this.timeSpent = timeSpent;
    this.attemptNumber = attemptNumber;
    this.submittedAt = submittedAt;
    this.updatedAt = updatedAt;
  }
}
