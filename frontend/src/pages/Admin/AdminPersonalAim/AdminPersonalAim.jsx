import React, { useState, useEffect } from "react";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./AdminPersonalAim.css";

const AdminPersonalAim = () => {
  const [userGoals, setUserGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // ✅ Lấy dữ liệu mock từ localStorage (hoặc API trong tương lai)
  useEffect(() => {
    const raw = localStorage.getItem("userGoal");
    if (raw) {
      setUserGoals([JSON.parse(raw)]);
    }
  }, []);

  const handleDelete = (email) => {
    const confirmDelete = window.confirm(`Remove goal for ${email}?`);
    if (confirmDelete) {
      localStorage.removeItem("userGoal");
      setUserGoals([]);
    }
  };

  return (
    <div className="admin-container-usermanage">
      <AdminHeader />

      <div className="main-content-usermanage">
        <h2 className="page-title-usermanage">🎯 Manage Personal Goals</h2>

        <div className="user-table-wrapper-usermanage">
          {userGoals.length === 0 ? (
            <p className="no-goal-text">No user goals found.</p>
          ) : (
            <table className="user-table-usermanage">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Target Band</th>
                  <th>Target Date</th>
                  <th>Priority Skills</th>
                  <th>Saved At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userGoals.map((goal, idx) => (
                  <tr key={idx}>
                    <td>{goal.name}</td>
                    <td>{goal.email}</td>
                    <td>{goal.targetBand}</td>
                    <td>{goal.targetDate}</td>
                    <td>{goal.prioritySkills.join(", ")}</td>
                    <td>{new Date(goal.savedAt).toLocaleString()}</td>
                    <td className="control-buttons-usermanage">
                      <button
                        className="btn-learningpath-usermanage"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        View
                      </button>
                      <button
                        className="btn-update-usermanage"
                        onClick={() => handleDelete(goal.email)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal chi tiết */}
        {selectedGoal && (
          <div className="admin-aim-modal">
            <div className="admin-aim-modal-content">
              <h3 className="modal-title">User Goal Detail</h3>
              <p><strong>Name:</strong> {selectedGoal.name}</p>
              <p><strong>Email:</strong> {selectedGoal.email}</p>
              <p><strong>Target Band:</strong> {selectedGoal.targetBand}</p>
              <p><strong>Target Date:</strong> {selectedGoal.targetDate}</p>
              <p><strong>Priority Skills:</strong> {selectedGoal.prioritySkills.join(", ")}</p>
              <p><strong>Notes:</strong> {selectedGoal.notes || "—"}</p>
              <p><strong>Saved At:</strong> {new Date(selectedGoal.savedAt).toLocaleString()}</p>

              <button
                className="btn-back-usermanage"
                onClick={() => setSelectedGoal(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPersonalAim;
