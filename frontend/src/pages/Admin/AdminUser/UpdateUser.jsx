import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./UpdateUser.css";

const mockUsers = [
  {
    id: 1,
    avatar: "/assets/avatar.jpg",
    username: "John Doe",
    email: "johndoe@email.com",
    role: "user",
    active: true,
  },
  {
    id: 2,
    avatar: "/assets/avatar.jpg",
    username: "Jane Smith",
    email: "janesmith@email.com",
    role: "admin",
    active: false,
  },
];

const UpdateUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userData = mockUsers.find((u) => u.id === Number(id));

  const [formData, setFormData] = useState(userData || {});

  useEffect(() => {
    if (!userData) {
      alert("User không tồn tại!");
      navigate("/admin/manage_user");
    }
  }, [userData, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu đã thay đổi:", formData);
    alert(`Cập nhật thành công cho user: ${formData.username}`);
    navigate("/admin/manage_user");
  };

  return (
    <div className="admin-container-updateuser">
      <AdminHeader />
      <div className="main-content-updateuser">
        <h2 className="page-title-updateuser">Update User</h2>
        <form className="update-user-form-updateuser" onSubmit={handleSubmit}>
          <div className="form-group-updateuser">
            <label></label>
            <img
              src={formData.avatar}
              alt="avatar"
              className="update-user-avatar-updateuser"
            />
          </div>

          <div className="form-group-updateuser">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              required
              readOnly
            />
          </div>

          <div className="form-group-updateuser">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              required
              readOnly
            />
          </div>

          <div className="form-group-updateuser">
            <label>Role:</label>
            <select
              name="role"
              value={formData.role || "user"}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group-updateuser">
            <label>Active:</label>
            <select
              name="active"
              value={formData.active ? "true" : "false"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  active: e.target.value === "true",
                })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="button-group-updateuser">
            <button type="submit" className="btn-save-updateuser">
              Save Changes
            </button>
            <button
              type="button"
              className="btn-cancel-updateuser"
              onClick={() => navigate("/admin/manage_user")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserPage;
