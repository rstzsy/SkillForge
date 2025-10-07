import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

// 🔹 Mock dữ liệu Speaking sample
const mockSpeakData = [
  {
    id: 1,
    title: "Describe a memorable trip you have taken",
    part: "Part 2",
    topicType: "Cue Card",
    questionText:
      "Describe a memorable trip you have taken. You should say where you went, who you went with, what you did there, and explain why it was memorable.",
    image: "/assets/listpic.jpg",
    timeLimit: 2, // phút nói
  },
  {
    id: 2,
    title: "Talking about Hobbies and Free Time",
    part: "Part 1",
    topicType: "General",
    questionText:
      "Do you enjoy your free time activities? What kind of hobbies do you usually do? How often do you spend time on them?",
    image: "/assets/listpic.jpg",
    timeLimit: 1,
  },
];

const AdminEditSpeak = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    part: "Part 1",
    topicType: "General",
    questionText: "",
    image: "",
    timeLimit: 1,
  });

  // 🔹 Load dữ liệu theo ID
  useEffect(() => {
    const found = mockSpeakData.find((item) => item.id === Number(id));
    if (found) setForm(found);
    else alert("Speaking task not found!");
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

  // 🔹 Submit update
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated speaking task:", form);
    alert("Speaking task updated successfully!");
    navigate("/admin/practice_speaking");
  };

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Edit Speaking Practice</h1>

      <form onSubmit={handleSubmit} className="addlisten-form">
        {/* Title */}
        <div>
          <label>Topic Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Part */}
        <div>
          <label>Speaking Part</label>
          <select name="part" value={form.part} onChange={handleChange}>
            <option value="Part 1">Part 1</option>
            <option value="Part 2">Part 2</option>
            <option value="Part 3">Part 3</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label>Topic Type</label>
          <select
            name="topicType"
            value={form.topicType}
            onChange={handleChange}
          >
            <option value="General">General</option>
            <option value="Cue Card">Cue Card</option>
            <option value="Discussion">Discussion</option>
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
            min="1"
            max="5"
            value={form.timeLimit}
            onChange={handleChange}
          />
        </div>

        {/* Save Button */}
        <button type="submit" className="addlisten-btn">
          Update Speaking Task
        </button>
      </form>
    </div>
  );
};

export default AdminEditSpeak;
