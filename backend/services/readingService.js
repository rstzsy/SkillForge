import { db } from "../config/firebase.js";
import { ReadingPractice } from "../models/readingModel.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import admin from "firebase-admin";

// create
export const createReadingPractice = async (formData) => {
  // lay url tu frontend
  const newPractice = new ReadingPractice({
    section: formData.section,
    title: formData.title,
    type: formData.type,
    image_url: formData.imageURL || null,
    content: formData.passage || "",
    content_text: formData.content || "",
    correct_answer: formData.correctAnswer || "",
    time_limit: formData.timeLimit || "",
  });

  const docRef = await db
    .collection(ReadingPractice.collectionName)
    .add({ ...newPractice });

  return { id: docRef.id, ...newPractice };
};

// all list
export const getReadingPractices = async () => {
  const snapshot = await db.collection(ReadingPractice.collectionName).get();
  const data = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      section: d.section,
      title: d.title,
      type: d.type,
      image_url: d.image_url || null,
      passage: d.content || "",
      content: d.content_text || "",
      correctAnswer: d.correct_answer || "",
      timeLimit: d.time_limit || null,
      attempts: d.attempts || 0,
    };
  });
  return data; // return array
};

// get by id
export const getReadingPracticeById = async (id) => {
  const doc = await db
    .collection(ReadingPractice.collectionName)
    .doc(id)
    .get();
  if (!doc.exists) throw new Error("Reading practice not found");
  return { id: doc.id, ...doc.data() };
};

// update
export const updateReadingPractice = async (id, formData) => {
  const updateData = {
    section: formData.section,
    title: formData.title,
    type: formData.type,
    content: formData.passage,
    content_text: formData.content,
    correct_answer: formData.correctAnswer,
    time_limit: formData.timeLimit,
    updated_at: new Date(),
  };

  // url link
  if (formData.imageURL) updateData.image_url = formData.imageURL;

  await db.collection(ReadingPractice.collectionName).doc(id).update(updateData);
  const updatedDoc = await db.collection(ReadingPractice.collectionName).doc(id).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// delete
export const deleteReadingPractice = async (id) => {
  await db.collection(ReadingPractice.collectionName).doc(id).delete();
  return { message: "Deleted successfully" };
};

