import { db } from "../config/firebase.js";

export const fetchUserResults = async (userId) => {
  const resultsData = [];

  const skillCollections = {
    writing: "writing_submissions",
    speaking: "speaking_submissions",
    reading: "reading_submissions",
    listening: "listening_submissions",
  };

  for (const [skill, collectionName] of Object.entries(skillCollections)) {
    const submissionsSnapshot = await db
      .collection(collectionName)
      .where("user_id", "==", userId)
      .get();

    for (const docSnap of submissionsSnapshot.docs) {
      const data = docSnap.data();

      let section = "Unknown Section";
      let title = "Untitled";

      if (skill === "speaking" && data.speaking_id) {
        try {
          const practiceSnap = await db
            .collection("speaking_practices")
            .doc(data.speaking_id)
            .get();
          if (practiceSnap.exists) {
            const practiceData = practiceSnap.data();
            section = practiceData.section || "Unknown Section";
            title = practiceData.topic || "Untitled";
          }
        } catch (err) {
          console.error("Error fetching speaking practice:", err);
        }
      } else if (data.practice_id) {
        try {
          const practiceSnap = await db
            .collection(`${skill}_practices`)
            .doc(data.practice_id)
            .get();
          if (practiceSnap.exists) {
            const practiceData = practiceSnap.data();
            section = practiceData.section || "Unknown Section";
            title = practiceData.title || "Untitled";
          }
        } catch (err) {
          console.error(`Error fetching ${skill} practice:`, err);
        }
      }

      let score = 0;
      if (skill === "writing") score = data.ai_feedback?.overall_band || 0;
      else if (skill === "speaking") score = data.ai_score || 0;
      else score = data.overband || 0;

      const resultItem = {
        id: docSnap.id,
        skill,
        section,
        title,
        score,
        status: data.status || "unknown",
        createdAt: data.submitted_at
          ? data.submitted_at.toDate
            ? data.submitted_at.toDate()
            : new Date(data.submitted_at)
          : new Date(),
        feedback:
          skill === "writing"
            ? data.ai_feedback?.feedback || null
            : data.feedback || data.aiFeedback?.feedback || null,
        detailedFeedback:
          skill === "writing"
            ? data.ai_feedback?.detailed_feedback || {}
            : data.aiFeedback?.detailed_feedback || {},
        userAnswers: data.user_answer ? JSON.parse(data.user_answer) : {},
        durationSeconds: data.duration_seconds || 0,
      };

      if (skill === "writing" && data.ai_feedback) {
        resultItem.coherence = data.ai_feedback.coherence || 0;
        resultItem.grammar = data.ai_feedback.grammar || 0;
        resultItem.lexical = data.ai_feedback.lexical || 0;
        resultItem.taskAchievement = data.ai_feedback.task_achievement || 0;
        resultItem.suggestions = data.ai_feedback.suggestions || [];
        resultItem.essayText = data.essay_text || "";
      }

      if (skill === "speaking") {
        resultItem.fluencyScore = data.fluency_score || 0;
        resultItem.grammarScore = data.grammar_score || 0;
        resultItem.pronunciationScore = data.pronunciation_score || 0;
        resultItem.vocabScore = data.vocab_score || 0;
      }

      resultsData.push(resultItem);
    }
  }

  // --- calculate summary ielts score with submission include session Test ---
  const skills = ["writing", "speaking", "reading", "listening"];
  const summary = {};

  for (const skill of skills) {
    const skillTasks = resultsData.filter(
      (r) => r.skill === skill && r.section.toLowerCase().includes("test")
    );

    const totalScore = skillTasks.reduce((sum, t) => sum + (t.score || 0), 0);
    const averageScore =
      skillTasks.length > 0 ? totalScore / skillTasks.length : 0;

    summary[skill] = parseFloat(averageScore.toFixed(1));
  }

  // overallBand based on skill have score
  const availableScores = Object.values(summary).filter((val) => val > 0);
  const overallBand =
    availableScores.length > 0
      ? parseFloat(
          (availableScores.reduce((a, b) => a + b, 0) / availableScores.length).toFixed(1)
        )
      : 0;

  return {
    submissions: resultsData,
    summary: {
      ...summary,
      overallBand,
    },
  };
};


// delete submission
export const deleteSubmissionById = async (skill, submissionId, userId) => {
  if (!skill || !submissionId || !userId) {
    throw new Error("Missing required parameters");
  }

  const collectionMap = {
    writing: "writing_submissions",
    speaking: "speaking_submissions",
    reading: "reading_submissions",
    listening: "listening_submissions",
  };

  const collectionName = collectionMap[skill];
  if (!collectionName) throw new Error("Invalid skill");

  try {
    const docRef = db.collection(collectionName).doc(submissionId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error("Submission not found");
    }

    const data = docSnap.data();
    if (data.user_id !== userId) {
      throw new Error("Unauthorized: submission does not belong to this user");
    }

    await docRef.delete();

    return { message: `Submission ${submissionId} deleted successfully` };
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw new Error(error.message || "Failed to delete submission");
  }
};
