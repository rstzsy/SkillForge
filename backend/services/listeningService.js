import { db } from "../config/firebase.js";
import { ListeningPractice } from "../models/listeningModel.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import admin from "firebase-admin";

// create
export const createListeningPractice = async (formData) => {
  // lay url tu frontend
  const newPractice = new ListeningPractice({
    section: formData.section,
    title: formData.title,
    type: formData.type,
    image_url: formData.imageURL || null,
    content_text: formData.content || "",
    correct_answer: formData.correctAnswer || "",
    audio_url: formData.audioURL || null,
    time_limit: formData.timeLimit || "",
  });

  const docRef = await db
    .collection(ListeningPractice.collectionName)
    .add({ ...newPractice });

  return { id: docRef.id, ...newPractice };
};

// all list
export const getListeningPractices = async () => {
  const snapshot = await db.collection(ListeningPractice.collectionName).get();
  const data = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      section: d.section,
      title: d.title,
      type: d.type,
      image_url: d.image_url || null,
      audio_url: d.audio_url || null,
      content: d.content_text || "",
      correctAnswer: d.correct_answer || "",
      timeLimit: d.time_limit || null,
      attempts: d.attempts || 0,
    };
  });
  return data; // return array
};

// get by id
export const getListeningPracticeById = async (id) => {
  const doc = await db
    .collection(ListeningPractice.collectionName)
    .doc(id)
    .get();
  if (!doc.exists) throw new Error("Listening practice not found");
  return { id: doc.id, ...doc.data() };
};

// update
export const updateListeningPractice = async (id, formData) => {
  const updateData = {
    section: formData.section,
    title: formData.title,
    type: formData.type,
    content_text: formData.content,
    correct_answer: formData.correctAnswer,
    time_limit: formData.timeLimit,
    updated_at: new Date(),
  };

  // url link
  if (formData.imageURL) updateData.image_url = formData.imageURL;
  if (formData.audioURL) updateData.audio_url = formData.audioURL;

  await db.collection(ListeningPractice.collectionName).doc(id).update(updateData);
  const updatedDoc = await db.collection(ListeningPractice.collectionName).doc(id).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// delete
export const deleteListeningPractice = async (id) => {
  await db.collection(ListeningPractice.collectionName).doc(id).delete();
  return { message: "Deleted successfully" };
};

