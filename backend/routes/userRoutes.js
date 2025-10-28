import express from "express";
import { handleRegister, handleLogin, handleGoogleLogin, updateUserController } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/google-login", handleGoogleLogin);
router.put("/:id", updateUserController);

export default router;
