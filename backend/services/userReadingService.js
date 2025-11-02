import { db } from "../config/firebase.js";
import { ReadingPractice } from "../models/readingModel.js";

export const getUserReadingList = async () => {
  const snapshot = await db.collection(ReadingPractice.collectionName).get();

  return snapshot.docs.map((doc) => ({
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
  }));
};

export const getUserReadingById = async (id) => {
  const doc = await db.collection(ReadingPractice.collectionName).doc(id).get();
  if (!doc.exists) return null;

  return {
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
  };
};
