import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase/config";
import { useToast } from "../../component/Toast/ToastContainer";
import "./Account.css";

const AccountPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "/assets/avatar.jpg",
  });

  // Lưu trữ dữ liệu ban đầu để so sánh
  const [initialData, setInitialData] = useState({
    username: "",
    email: "",
    avatar: "/assets/avatar.jpg",
  });

  const storage = getStorage(app);
  const toast = useToast();
  

  // Load user từ localStorage khi mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const userData = {
        username: storedUser.userName || storedUser.displayName || storedUser.name || "Unknown User",
        email: storedUser.email || "",
        password: "",
        avatar: storedUser.avatar || "/assets/avatar.jpg",
      };
      setFormData(userData);
      // Lưu dữ liệu ban đầu (không bao gồm password)
      setInitialData({
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
      });
    }
  }, []);

  // Kiểm tra xem có thay đổi nào không
  const hasChanges = () => {
    return (
      formData.username !== initialData.username ||
      formData.avatar !== initialData.avatar ||
      formData.password.trim() !== "" // Nếu có nhập password mới
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Upload avatar to Firebase Storage and update Firestore ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please, choosing image!");
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.id) {
        toast("Please login first!");
        return;
      }

      // Preview 
      const previewURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: previewURL }));

      // Upload up Firebase Storage
      const fileName = `${storedUser.id}_${Date.now()}_${file.name}`;
      const avatarRef = ref(storage, `avatars/${fileName}`);
      await uploadBytes(avatarRef, file);

      // get URL storage
      const downloadURL = await getDownloadURL(avatarRef);

      // call backend update Firestore
      const response = await fetch(`https://skillforge-99ct.onrender.com/api/users/${storedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: downloadURL }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      // update state and localStorage
      setFormData((prev) => ({ ...prev, avatar: downloadURL }));
      setInitialData((prev) => ({ ...prev, avatar: downloadURL })); // Cập nhật initialData
      const updatedUser = { ...storedUser, avatar: downloadURL };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast("Avatar is updated!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast("Upload ảnh thất bại!");
    }
  };

  // --- Update user information ---
  const handleUpdate = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        toast("Please login first!");
        return;
      }

      // tao payload chi gom cac gia tri
      const payload = {};
      if (formData.username !== initialData.username) payload.username = formData.username;
      if (formData.email) payload.email = formData.email;
      if (formData.password) payload.password = formData.password;
      if (formData.avatar !== initialData.avatar) payload.avatar = formData.avatar;

      const response = await fetch(`https://skillforge-99ct.onrender.com/api/users/${storedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      // Lưu user moi vao localStorage, khong lưu password
      const { password, ...userWithoutPassword } = data.updatedUser;
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      // Cập nhật initialData với dữ liệu mới
      setInitialData({
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar,
      });

      // Reset password input
      setFormData((prev) => ({ ...prev, password: "" }));

      toast("User information is updated!");
    } catch (error) {
      console.error("Update failed:", error);
      toast("Cập nhật thất bại!");
    }
  };

  return (
    <div className="account-wrapper">
      <div className="account-left">
        <img
          src={formData.avatar || "/assets/avatar.jpg"}
          alt="User Avatar"
          className="account-avatar"
        />
        <label htmlFor="avatar-upload" className="account-avatar-btn">
          Change Avatar
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>

      <div className="account-right">
        <h2 className="account-title">User Information</h2>
        <div className="account-form">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••"
            value={formData.password}
            onChange={handleChange}
          />

          <button 
            className="account-update-btn" 
            onClick={handleUpdate}
            disabled={!hasChanges()}
          >
            Update Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;