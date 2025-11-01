import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const AdminEditSpeak = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    section: "",
    topic: "",
    type: "",
    time_limit: 2,
    questions: [""],
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Lấy dữ liệu Speaking theo ID từ Firestore
  useEffect(() => {
    const fetchSpeaking = async () => {
      try {
        const res = await fetch(`http://localhost:3002/api/speaking`);
        const data = await res.json();

        // tìm theo speaking_practices_id
        const found = data.find(
          (item) => item.speaking_practices_id === id
        );

        if (found) {
          setFormData({
            section: found.section || "",
            topic: found.topic || "",
            type: found.type || "",
            time_limit: found.time_limit || 2,
            questions: found.questions?.map((q) => q.question_text) || [""],
          });
        } else {
          alert("Speaking topic not found!");
          navigate("/admin/practice_speaking");
        }
      } catch (error) {
        console.error("❌ Error fetching speaking topic:", error);
        alert("Failed to load speaking topic.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpeaking();
  }, [id, navigate]);

  // 🔹 Cập nhật form input cơ bản
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Cập nhật nội dung câu hỏi
  const handleQuestionChange = (index, value) => {
    const updated = [...formData.questions];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, questions: updated }));
  };

  // 🔹 Thêm câu hỏi
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }));
  };

  // 🔹 Xóa câu hỏi
  const handleRemoveQuestion = (index) => {
    const updated = [...formData.questions];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, questions: updated }));
  };

  // 🔹 Gửi cập nhật lên Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3002/api/speaking/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Speaking topic updated successfully!");
        navigate("/admin/practice_speaking");
      } else {
        alert("❌ Failed to update: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error updating speaking:", error);
      alert("Failed to update speaking topic.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Edit Speaking Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
        {/* Part */}
        <label>Part</label>
        <select
          name="section"
          value={formData.section}
          onChange={handleChange}
          required
        >
          <option value="">Select Part</option>
          <option value="Part 1">Part 1</option>
          <option value="Part 2">Part 2</option>
          <option value="Part 3">Part 3</option>
        </select>

        {/* Topic */}
        <label>Topic</label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder="Enter topic title"
          required
        />

        {/* Type */}
        <label>Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="General">General</option>
          <option value="Cue Card">Cue Card</option>
          <option value="Discussion">Discussion</option>
        </select>

        {/* Questions */}
        <label>Questions</label>
        {formData.questions.map((q, index) => (
          <div key={index} style={{ display: "flex", gap: "10px" }}>
            <textarea
              placeholder={`Question ${index + 1}`}
              value={q}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              required
            />
            {formData.questions.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveQuestion(index)}
                style={{
                  background: "#ffe6e6",
                  border: "none",
                  color: "#d9534f",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="addlisten-btn"
          style={{
            background: "#fff8d0",
            color: "#d5a30a",
            width: "fit-content",
            alignSelf: "flex-start",
          }}
        >
          + Add Question
        </button>

        {/* Time limit */}
        <label>Time Limit (minutes)</label>
        <input
          type="number"
          name="time_limit"
          value={formData.time_limit}
          onChange={handleChange}
          min="1"
          max="5"
        />

        {/* Submit */}
        <button type="submit" className="addlisten-btn">
          Update Speaking Task
        </button>
      </form>
    </div>
  );
};

export default AdminEditSpeak;
