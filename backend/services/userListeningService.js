import { db } from "../config/firebase.js";
import { ListeningPractice } from "../models/listeningModel.js";

// get all list
export const getUserListeningList = async () => {
  try {
    const snapshot = await db.collection(ListeningPractice.collectionName).get();
    const data = [];

    for (const doc of snapshot.docs) {
      const practice = doc.data();

      // count attemprt
      const submissionsSnap = await db
        .collection("listening_submissions")
        .where("practice_id", "==", doc.id)
        .get();

      const attempts = submissionsSnap.size; // attempt all users

      data.push({
        id: doc.id,
        section: practice.section,
        title: practice.title,
        type: practice.type,
        image_url: practice.image_url || null,
        audio_url: practice.audio_url || null,
        content_text: practice.content_text || "",
        correct_answer: practice.correct_answer || "",
        time_limit: practice.time_limit || 0,
        attempts,
      });
    }

    return data;
  } catch (err) {
    console.error("Error fetching listening list:", err);
    throw new Error(err.message);
  }
};

// get by id
export const getUserListeningById = async (id) => {
  try {
    const doc = await db.collection(ListeningPractice.collectionName).doc(id).get();
    if (!doc.exists) return null;

    const practice = doc.data();

    // count attempts
    const submissionsSnap = await db
      .collection("listening_submissions")
      .where("practice_id", "==", id)
      .get();

    const attempts = submissionsSnap.size;

    return {
      id: doc.id,
      section: practice.section,
      title: practice.title,
      type: practice.type,
      image_url: practice.image_url || null,
      audio_url: practice.audio_url || null,
      content_text: practice.content_text || "",
      correct_answer: practice.correct_answer || "",
      time_limit: practice.time_limit || 0,
      attempts, 
    };
  } catch (err) {
    console.error("Error fetching listening detail:", err);
    throw new Error(err.message);
  }
};
