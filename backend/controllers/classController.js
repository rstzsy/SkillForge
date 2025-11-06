import { getAllTeachers, getAllStudents, addClassService, 
    getAllClasses, getClassById, updateClass, 
    deleteClass, getClassesByTeacherId, getClassesForUser } from "../services/classService.js";

export const getTeachersController = async (req, res) => {
  try {
    const teachers = await getAllTeachers();
    res.status(200).json(teachers);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
};

export const getStudentsController = async (req, res) => {
  try {
    const students = await getAllStudents();
    res.status(200).json(students);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const addClassController = async (req, res) => {
  try {
    const classData = req.body;
    if (!classData.name || !classData.subject || !classData.teacherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await addClassService(classData); 
    res.status(201).json(result);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add class" });
  }
};

// all classes
export const getClassesController = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.status(200).json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};

// class by id
export const getClassByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await getClassById(id);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    res.status(200).json(cls);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch class" });
  }
};

// update class
export const handleUpdateClass = async (req, res) => {
  const { id } = req.params;
  const classData = req.body;

  try {
    const updatedClass = await updateClass(id, classData);
    res.status(200).json({ message: "Class updated successfully", data: updatedClass });
  } 
  catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// delete class
export const handleDeleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteClass(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getClassesByTeacherController = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const classes = await getClassesByTeacherId(teacherId);
    return res.status(200).json(classes);
  } catch (err) {
    console.error("Failed to fetch classes:", err);
    return res.status(500).json({ message: "Failed to fetch classes" });
  }
};

// student
export const handleGetClassesOfUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const classes = await getClassesForUser(userId);

    return res.status(200).json({
      message: "Fetched classes successfully",
      classes,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
