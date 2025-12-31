import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase/config"; // import storage from config Firebase
import "./AdminAddListen.css";

const AdminEditListen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    section: "",
    title: "",
    type: "",
    image: null,
    imageURL: "",
    content: "",
    correctAnswer: "",
    audio: null,
    audioURL: "",
    timeLimit: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch lesson from backend
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`https://skillforge-99ct.onrender.com/api/listening/${id}`);
        if (!res.ok) throw new Error("Failed to fetch lesson");
        const data = await res.json();
        const lesson = data.data; // backend return { data: lesson }

        setFormData({
          section: lesson.section || "",
          title: lesson.title || "",
          type: lesson.type || "",
          image: null,
          imageURL: lesson.image_url || "",
          content: lesson.content_text || "",
          correctAnswer: lesson.correct_answer || "",
          audio: null,
          audioURL: lesson.audio_url || "",
          timeLimit: lesson.time_limit || "",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error loading lesson data");
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];

      if (
        name === "file" &&
        (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))
      ) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // read sheet "Tasks" hoặc first sheet 
          const tasksSheet =
            workbook.Sheets["Tasks"] || workbook.Sheets[workbook.SheetNames[0]];
          const tasksJson = XLSX.utils.sheet_to_json(tasksSheet);

          // read sheet "Blanks" neu co
          const blanksSheet = workbook.Sheets["Blanks"];
          const blanksJson = blanksSheet
            ? XLSX.utils.sheet_to_json(blanksSheet)
            : [];

          if (tasksJson.length > 0) {
            const task = tasksJson[0];

            const blanksForTask = blanksJson.filter(
              (b) => b.taskId === task.taskId
            );
            const correctAnswersStr = blanksForTask
              .map((b) => b.correctAnswer)
              .join(", ");

            setFormData((prev) => ({
              ...prev,
              section: task.section || "",
              title: task.title || "",
              type: task.type || "",
              content: task.passage || "",
              timeLimit: task.timeLimit || "",
              correctAnswer: correctAnswersStr,
              file, 
            }));
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (name === "image" || name === "audio") {
        // Upload image/audio up Firebase
        const folder = name === "image" ? "images" : "audios";
        const fileName = `${Date.now()}_${file.name}`;
        const fileRef = ref(storage, `${folder}/${fileName}`);

        uploadBytes(fileRef, file)
          .then(() => getDownloadURL(fileRef))
          .then((url) => {
            setFormData((prev) => ({
              ...prev,
              [name]: file,
              [`${name}URL`]: url,
            }));
          })
          .catch((err) => {
            console.error(`Upload ${name} failed:`, err);
            alert(`Upload ${name} failed!`);
          });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // Append fields
      Object.entries(formData).forEach(([key, val]) => {
        if (val) data.append(key, val);
      });

      const res = await fetch(`https://skillforge-99ct.onrender.com/api/listening/${id}`, {
        method: "PUT",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      alert("Lesson updated successfully!");
      navigate("/admin/practice_listening");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update lesson");
    }
  };

  if (loading) return <p>Loading lesson data...</p>;

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Edit Listening Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
        {/* Section */}
        <label>Section</label>
        <select name="section" value={formData.section} onChange={handleChange}>
          <option value="">Select Section</option>
          <option value="Section 1">Section 1</option>
          <option value="Section 2">Section 2</option>
          <option value="Section 3">Section 3</option>
          <option value="Section 4">Section 4</option>
          <option value="Test">Test</option>
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
          <option value="Filling">Filling</option>
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
        {formData.imageURL && (
          <img
            src={formData.imageURL}
            alt="preview"
            width="120"
            style={{ marginTop: "10px", borderRadius: "8px" }}
          />
        )}

        {/* Content */}
        <label>Content Passage</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
        />
        <p className="addlisten-or">OR</p>
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
        />

        {/* Correct Answer */}
        <label>Correct Answer</label>
        <input
          type="text"
          name="correctAnswer"
          value={formData.correctAnswer}
          onChange={handleChange}
        />

        {/* Audio */}
        <label>Audio</label>
        <input
          type="file"
          name="audio"
          accept="audio/*"
          onChange={handleChange}
        />
        {formData.audioURL && (
          <audio
            controls
            src={formData.audioURL}
            style={{ marginTop: "10px" }}
          />
        )}

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

        <button type="submit" className="addlisten-btn">
          Update Task
        </button>
      </form>
    </div>
  );
};

export default AdminEditListen;
