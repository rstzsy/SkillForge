import * as XLSX from "xlsx";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase/config"; 
import "./AdminAddListen.css";

const storage = getStorage(app);

const AdminAddListen = () => {
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
    file: null, // dung de doc file excel
  });

  const navigate = useNavigate();

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

          const tasksSheet =
            workbook.Sheets["Tasks"] || workbook.Sheets[workbook.SheetNames[0]];
          const tasksJson = XLSX.utils.sheet_to_json(tasksSheet);

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
              file, // giu lai de doc file
            }));
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (name === "image" || name === "audio") {
        // Upload image/audio len storage ngay sau khi chon
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
      const data = {
        section: formData.section,
        title: formData.title,
        type: formData.type,
        content: formData.content,
        correctAnswer: formData.correctAnswer,
        timeLimit: formData.timeLimit,
        imageURL: formData.imageURL,
        audioURL: formData.audioURL,
      };

      const res = await fetch("https://skillforge-99ct.onrender.com/api/listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add task");

      alert("New Listening Task Added!");
      navigate("/admin/practice_listening");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add listening task. See console for details.");
    }
  };

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Add New Listening Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
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
          <option value="Section 4">Section 4</option>
          <option value="Test">Test</option>
        </select>

        <label>Title</label>
        <input
          type="text"
          name="title"
          placeholder="Enter title..."
          value={formData.title}
          onChange={handleChange}
          required
        />

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
          <option value="Filling">Filling</option>
          <option value="True/False">True/False</option>
        </select>

        <label>Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

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
          accept=".xlsx,.xls"
          onChange={handleChange}
        />

        {/* button download example */}
        <div style={{ marginBottom: "15px" }}>
          <a
            href="/assets/template/listening_template.xlsx"
            download
            className="addlisten-btn"
            style={{ display: "inline-block" }}
          >
            Download Excel Template
          </a>
        </div>

        <label>Correct Answer</label>
        <input
          type="text"
          name="correctAnswer"
          placeholder="Enter correct answer..."
          value={formData.correctAnswer}
          onChange={handleChange}
        />

        <label>Audio</label>
        <input
          type="file"
          name="audio"
          accept="audio/*"
          onChange={handleChange}
        />

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
          Save Task
        </button>
      </form>
    </div>
  );
};

export default AdminAddListen;
