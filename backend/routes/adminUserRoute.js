import express from "express";
import { getAllUsersController, getUserByIdController, updateUserController } from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.put("/:id", updateUserController);

export default router;
