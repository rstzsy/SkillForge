import React, { useState, useEffect } from "react";
import "./Account.css";

const AccountPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "********",
    src: "/assets/avatar.jpg",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setFormData({
        username:
          storedUser.userName || 
          storedUser.displayName || 
          storedUser.name || 
          "Unknown User",
        email: storedUser.email || "",
        password: "********",
        src:
          storedUser.avatar || 
          storedUser.photoURL || 
          "/assets/avatar.jpg",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSrc = URL.createObjectURL(file);
      setFormData({ ...formData, src: newSrc });
    }
  };

  const handleUpdate = async () => {
    try {
      console.log("Updated User Info:", formData);
      alert("Thông tin đã được cập nhật!");
      localStorage.setItem("user", JSON.stringify(formData));
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="account-wrapper">
      <div className="account-left">
        <img
          src={formData.src}
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
            onChange={handleChange}
            readOnly
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <button className="account-update-btn" onClick={handleUpdate}>
            Update Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
