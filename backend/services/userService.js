import bcrypt from "bcrypt";
import { db } from "../config/firebase.js"; 
import { User } from "../models/userModel.js";

const userCollection = db.collection("users");

// register
export async function registerUser(userName, email, password) {
  // check email
  const existingUser = await userCollection.where("email", "==", email).get();
  if (!existingUser.empty) {
    throw new Error("Email already registered");
  }

  // hash pass
  const passwordHash = await bcrypt.hash(password, 10);

  // create new user if not existed
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

  // save firebase
  const docRef = await userCollection.add(JSON.parse(JSON.stringify(newUser)));
  return { id: docRef.id, ...newUser };
}

// login
export async function loginUser(email, password) {
  // check user
  const userSnapshot = await userCollection.where("email", "==", email).get();

  if (userSnapshot.empty) {
    throw new Error("Email not found");
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();

  // check status
  if (userData.status !== "Active") {
    throw new Error("Account is inactive. Please contact admin.");
  }

  // compare pass
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
  };
}
