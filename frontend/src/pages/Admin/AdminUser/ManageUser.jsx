import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageUser.css";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // call api
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://skillforge-99ct.onrender.com/api/admin/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        console.log("Danh sách user:", data);
        setUsers(data);
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
        setError("Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdate = (user) => {
    navigate(`/admin/manage_user/update/${user.id}`, { state: { user } });
  };

  const handleViewLearningPath = (user) => {
    navigate(`/admin/manage_user/learning_path/${user.id}`, {
      state: { user },
    });
  };

  const handleViewPersonalAim = (user) => {
    navigate(`/admin/manage_user/personal_aim/${user.id}`, { state: { user } });
  };

  // loading data
  if (loading)
    return <p style={{ textAlign: "center" }}>Đang tải dữ liệu...</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="admin-container-usermanage">
      <AdminHeader />

      <div className="main-content-usermanage">
        <h2 className="page-title-usermanage">Manage Users</h2>
        <div className="user-table-wrapper-usermanage">
          <table className="user-table-usermanage">
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id || index}>
                  <td data-label="ID">{index + 1}</td> {/* auto id */}
                  <td>
                    <img
                      src={user.avatar || "/assets/avatar.jpg"}
                      alt="avatar"
                      className="user-avatar-usermanage"
                    />
                  </td>
                  <td data-label="Username">{user.userName}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">{user.role}</td>
                  <td data-label="Status">
                    <span
                      className={
                        user.status === "Active"
                          ? "active-usermanage"
                          : "inactive-usermanage"
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td
                    data-label="Control"
                    className="control-buttons-usermanage"
                  >
                    <button
                      className="btn-update-usermanage"
                      onClick={() => handleUpdate(user)}
                    >
                      Update
                    </button>
                    <button
                      className="btn-learningpath-usermanage"
                      onClick={() => handleViewLearningPath(user)}
                    >
                      View Path
                    </button>
                    <button
                      className="btn-personalaim-usermanage"
                      onClick={() => handleViewPersonalAim(user)}
                    >
                      View Aim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
