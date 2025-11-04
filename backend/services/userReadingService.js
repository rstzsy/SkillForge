import { db } from "../config/firebase.js";
import { ReadingPractice } from "../models/readingModel.js";

export const getUserReadingList = async () => {
  const snapshot = await db.collection(ReadingPractice.collectionName).get();

  // get all data
  const practices = snapshot.docs.map((doc) => ({
    id: doc.id,
    section: doc.data().section,
    title: doc.data().title,
    type: doc.data().type,
    image_url: doc.data().image_url || null,
    content: doc.data().content || "",
    content_text: doc.data().content_text || "",
    correct_answer: doc.data().correct_answer || "",
    time_limit: doc.data().time_limit || 0,
    is_active: doc.data().is_active ?? true,
    created_at: doc.data().created_at || null,
    updated_at: doc.data().updated_at || null,
    attempts: 0,
  }));

  // count submission -> attempt
  const updatedPractices = await Promise.all(
    practices.map(async (practice) => {
      const submissionsSnap = await db
        .collection("reading_submissions") 
        .where("practice_id", "==", practice.id)
        .get();

      const attemptCount = submissionsSnap.size || 0;
      return { ...practice, attempts: attemptCount };
    })
  );

  return updatedPractices;
};

// get by id
export const getUserReadingById = async (id) => {
  const doc = await db.collection(ReadingPractice.collectionName).doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data();

  // count this submission task
  const submissionsSnap = await db
    .collection("reading_submissions")
    .where("practice_id", "==", id)
    .get();

  const attemptCount = submissionsSnap.size || 0;

  return {
    id: doc.id,
    section: data.section,
    title: data.title,
    type: data.type,
    image_url: data.image_url || null,
    content: data.content || "",
    content_text: data.content_text || "",
    correct_answer: data.correct_answer || "",
    time_limit: data.time_limit || 0,
    is_active: data.is_active ?? true,
    created_at: data.created_at || null,
    updated_at: data.updated_at || null,
    attempts: attemptCount,
  };
};
