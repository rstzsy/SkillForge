import React, { useState } from "react";
import "./Account.css";

const AccountPage = () => {
  // Dữ liệu gốc ban đầu
  const initialData = {
    username: "John Doe",
    email: "johndoe@email.com",
    password: "********",
    src: "/assets/avatar.jpg",
  };

  const [formData, setFormData] = useState(initialData);

  // Cập nhật text input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cập nhật avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSrc = URL.createObjectURL(file);
      setFormData({ ...formData, src: newSrc });
    }
  };

  // Xử lý cập nhật
  const handleUpdate = () => {
    // So sánh dữ liệu thay đổi
    const changedData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== initialData[key]) {
        changedData[key] = formData[key];
      }
    });

    console.log("Changed Data:", changedData);
    alert("Thông tin đã được cập nhật!");
  };

  return (
    <div className="account-wrapper">
      {/* Left: Avatar */}
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

      {/* Right: User Info */}
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
