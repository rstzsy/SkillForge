import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./UpdateUser.css";

const UpdateUserPage = () => {
  const { id } = useParams(); // Lấy id from route
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch data by id
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/admin/users/${id}`);
        if (!response.ok) throw new Error("Không tìm thấy user");
        const data = await response.json();
        setUserData(data);
      } 
      catch (err) {
        console.error("Lỗi lấy user:", err);
        setError(err.message);
      } 
      finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // change role and status
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3002/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userData.role,
          status: userData.status,
        }),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");
      alert("Cập nhật thành công!");
      navigate("/admin/manage_user"); 
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!userData) return null;

  return (
    <div className="admin-container-updateuser">
      <AdminHeader />
      <div className="main-content-updateuser">
        <h2 className="page-title-updateuser">Update User</h2>
        <form className="update-user-form-updateuser" onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="form-group-updateuser">
            <img
              src={userData.avatar || "/assets/avatar.jpg"}
              alt="avatar"
              className="update-user-avatar-updateuser"
            />
          </div>

          {/* Username */}
          <div className="form-group-updateuser">
            <label>Username:</label>
            <input type="text" name="username" value={userData.userName} readOnly />
          </div>

          {/* Email */}
          <div className="form-group-updateuser">
            <label>Email:</label>
            <input type="email" name="email" value={userData.email} readOnly />
          </div>

          {/* Role */}
          <div className="form-group-updateuser">
            <label>Role:</label>
            <select name="role" value={userData.role} onChange={handleChange}>
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group-updateuser">
            <label>Status:</label>
            <select name="status" value={userData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
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
