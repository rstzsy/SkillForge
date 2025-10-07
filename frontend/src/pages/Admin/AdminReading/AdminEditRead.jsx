import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css"; 

const lessonsData = [
  { 
    id: 1,
    section: "Section 1",
    title: "Gap Filling - Daily Routine",
    type: "Gap Filling",
    image: "/assets/listpic.jpg",
    attempts: 120,
    content: "Passage about daily routine...",
    correctAnswer: "morning",
    timeLimit: "30"
  },
  { 
    id: 2,
    section: "Section 2",
    title: "Map Reading Task",
    type: "Map",
    image: "/assets/listpic.jpg",
    attempts: 95,
    content: "Instructions for map reading...",
    correctAnswer: "A-B-C",
    audio: "/assets/audio2.mp3",
    timeLimit: "45"
  },
  { 
    id: 3,
    section: "Section 3",
    title: "Listening Practice Quiz",
    type: "True/False",
    image: "/assets/listpic.jpg",
    attempts: 75,
    content: "Listen to the audio and answer True or False.",
    correctAnswer: "True",
    timeLimit: "45"
  },
  { 
    id: 4,
    section: "Section 1",
    title: "Audio Conversation",
    type: "Audio",
    image: "/assets/listpic.jpg",
    attempts: 60,
    content: "Listen to the conversation and answer the questions.",
    correctAnswer: "Yes",
    timeLimit: "45"
  }
];

const AdminEditListen = () => {
  const { id } = useParams(); 
  const lesson = lessonsData.find((item) => item.id === Number(id));

  const [formData, setFormData] = useState({
    section: "",
    title: "",
    type: "",
    image: "",
    content: "",
    correctAnswer: "",
    timeLimit: "",
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        section: lesson.section || "",
        title: lesson.title || "",
        type: lesson.type || "",
        image: lesson.image || "",
        content: lesson.content || "",
        correctAnswer: lesson.correctAnswer || "",
        timeLimit: lesson.timeLimit || "",
      });
    }
  }, [lesson]);
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
    console.log("Updated data: ", formData);
    alert("Lesson updated! (check console)");
  };

  if (!lesson) return <p>Lesson not found</p>;

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Edit Reading Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
        {/* Section */}
        <label>Section</label>
        <select name="section" value={formData.section} onChange={handleChange}>
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
          value={formData.title}
          onChange={handleChange}
        />

        {/* Type */}
        <label>Type</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="">Select Type</option>
          <option value="Gap Filling">Gap Filling</option>
          <option value="Map">Map</option>
          <option value="True/False">True/False</option>
        </select>

        {/* Image */}
        <label>Image</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        {formData.image && typeof formData.image === "string" && (
          <img src={formData.image} alt="preview" width="120" style={{ marginTop: "10px", borderRadius: "8px" }} />
        )}

        {/* Content */}
        <label>Content Passage</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Edit passage here..."
        />

        {/* Correct Answer */}
        <label>Correct Answer</label>
        <input
          type="text"
          name="correctAnswer"
          value={formData.correctAnswer}
          onChange={handleChange}
        />

        {/* Time Limit */}
        <label>Time Limit</label>
        <select name="timeLimit" value={formData.timeLimit} onChange={handleChange}>
          <option value="">Select Time</option>
          <option value="20">20 minutes</option>
          <option value="30">30 minutes</option>
          <option value="40">40 minutes</option>
          <option value="45">45 minutes</option>
        </select>

        {/* Submit */}
        <button type="submit" className="addlisten-btn" onClick={() => navigate("/admin/practice_reading")}>
          Update Task
        </button>
      </form>
    </div>
  );
};

export default AdminEditListen;
