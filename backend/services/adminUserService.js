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

// teacher
export const getStudentsByTeacherId = async (teacherId) => {
  try {
    // all class by teacher
    const classesSnapshot = await db.collection("classes")
      .where("teacherId", "==", teacherId)
      .get();

    const studentsData = [];

    classesSnapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };
      // 1 student co the tham gia nhieu class
      cls.students.forEach(s => {
        studentsData.push({
          id: s.id, 
          name: s.name, 
          classId: cls.id,
          className: cls.name,
        });
      });
    });

    // get student information
    for (let student of studentsData) {
      const userDoc = await db.collection("users").doc(student.id).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        student.email = userData.email;
        student.avatar = userData.avatar || "/assets/avatar.jpg";
      } else {
        student.email = "";
        student.avatar = "/assets/avatar.jpg";
      }
    }

    return studentsData;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw new Error("Failed to fetch students");
  }
};
