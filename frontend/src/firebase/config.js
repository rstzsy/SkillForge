import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCQxa6G4_XWeR8471xDJjKPNFbleadt9rM",
  authDomain: "skill-94f02.firebaseapp.com",
  projectId: "skill-94f02",
  storageBucket: "skill-94f02.appspot.com",
  messagingSenderId: "47899552265",
  appId: "1:47899552265:web:78fe52dd2d83f29542a6d8",
  measurementId: "G-M8PFSHL88T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
export { app };