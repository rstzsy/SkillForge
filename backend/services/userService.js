import bcrypt from "bcrypt";
import { db } from "../config/firebase.js";
import { User } from "../models/userModel.js";
import admin from "firebase-admin";

const userCollection = db.collection("users");

// REGISTER
export async function registerUser(userName, email, password) {
  const existingUser = await userCollection.where("email", "==", email).get();
  if (!existingUser.empty) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = new User({
    userName,
    email,
    passwordHash,
    avatar: null,
    user_phone: null,
    role: "Customer",
    status: "Active",
    createdAt: new Date(),
  });

  const docRef = await userCollection.add(JSON.parse(JSON.stringify(newUser)));
  return { id: docRef.id, ...newUser };
}

// LOGIN
export async function loginUser(email, password) {
  const userSnapshot = await userCollection.where("email", "==", email).get();
  if (userSnapshot.empty) {
    throw new Error("Email not found");
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();

  if (userData.status !== "Active") {
    throw new Error("Account is inactive. Please contact admin.");
  }

  const isMatch = await bcrypt.compare(password, userData.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return {
    id: userDoc.id,
    userName: userData.userName,
    email: userData.email,
    role: userData.role,
    status: userData.status,
    avatar: userData.avatar || null,
  };
}

// 🔹 GOOGLE LOGIN
export async function loginWithGoogle(idToken) {
  try {
    // Verify token từ client gửi lên
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email, picture } = decoded;

    // Kiểm tra xem user có tồn tại chưa
    const existingUserSnap = await userCollection.where("email", "==", email).get();

    if (!existingUserSnap.empty) {
      // Nếu user đã tồn tại → trả về thông tin
      const userDoc = existingUserSnap.docs[0];
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        userName: userData.userName,
        email: userData.email,
        avatar: userData.avatar,
        role: userData.role,
        status: userData.status,
      };
    }

    // Nếu chưa có → tạo mới user từ Google info
    const newUser = new User({
      userName: name || "Google User",
      email,
      passwordHash: null, // Google users không có mật khẩu
      avatar: picture || null,
      user_phone: null,
      role: "Customer",
      status: "Active",
      createdAt: new Date(),
    });

    const docRef = await userCollection.add(JSON.parse(JSON.stringify(newUser)));

    return { id: docRef.id, ...newUser };
  } catch (error) {
    console.error("Google login error:", error);
    throw new Error("Invalid Google token");
  }
}

// update information (customer)
export const updateUserById = async (id, userData) => {
  try {
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const updateData = {
      userName: userData.username,
      email: userData.email,
      avatar: userData.avatar || null,
      updatedAt: new Date(),
    };

    // if change new pass
    if (userData.password && userData.password !== "********") {
      updateData.passwordHash = await bcrypt.hash(userData.password, 10);
    }

    // update firestore
    await userRef.update(updateData);

    // lay lai data sau khi update
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } 
  catch (error) {
    console.error("Firestore update error:", error);
    throw new Error("Failed to update user");
  }
};
