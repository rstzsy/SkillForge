import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const AdminAddSpeak = () => {
  const [formData, setFormData] = useState({
    part: "",
    topic: "",
    type: "",
    image: "",
    questions: [""],
  });

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Thêm câu hỏi mới
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }));
  };

  // Xóa câu hỏi
  const handleRemoveQuestion = (index) => {
    const updated = [...formData.questions];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, questions: updated }));
  };

  // Sửa nội dung câu hỏi
  const handleQuestionChange = (index, value) => {
    const updated = [...formData.questions];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, questions: updated }));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Speaking Task:", formData);
    alert("Speaking task added successfully!");
    // Bạn có thể gọi API POST tại đây để lưu vào DB
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

        {/* Image */}
        <label>Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        {formData.image && typeof formData.image === "string" && (
          <img
            src={formData.image}
            alt="preview"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "10px",
              marginTop: "10px",
              objectFit: "cover",
              border: "1px solid #ddd",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          />
        )}

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
