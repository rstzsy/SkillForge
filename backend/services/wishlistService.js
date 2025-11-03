import { db } from "../config/firebase.js";
import { Wishlist } from "../models/wishlistModel.js";

const typeToCollection = {
  listening: "listening_practices",
  reading: "reading_practices",
  speaking: "speaking_practices",
  writing: "writing_practices",
};

export const addToWishlist = async (data) => {
  const { user_id, practice_id, type } = data;

  const existing = await db
    .collection(Wishlist.collectionName)
    .where("user_id", "==", user_id)
    .where("practice_id", "==", practice_id)
    .where("type", "==", type)
    .get();

  if (!existing.empty) {
    return { duplicate: true };
  }

  const wishlistItem = new Wishlist(data);
  const docRef = await db.collection(Wishlist.collectionName).add({
    ...wishlistItem,
    practice_id: wishlistItem.practice_id || wishlistItem.speaking_practices_id,
  });

  return { id: docRef.id, ...wishlistItem, duplicate: false };
};

export const getWishlistByUser = async (userId) => {
  const snapshot = await db
    .collection(Wishlist.collectionName)
    .where("user_id", "==", userId)
    .get();

  const wishlistDocs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const wishlistWithPractice = await Promise.all(
    wishlistDocs.map(async (item) => {
      const typeKey = item.type?.trim().toLowerCase();

      if (typeKey === "listening" || typeKey === "reading") {
        const collection = typeToCollection[typeKey];
        const practiceSnap = await db.collection(collection).doc(item.practice_id).get();
        const practiceData = practiceSnap.exists ? practiceSnap.data() : {};
        return { ...item, ...practiceData };
      }

      if (typeKey === "writing") {
        const practiceSnap = await db.collection("writing_practices").doc(item.practice_id).get();
        const practiceData = practiceSnap.exists ? practiceSnap.data() : {};
        return { ...item, ...practiceData };
      }

      if (typeKey === "speaking") {
        const practiceSnap = await db.collection("speaking_practices").doc(item.practice_id).get();
        const practiceData = practiceSnap.exists ? practiceSnap.data() : {};
        return { ...item, ...practiceData, section: "Speaking", title: practiceData.topic || "Untitled Speaking" };
      }

      return { ...item };
    })
  );

  return wishlistWithPractice;
};

// delete
export const removeWishlistItem = async (id) => {
  await db.collection(Wishlist.collectionName).doc(id).delete();
  return true;
};
