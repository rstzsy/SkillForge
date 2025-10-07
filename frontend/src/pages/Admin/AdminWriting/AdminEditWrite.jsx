import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const mockWriteData = [
  {
    id: 1,
    title: "Describing Bar Chart - Global Internet Users",
    section: "Task 1",
    type: "Academic",
    questionText:
      "The chart below shows the percentage of internet users in different regions between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/assets/listpic.jpg",
    timeLimit: 40,
  },
  {
    id: 2,
    title: "Agree or Disagree - Technology and Education",
    section: "Task 2",
    type: "Essay",
    questionText:
      "Some people believe that technology has made education more accessible and effective, while others disagree. Discuss both views and give your opinion.",
    image: "/assets/listpic.jpg",
    timeLimit: 45,
  },
];

const AdminEditWrite = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    section: "Task 1",
    type: "Academic",
    questionText: "",
    image: "",
    timeLimit: 40,
  });

  // 🔹 Load dữ liệu bài viết theo ID
  useEffect(() => {
    const found = mockWriteData.find((item) => item.id === Number(id));
    if (found) setForm(found);
    else alert("Writing task not found!");
  }, [id]);

  // 🔹 Xử lý khi thay đổi input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🔹 Lưu thay đổi
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated writing task:", form);
    alert("Writing task updated successfully!");
    navigate("/admin/practice_writing");
  };

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Edit Writing Practice</h1>

      <form onSubmit={handleSubmit} className="addlisten-form">
        {/* Title */}
        <div>
          <label>Task Title</label>
          <input
            type="text"
            name="title"
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
            value={form.questionText}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Image */}
        <label>Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        {form.image && typeof form.image === "string" && (
          <img
            src={form.image}
            alt="preview"
            style={{
              marginTop: "10px",
              width: "120px",
              borderRadius: "8px",
            }}
          />
        )}

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

        {/* Save Button */}
        <button type="submit" className="addlisten-btn">
          Update Writing Task
        </button>
      </form>
    </div>
  );
};

export default AdminEditWrite;
