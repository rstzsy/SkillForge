import { db } from "../config/firebase.js";

export const getLearningPathForUser = async (userId) => {
  if (!userId) throw new Error("Missing userId");

  const allTasks = [];

  // 1. Listening & Reading
  const simpleCollections = [
    { name: "listening_submissions", scoreField: "overband", skill: "Listening" },
    { name: "reading_submissions", scoreField: "overband", skill: "Reading" },
  ];

  for (const coll of simpleCollections) {
    const snapshot = await db
      .collection(coll.name)
      .where("user_id", "==", userId)
      .get();

    for (const doc of snapshot.docs) {
      const submission = doc.data();

      const practiceId = submission.practice_id || submission.practiceId;
      if (!practiceId) continue;

      const practiceType = coll.name.split("_")[0] + "_practices";
      const practiceDoc = await db.collection(practiceType).doc(practiceId).get();
      const practiceTitle = practiceDoc.exists ? practiceDoc.data().title : "Unknown Practice";

      let submittedDate = null;
      if (submission.submitted_at) {
        submittedDate = submission.submitted_at.toDate ? submission.submitted_at.toDate() : new Date(submission.submitted_at);
      } else if (submission.created_at) {
        submittedDate = submission.created_at.toDate ? submission.created_at.toDate() : new Date(submission.created_at);
      }
      if (!submittedDate) continue;

      allTasks.push({
        title: practiceTitle,
        progress: submission[coll.scoreField] || 0,
        submitted_at: submittedDate,
        skill: coll.skill,
      });
    }
  }

  // 2. Speaking submissions (lay topic)
  const speakingSnap = await db
    .collection("speaking_submissions")
    .where("user_id", "==", userId)
    .get();

  for (const doc of speakingSnap.docs) {
    const submission = doc.data();

    const speakingId = submission.speaking_id;
    if (!speakingId) continue;

    const practiceDoc = await db.collection("speaking_practices").doc(speakingId).get();
    const practiceTopic = practiceDoc.exists ? practiceDoc.data().topic : "Unknown Topic";

    let submittedDate = null;
    if (submission.submitted_at) {
      submittedDate = submission.submitted_at.toDate ? submission.submitted_at.toDate() : new Date(submission.submitted_at);
    } else if (submission.created_at) {
      submittedDate = submission.created_at.toDate ? submission.created_at.toDate() : new Date(submission.created_at);
    }
    if (!submittedDate) continue;

    allTasks.push({
      title: practiceTopic, 
      progress: submission.ai_score || 0,
      submitted_at: submittedDate,
      skill: "Speaking",
    });
  }

  // 3. Writing submissions
  const writingSnap = await db
    .collection("writing_submissions")
    .where("user_id", "==", userId)
    .get();

  for (const doc of writingSnap.docs) {
    const submission = doc.data();

    const practiceId = submission.practice_id || submission.practiceId;
    if (!practiceId) continue;

    const practiceDoc = await db.collection("writing_practices").doc(practiceId).get();
    const practiceTitle = practiceDoc.exists ? practiceDoc.data().title : "Unknown Practice";

    let submittedDate = null;
    if (submission.created_at) {
      submittedDate = submission.created_at.toDate ? submission.created_at.toDate() : new Date(submission.created_at);
    }
    if (!submittedDate) continue;

    const overallBand = submission.ai_feedback?.overall_band || 0;

    allTasks.push({
      title: practiceTitle,
      progress: overallBand,
      submitted_at: submittedDate,
      skill: "Writing",
    });
  }

  // nhom data theo ngay
  const tasksByDay = {};
  allTasks.forEach((task) => {
    const dayStr = task.submitted_at.toLocaleDateString("en-GB"); // dd/mm/yyyy
    if (!tasksByDay[dayStr]) tasksByDay[dayStr] = [];
    tasksByDay[dayStr].push({
      title: task.title,
      progress: task.progress,
      skill: task.skill,
    });
  });

  const learningDays = Object.keys(tasksByDay)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((day, index) => ({
      day: `Day ${index + 1} (${day})`,
      tasks: tasksByDay[day],
    }));

  return { learningPath: learningDays };
};
