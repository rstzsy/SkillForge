import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const AdminAddRead = () => {
  const [formData, setFormData] = useState({
    section: "",
    title: "",
    type: "",
    image: "",
    content: "",
    correctAnswer: "",
    timeLimit: "",
    file: null
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit data: ", formData);
    alert("New Reading Task Added!");
  };

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Add New Reading Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
        {/* Section */}
        <label>Section</label>
        <select
          name="section"
          value={formData.section}
          onChange={handleChange}
          required
        >
          <option value="">Select Section</option>
          <option value="Section 1">Section 1</option>
          <option value="Section 2">Section 2</option>
          <option value="Section 3">Section 3</option>
        </select>

        {/* Title */}
        <label>Title</label>
        <input
          type="text"
          name="title"
          placeholder="Enter title..."
          value={formData.title}
          onChange={handleChange}
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
          <option value="Gap Filling">Gap Filling</option>
          <option value="Map">Map</option>
          <option value="True/False">True/False</option>
        </select>

        {/* Image */}
        <label>Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        {/* Content */}
        <label>Content Passage</label>
        <textarea
          name="content"
          placeholder="Enter passage here..."
          value={formData.content}
          onChange={handleChange}
        />
        <p className="addlisten-or">OR</p>
        <input
          type="file"
          name="file"
          accept=".txt,.docx,.pdf"
          onChange={handleChange}
        />

        {/* Correct Answer */}
        <label>Correct Answer</label>
        <input
          type="text"
          name="correctAnswer"
          placeholder="Enter correct answer..."
          value={formData.correctAnswer}
          onChange={handleChange}
        />

        {/* Time Limit */}
        <label>Time Limit</label>
        <select
          name="timeLimit"
          value={formData.timeLimit}
          onChange={handleChange}
        >
          <option value="">Select Time</option>
          <option value="20">20 minutes</option>
          <option value="30">30 minutes</option>
          <option value="40">40 minutes</option>
          <option value="45">45 minutes</option>
        </select>

        {/* Submit */}
        <button type="submit" className="addlisten-btn" onClick={() => navigate("/admin/practice_reading")}>
          Save Task
        </button>
      </form>
    </div>
  );
};

export default AdminAddRead;
