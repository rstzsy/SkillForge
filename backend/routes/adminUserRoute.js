import express from "express";
import { getAllUsersController, getUserByIdController, updateUserController, getStudentsByTeacherController } from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.put("/:id", updateUserController);
router.get("/teacher/students/:teacherId", getStudentsByTeacherController);

export default router;
