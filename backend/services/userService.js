import bcrypt from "bcrypt";
import { db } from "../config/firebase.js"; 
import { User } from "../models/userModel.js";

const userCollection = db.collection("users");

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
  });

  // save firebase
  const docRef = await userCollection.add(JSON.parse(JSON.stringify(newUser)));
  return { id: docRef.id, ...newUser };
}
