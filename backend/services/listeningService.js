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

  // get all data
  const practices = snapshot.docs.map((doc) => ({
    id: doc.id,
    section: doc.data().section,
    title: doc.data().title,
    type: doc.data().type,
    image_url: doc.data().image_url || null,
    audio_url: doc.data().audio_url || null,
    content: doc.data().content_text || "",
    correctAnswer: doc.data().correct_answer || "",
    timeLimit: doc.data().time_limit || null,
    attempts: 0, 
  }));

  // count submission -> attempt
  const updatedPractices = await Promise.all(
    practices.map(async (practice) => {
      const submissionsSnap = await db
        .collection("listening_submissions")
        .where("practice_id", "==", practice.id)
        .get();

      const attemptCount = submissionsSnap.size || 0;
      return { ...practice, attempts: attemptCount };
    })
  );

  return updatedPractices;
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

