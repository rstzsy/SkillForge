import express from "express";
import { handleRegister } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", handleRegister);

export default router;
