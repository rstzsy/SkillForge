import admin from "firebase-admin";

// Kiểm tra nếu chưa khởi tạo Firebase Admin
if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Production: sử dụng các biến môi trường riêng lẻ
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else {
    // Development: đọc từ file local
    const serviceAccount = await import("./serviceAccountKey.json", {
      with: { type: "json" }
    }).then(m => m.default);
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({
    credential: credential,
  });
}

export const db = admin.firestore();