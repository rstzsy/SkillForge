import { db } from "../config/firebase.js";
import { ListeningPractice } from "../models/listeningModel.js";

// user
export const getUserListeningList = async () => {
  const snapshot = await db.collection(ListeningPractice.collectionName).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    section: doc.data().section,
    title: doc.data().title,
    type: doc.data().type,
    image_url: doc.data().image_url || null,
    audio_url: doc.data().audio_url || null,
    content_text: doc.data().content_text || "",
    correct_answer: doc.data().correct_answer || "",
    time_limit: doc.data().time_limit || 0,
    attempts: doc.data().attempts || 0,
  }));
};

export const getUserListeningById = async (id) => {
  const doc = await db.collection(ListeningPractice.collectionName).doc(id).get();
  if (!doc.exists) return null; 
  return {
    id: doc.id,
    section: doc.data().section,
    title: doc.data().title,
    type: doc.data().type,
    image_url: doc.data().image_url || null,
    audio_url: doc.data().audio_url || null,
    content_text: doc.data().content_text || "",
    correct_answer: doc.data().correct_answer || "",
    time_limit: doc.data().time_limit || 0,
    attempts: doc.data().attempts || 0,
  };
};