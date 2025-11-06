import { db } from "../config/firebase.js";

// teacher list
export const getAllTeachers = async () => {
  const snapshot = await db
    .collection("users")
    .where("role", "==", "Teacher")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// student list
export const getAllStudents = async () => {
  const snapshot = await db
    .collection("users")
    .where("role", "==", "Customer")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// create class with auto-generated classId
export const addClassService = async (classData) => {
  // auto id
  const classRef = db.collection("classes").doc();
  const classId = classRef.id;

  await classRef.set({
    classId,
    name: classData.name,
    subject: classData.subject,
    teacherId: classData.teacherId,
    schedule: new Date(classData.schedule),
    driveLink: classData.driveLink || null,
    zoomLink: classData.zoomLink || null,
    students: classData.students || [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { message: "Class added successfully", classId };
};

// get teacher name by id
export const getTeacherNameById = async (teacherId) => {
  const docRef = db.collection("users").doc(teacherId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return docSnap.data().userName || null;
};

// get all classes
export const getAllClasses = async () => {
  const snapshot = await db.collection("classes").get();

  const classes = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();

      const teacherName = data.teacherId
        ? await getTeacherNameById(data.teacherId)
        : "N/A";

      // xu ly schedule
      let schedule = null;
      if (data.schedule) {
        if (typeof data.schedule.toDate === "function") {
          // Firestore Timestamp
          schedule = data.schedule.toDate().toISOString();
        } else {
          // Date object or string
          schedule = new Date(data.schedule).toISOString();
        }
      }

      return {
        id: doc.id,
        name: data.name,
        subject: data.subject,
        schedule,
        driveLink: data.driveLink || "",
        zoomLink: data.zoomLink || "",
        teacherId: data.teacherId || null,
        teacherName,
        students: data.students || [],
      };
    })
  );

  return classes;
};

// get class by id
export const getClassById = async (classId) => {
  const docRef = db.collection("classes").doc(classId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;

  const data = docSnap.data();

  const teacherName = data.teacherId
    ? await getTeacherNameById(data.teacherId)
    : null;

  return {
    id: docSnap.id,
    ...data,
    teacherName,
    schedule: data.schedule
      ? typeof data.schedule.toDate === "function"
        ? data.schedule.toDate().toISOString()
        : new Date(data.schedule).toISOString()
      : null,
  };
};

// update class
export const updateClass = async (classId, classData) => {
  try {
    const classRef = db.collection("classes").doc(classId);
    const doc = await classRef.get();

    if (!doc.exists) {
      throw new Error("Class not found");
    }

    // chuyen ve timestamp
    const updatedData = {
      name: classData.name,
      subject: classData.subject,
      schedule: classData.schedule ? new Date(classData.schedule) : null,
      driveLink: classData.driveLink || "",
      zoomLink: classData.zoomLink || "",
      teacherId: classData.teacherId || null,
      students: classData.students || [],
    };

    await classRef.update(updatedData);

    const updatedDoc = await classRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (err) {
    console.error("Failed to update class:", err);
    throw err;
  }
};

// delete class
export const deleteClass = async (classId) => {
  try {
    const classRef = db.collection("classes").doc(classId);
    const doc = await classRef.get();

    if (!doc.exists) {
      throw new Error("Class not found");
    }

    await classRef.delete();
    return { message: "Class deleted successfully" };
  } 
  catch (err) {
    console.error("Failed to delete class:", err);
    throw err;
  }
};

// teacher
export const getClassesByTeacherId = async (teacherId) => {
  const snapshot = await db.collection("classes")
    .where("teacherId", "==", teacherId)
    .get();

  const classes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      subject: data.subject,
      schedule: data.schedule ? data.schedule.toDate().toISOString() : null,
      students: data.students || [],
      driveLink: data.driveLink || "",
      zoomLink: data.zoomLink || "",
      studentCount: data.students?.length || 0
    };
  });

  return classes;
};

// student
export const getClassesForUser = async (userId) => {
  if (!userId) throw new Error("Missing userId");

  const classesRef = db.collection("classes");
  const snapshot = await classesRef.get();

  const classList = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // check user in class?
    const isUserInClass = data.students?.some((s) => s.id === userId);
    if (!isUserInClass) continue;

    //get teacher infor
    const teacherDoc = await db.collection("users").doc(data.teacherId).get();
    const teacherData = teacherDoc.exists ? teacherDoc.data() : null;

    // format schedule
    let scheduleFormatted = "";
    if (data.schedule) {
      let dateObj =
        typeof data.schedule.toDate === "function"
          ? data.schedule.toDate() // Firestore Timestamp
          : new Date(data.schedule);

      scheduleFormatted = dateObj.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    classList.push({
      id: doc.id,                  
      name: data.name,
      subject: data.subject,
      schedule: scheduleFormatted, 
      driveLink: data.driveLink || "",
      zoomLink: data.zoomLink || "",
      studentCount: data.students?.length || 0,
      description: data.description || "",
      teacher: teacherData?.userName || "Unknown Teacher",
      teacherEmail: teacherData?.email || null,
    });
  }

  return classList;
};


