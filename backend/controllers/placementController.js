import { getPlacementTests, getUserPlacementTests } from "../services/placementService.js";

export const getPlacementTestsController = async (req, res) => {
  try {
    const userId = req.query.userId || null; 
    const data = await getPlacementTests(userId);
    res.status(200).json({ message: "Placement tests fetched", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch placement tests" });
  }
};

export const getUserPlacementTestsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await getUserPlacementTests(userId);
    res.status(200).json({ message: "User placement tests fetched", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user placement tests" });
  }
};
