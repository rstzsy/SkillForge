import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const AdminAddWrite = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    section: "Task 1",
    type: "Academic",
    questionText: "",
    image: "",
    timeLimit: 40, // phút
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Ở đây bạn có thể thêm API POST sau khi có backend
    console.log("Writing task added:", form);
    alert("New Writing Task has been added!");
    navigate("/admin/practice_writing");
  };

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Add New Writing Practice</h1>

      <form onSubmit={handleSubmit} className="addlisten-form">
        {/* Title */}
        <div>
          <label>Task Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Describing Bar Chart - Internet Users"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Section */}
        <div>
          <label>Section</label>
          <select name="section" value={form.section} onChange={handleChange}>
            <option value="Task 1">Task 1</option>
            <option value="Task 2">Task 2</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="Academic">Academic</option>
            <option value="Essay">Essay</option>
            <option value="General Training">General Training</option>
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label>Question Description</label>
          <textarea
            name="questionText"
            placeholder="Write the IELTS question or description here..."
            value={form.questionText}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Optional Image */}
        <div>
          <label>Question Image (optional)</label>
          <input
            type="text"
            name="image"
            placeholder="e.g., /assets/bargraph.png"
            value={form.image}
            onChange={handleChange}
          />
          <p className="addlisten-or">or upload image below</p>
          <input type="file" accept="image/*" />
        </div>

        {/* Time Limit */}
        <div>
          <label>Time Limit (minutes)</label>
          <input
            type="number"
            name="timeLimit"
            min="10"
            max="90"
            value={form.timeLimit}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="addlisten-btn">
          Save Writing Task
        </button>
      </form>
    </div>
  );
};

export default AdminAddWrite;
