export class Class {
  constructor({ classId, name, subject, teacherId, schedule, driveLink, zoomLink, students, isActive = true, createdAt, updatedAt }) {
    this.classId = classId;
    this.name = name;
    this.subject = subject;
    this.teacherId = teacherId; 
    this.schedule = schedule;
    this.driveLink = driveLink;
    this.zoomLink = zoomLink;
    this.students = students; 
    this.isActive = isActive;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}
