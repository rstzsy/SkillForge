import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./AdminPersonalAim.css";

const AdminPersonalAim = () => {
  const [userGoals, setUserGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUserGoals = async () => {
      try {
        const res = await fetch(`http://localhost:3002/api/goals/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user goal");
        const data = await res.json();

        setUserGoals(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Error loading goal:", err);
      }
    };

    if (id) fetchUserGoals();
  }, [id]);

  const handleDelete = async (goalId, email) => {
    const confirmDelete = window.confirm(`Remove goal for ${email}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3002/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete goal");
      alert(`Goal for ${email} has been removed.`);

      setUserGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (err) {
      console.error("Error deleting goal:", err);
      alert("Error deleting goal. Please try again.");
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
                  <th>Current Band</th> {/* ✅ Thêm cột này */}
                  <th>Target Band</th>
                  <th>Target Date</th>
                  <th>Priority Skills</th>
                  <th>Notes</th>
                  <th>Saved At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userGoals.map((goal, idx) => (
                  <tr key={idx}>
                    <td>{goal.name}</td>
                    <td>{goal.email}</td>
                    <td>{goal.current_band || "—"}</td> {/* ✅ Hiển thị current_band */}
                    <td>{goal.target_band}</td>
                    <td>{goal.target_date}</td>
                    <td>
                      {Array.isArray(goal.priority_skills)
                        ? goal.priority_skills.join(", ")
                        : goal.priority_skills}
                    </td>
                    <td>{goal.notes}</td>
                    <td>{new Date(goal.saved_at).toLocaleString()}</td>
                    <td className="control-buttons-usermanage">
                      <button
                        className="btn-learningpath-usermanage"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        View
                      </button>
                      <button
                        className="btn-update-usermanage"
                        onClick={() => handleDelete(goal.id, goal.email)}
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

        {/* 🪟 Modal chi tiết */}
        {selectedGoal && (
          <div className="admin-aim-modal">
            <div className="admin-aim-modal-content">
              <h3 className="modal-title">User Goal Detail</h3>
              <p><strong>Name:</strong> {selectedGoal.name}</p>
              <p><strong>Email:</strong> {selectedGoal.email}</p>
              <p><strong>Current Band:</strong> {selectedGoal.current_band || "—"}</p> {/* ✅ Hiển thị trong modal */}
              <p><strong>Target Band:</strong> {selectedGoal.target_band}</p>
              <p><strong>Target Date:</strong> {selectedGoal.target_date}</p>
              <p>
                <strong>Priority Skills:</strong>{" "}
                {Array.isArray(selectedGoal.priority_skills)
                  ? selectedGoal.priority_skills.join(", ")
                  : selectedGoal.priority_skills}
              </p>
              <p><strong>Notes:</strong> {selectedGoal.notes || "—"}</p>
              <p>
                <strong>Saved At:</strong>{" "}
                {new Date(selectedGoal.saved_at).toLocaleString()}
              </p>

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
