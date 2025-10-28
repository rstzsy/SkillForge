import { db } from "../config/firebase.js";

export const getAllUsers = async () => {
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return users;
};

export const getUserByIdService = async (id) => {
  const userRef = db.collection("users").doc(id);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return null;
  return { id: userDoc.id, ...userDoc.data() };
};

export const updateUserByIdService = async (id, data) => {
  const userRef = db.collection("users").doc(id);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new Error("User not found");

  const updateData = {};
  if (data.role) updateData.role = data.role;
  if (data.status !== undefined) updateData.status = data.status;

  await userRef.update(updateData);

  const updatedDoc = await userRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};