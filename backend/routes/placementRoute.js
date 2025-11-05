import express from "express";
import { getPlacementTestsController, getUserPlacementTestsController } from "../controllers/placementController.js";

const router = express.Router();

router.get("/", getPlacementTestsController);
router.get("/user/:userId", getUserPlacementTestsController);

export default router;
