import express from "express";
import { getTeachersController, getStudentsController, 
         addClassController, getClassesController, 
         getClassByIdController, handleUpdateClass, 
         handleDeleteClass, getClassesByTeacherController, handleGetClassesOfUser } from "../controllers/classController.js";

const router = express.Router();

// teacher list
router.get("/teachers", getTeachersController);

// student list
router.get("/students", getStudentsController);

router.post("/", addClassController);
router.get("/", getClassesController);
router.get("/:id", getClassByIdController);
router.put("/:id", handleUpdateClass);
router.delete("/:id", handleDeleteClass);
router.get("/teacher/:teacherId", getClassesByTeacherController);
router.get("/user/:userId", handleGetClassesOfUser);
export default router;
