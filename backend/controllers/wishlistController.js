import {
  addToWishlist,
  getWishlistByUser,
  removeWishlistItem,
} from "../services/wishlistService.js";

export const addToWishlistController = async (req, res) => {
  try {
    const { user_id, practice_id, type } = req.body;

    if (!user_id || !practice_id || !type) {
      return res
        .status(400)
        .json({ message: "Missing required fields: user_id, practice_id, type" });
    }

    const result = await addToWishlist({ user_id, practice_id, type });

    res.status(201).json({
      message: "Added to wishlist successfully",
      wishlist: result,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Failed to add to wishlist", error: error.message });
  }
};

export const getWishlistByUserController = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id parameter" });
    }

    const wishlist = await getWishlistByUser(user_id);

    res.status(200).json({
      message: "Wishlist fetched successfully",
      data: wishlist, // đổi tên thành "data" cho thống nhất frontend
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

export const removeWishlistItemController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing wishlist item ID" });
    }

    await removeWishlistItem(id);

    res.status(200).json({ message: "Item removed from wishlist successfully" });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    res.status(500).json({ message: "Failed to remove item", error: error.message });
  }
};
