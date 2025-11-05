import { db } from "../config/firebase.js"; // Admin SDK

export const getPlacementTests = async () => {
  const collections = [
    { name: "listening_practices", skill: "Listening" },
    { name: "reading_practices", skill: "Reading" },
    { name: "writing_practices", skill: "Writing" },
    { name: "speaking_practices", skill: "Speaking" },
  ];

  const results = [];

  for (const col of collections) {
    const snapshot = await db.collection(col.name).get();
    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (!data.section?.includes("Test")) continue;

      const title = data.title || data.topic || "Untitled";

      // attempts for listening and reading
      let attemptCount = data.attempts || 0;
      if (
        col.name === "listening_practices" ||
        col.name === "reading_practices"
      ) {
        const submissionsSnap = await db
          .collection(`${col.name.replace("_practices", "_submissions")}`)
          .where("practice_id", "==", doc.id)
          .get();
        attemptCount = submissionsSnap.size || 0;
      }

      results.push({
        id: doc.id,
        title: title,
        type: data.type,
        attempts: attemptCount,
        img: data.image_url || "/assets/listpic.jpg",
        completed: false,
        timeLimit: data.time_limit || 0,
        skill: col.skill,
        section: `Test ${col.skill}`,
        is_active: data.is_active ?? true,
      });
    }
  }

  return results;
};

export const getUserPlacementTests = async (userId) => {
  if (!userId) throw new Error("Missing userId");

  const allTests = await getPlacementTests();

  // get all submission in reading by user
  const readingTests = allTests.filter(t => t.skill.toLowerCase() === "reading");
  const readingSnap = await db
    .collection("reading_submissions")
    .where("user_id", "==", userId)
    .get();
  const userReadings = readingSnap.docs.map(d => ({ id: d.data().practice_id, submitted_at: d.data().submitted_at?.toDate?.() || null }));

  const results = await Promise.all(
    allTests.map(async (test) => {
      // Reading riêng
      if (test.skill.toLowerCase() === "reading") {
        const sub = userReadings.find(s => s.id === test.id);
        return {
          ...test,
          completed: !!sub,
          lastSubmittedAt: sub?.submitted_at || null,
          attempts: sub ? 1 : 0, // moi bai da submit la complete
        };
      }

      // get submission in lis, speak, write
      const colName = `${test.skill.toLowerCase()}_submissions`;
      const snap = await db
        .collection(colName)
        .where("practice_id", "==", test.id)
        .where("user_id", "==", userId)
        .get();

      const attempts = snap.size || 0;

      let completed = false;
      let lastSubmittedAt = null;

      snap.docs.forEach((doc) => {
        const data = doc.data();
        const status = data.status;

        if (
          (["listening"].includes(test.skill.toLowerCase()) &&
            status?.toLowerCase() === "submitted") ||
          (["writing", "speaking"].includes(test.skill.toLowerCase()) &&
            status === "Completed")
        ) {
          completed = true;
          const subDate = data.submitted_at?.toDate?.();
          if (!lastSubmittedAt || (subDate && subDate > lastSubmittedAt)) {
            lastSubmittedAt = subDate;
          }
        }
      });

      return {
        ...test,
        completed,
        attempts,
        lastSubmittedAt,
      };
    })
  );

  return results;
};


