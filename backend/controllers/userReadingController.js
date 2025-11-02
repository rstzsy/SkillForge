import {
  getUserReadingList,
  getUserReadingById,
} from "../services/userReadingService.js";

export const getUserReadingListController = async (req, res) => {
  try {
    const list = await getUserReadingList();
    res.status(200).json({
      message: "User reading practices fetched successfully",
      data: list,
    });
  } catch (err) {
    console.error("Error fetching reading list:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserReadingDetailController = async (req, res) => {
  try {
    const data = await getUserReadingById(req.params.id);
    if (!data)
      return res
        .status(404)
        .json({ message: "Reading practice not found" });

    res.status(200).json({
      message: "User reading practice fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Error fetching reading detail:", err);
    res.status(500).json({ message: err.message });
  }
};
