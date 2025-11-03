import { db } from "../config/firebase.js";
import { Wishlist } from "../models/wishlistModel.js";

// Mapping type => collection
const typeToCollection = {
  listening: "listening_practices",
  reading: "reading_practices",
};

// add to wishlist
export const addToWishlist = async (data) => {
  const wishlistItem = new Wishlist(data);

  // luu practice_id = skill_id 
  const docRef = await db.collection(Wishlist.collectionName).add({
    ...wishlistItem,
    practice_id: wishlistItem.practice_id || wishlistItem.speaking_practices_id,
  });

  return { id: docRef.id, ...wishlistItem };
};

// get by user
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

      // Listening & Reading
      if (typeKey === "listening" || typeKey === "reading") {
        const collection = typeToCollection[typeKey];
        const practiceSnap = await db
          .collection(collection)
          .doc(item.practice_id)
          .get();
        const practiceData = practiceSnap.exists ? practiceSnap.data() : {};
        return { ...item, ...practiceData };
      }

      // Writing
      if (typeKey === "writing") {
        // Trong writing, document ID = wishlist.practice_id
        const practiceSnap = await db
          .collection("writing_practices")
          .doc(item.practice_id)
          .get();
        const practiceData = practiceSnap.exists ? practiceSnap.data() : {};
        return { ...item, ...practiceData };
      }

      // Speaking
      if (typeKey === "speaking") {
        const snap = await db.collection("speaking_practices").get();
        const allSpeaking = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const practiceData =
          allSpeaking.find(
            (sp) => sp.speaking_practices_id === item.practice_id
          ) || {};

        return { ...item, ...practiceData };
      }

      return { ...item };
    })
  );

  return wishlistWithPractice;
};

// delete in wishlit
export const removeWishlistItem = async (id) => {
  await db.collection(Wishlist.collectionName).doc(id).delete();
  return true;
};
