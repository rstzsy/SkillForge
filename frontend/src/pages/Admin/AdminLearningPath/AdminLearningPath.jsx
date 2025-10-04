import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./AdminLearningPath.css";

const AdminLearningPath = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  if (!user) {
    return (
      <div className="no-data-learningpath">
        <p>No user data found. Please go back.</p>
        <button
          className="btn-back-learningpath"
          onClick={() => navigate("/admin/manage_user")}
        >
          ← Back
        </button>
      </div>
    );
  }

  // Dữ liệu lộ trình học chi tiết (ví dụ)
  const learningDays = [
    {
      day: "Day 1",
      tasks: [
        { title: "IELTS Speaking Test 1", progress: 100 },
        { title: "IELTS Writing Task 2", progress: 70 },
      ],
    },
    {
      day: "Day 2",
      tasks: [
        { title: "IELTS Listening Practice 2", progress: 80 },
        { title: "IELTS Reading Passage 1", progress: 50 },
      ],
    },
    {
      day: "Day 3",
      tasks: [
        { title: "IELTS Mock Test - Full", progress: 40 },
      ],
    },
  ];

  return (
    <div className="admin-container-learningpath">
      <AdminHeader />

      <div className="main-content-learningpath">
        <h2 className="page-title-learningpath">
          Learning Path of {user.username}
        </h2>

        {/* User Info */}
        <div className="user-info-learningpath">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="user-avatar-learningpath"
          />
          <div className="user-details-learningpath">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>

        {/* Learning Days */}
        <div className="day-list-learningpath">
          {learningDays.map((day, i) => (
            <div key={i} className="day-card-learningpath">
              <h3>{day.day}</h3>
              {day.tasks.map((task, index) => (
                <div key={index} className="task-item-learningpath">
                  <div className="task-info">
                    <span>{task.title}</span>
                    <span className="progress-text">{task.progress}%</span>
                  </div>
                  <div className="progress-bar-learningpath">
                    <div
                      className="progress-fill-learningpath"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          className="btn-back-learningpath"
          onClick={() => navigate("/admin/manage_user")}
        >
          Back to User Management
        </button>
      </div>
    </div>
  );
};

export default AdminLearningPath;
