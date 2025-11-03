import express from "express";
import {
  addToWishlistController,
  getWishlistByUserController,
  removeWishlistItemController,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/", addToWishlistController);
router.get("/:user_id", getWishlistByUserController);
router.delete("/:id", removeWishlistItemController);

export default router;
