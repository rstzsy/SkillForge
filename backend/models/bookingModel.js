export class Booking {
  constructor({
    student_id,
    teacher_id,
    name,
    email,
    date,
    time,
    status = "Scheduled",
    meeting_link = "",
    recording_url = "",
    bookedAt = new Date().toISOString(),
  }) {
    this.student_id = student_id;
    this.teacher_id = teacher_id;
    this.name = name;
    this.email = email;
    this.date = date;
    this.time = time;
    this.status = status;
    this.meeting_link = meeting_link;
    this.recording_url = recording_url;
    this.bookedAt = bookedAt;
  }
}
