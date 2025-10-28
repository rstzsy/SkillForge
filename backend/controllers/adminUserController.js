import { getAllUsers, getUserByIdService, updateUserByIdService } from "../services/adminUserService.js";

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } 
  catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};


export const getUserByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserByIdService(id); 
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    if (!role && status === undefined) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedUser = await updateUserByIdService(id, { role, status });
    return res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    console.error("Lỗi update user:", err);
    return res.status(500).json({ message: "Cập nhật thất bại" });
  }
};

