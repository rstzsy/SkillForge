import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const AdminAddSpeak = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    part: "",
    topic: "",
    type: "",
    questions: [""],
  });

  // ✅ Hàm xử lý thay đổi input cơ bản
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Thêm câu hỏi mới
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }));
  };

  // ✅ Xóa câu hỏi
  const handleRemoveQuestion = (index) => {
    const updated = [...formData.questions];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, questions: updated }));
  };

  // ✅ Sửa nội dung câu hỏi
  const handleQuestionChange = (index, value) => {
    const updated = [...formData.questions];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, questions: updated }));
  };

  // ✅ Submit form để gọi API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: formData.part,
          topic: formData.topic,
          type: formData.type,
          time_limit: 2,
          questions: formData.questions,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert("✅ Speaking topic added successfully!");
        navigate("/admin/practice_speaking");
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("❌ Error adding speaking:", error);
      alert("Failed to add speaking topic.");
    }
  };

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Add New Speaking Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
        {/* Part */}
        <label>Part</label>
        <select
          name="part"
          value={formData.part}
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
          placeholder="Enter topic title (e.g. Describe your hometown)"
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

        {/* Submit */}
        <button type="submit" className="addlisten-btn">
          Save Speaking Task
        </button>
      </form>
    </div>
  );
};

export default AdminAddSpeak;
