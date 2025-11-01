import { getUserListeningList, getUserListeningById } from "../services/userListeningService.js";

export const getUserListeningListController = async (req, res) => {
  try {
    const list = await getUserListeningList();
    res.status(200).json({ message: "User listening practices fetched successfully", data: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserListeningDetailController = async (req, res) => {
  try {
    const data = await getUserListeningById(req.params.id);
    if (!data) return res.status(404).json({ message: "Listening practice not found" });
    res.status(200).json({ message: "User listening practice fetched successfully", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};