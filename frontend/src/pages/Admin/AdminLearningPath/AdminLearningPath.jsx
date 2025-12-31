import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./AdminLearningPath.css";

const AdminLearningPath = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  const [learningDays, setLearningDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLearningPath = async () => {
      try {
        const res = await fetch(
          `https://skillforge-99ct.onrender.com/api/admin/learningpath/user/${user.id}`
        );
        const data = await res.json();
        console.log("Fetched learning path:", data);

        // check cau truc long nhau
        if (Array.isArray(data)) {
          setLearningDays(data);
        } else if (data.learningPath) {
          // 2 array bi long vao nahu
          if (Array.isArray(data.learningPath)) {
            setLearningDays(data.learningPath);
          } else if (data.learningPath.learningPath) {
            // long 2 lan
            setLearningDays(data.learningPath.learningPath);
          } else {
            setLearningDays([]);
          }
        } else {
          setLearningDays([]);
          console.warn("Unexpected response format");
        }
      } catch (err) {
        console.error("Failed to fetch learning path:", err);
        setLearningDays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPath();
  }, [user]);

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

  return (
    <div className="admin-container-learningpath">
      <AdminHeader />
      <div className="main-content-learningpath">
        <h2 className="page-title-learningpath">
          Learning Path of {user.userName}
        </h2>

        {/* User Info */}
        <div className="user-info-learningpath">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="user-avatar-learningpath"
          />
          <div className="user-details-learningpath">
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p>
              <strong>Username:</strong> {user.userName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        </div>

        {/* Learning Days */}
        <div className="day-list-learningpath">
          {loading ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>
          ) : learningDays.length > 0 ? (
            learningDays.map((day, i) => (
              <div key={i} className="day-card-learningpath">
                <h3>{day.day}</h3>
                {Array.isArray(day.tasks) && day.tasks.length > 0 ? (
                  day.tasks.map((task, index) => (
                    <div key={index} className="task-item-learningpath">
                      <div className="task-info">
                        <span className="task-title">{task.title}</span>
                        <span className="skill-text">{task.skill}</span>
                        <span className="progress-text">{task.progress}</span>
                      </div>
                      <div className="progress-bar-learningpath">
                        <div
                          className="progress-fill-learningpath"
                          style={{ width: `${(task.progress / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No tasks for this day</p>
                )}
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No learning path data found.
            </p>
          )}
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
