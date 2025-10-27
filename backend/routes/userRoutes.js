import express from "express";
import { handleRegister, handleLogin, handleGoogleLogin } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/google-login", handleGoogleLogin);

export default router;
