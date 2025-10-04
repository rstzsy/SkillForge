import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageUser.css";

const ManageUser = () => {
  const [users] = useState([
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
  ]);

  const navigate = useNavigate();

  const handleUpdate = (user) => {
    navigate(`/admin/manage_user/update/${user.id}`, { state: { user } });
  };

  const handleViewLearningPath = (user) => {
    navigate(`/admin/manage_user/learning_path/${user.id}`, { state: { user } });
  };

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
                <th>Active</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">{user.id}</td>
                  <td>
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="user-avatar-usermanage"
                    />
                  </td>
                  <td data-label="Username">{user.username}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">{user.role}</td>
                  <td data-label="Active">
                    <span
                      className={
                        user.active
                          ? "active-usermanage"
                          : "inactive-usermanage"
                      }
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="Control" className="control-buttons-usermanage">
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
                      View Learning Path
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
