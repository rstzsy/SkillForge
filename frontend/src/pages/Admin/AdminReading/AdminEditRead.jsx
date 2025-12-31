import * as XLSX from "xlsx";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase/config";
import "../AdminListen/AdminAddListen.css";

const storage = getStorage(app);

const AdminEditRead = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    section: "",
    title: "",
    type: "",
    image: null,
    imageURL: "",
    passage: "",
    content: "",
    correctAnswer: "",
    timeLimit: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReading = async () => {
      try {
        const res = await fetch(`https://skillforge-99ct.onrender.com/api/reading/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch reading");

        const r = data.data || data;
        setFormData({
          section: r.section || "",
          title: r.title || "",
          type: r.type || "",
          image: null,
          imageURL: r.image_url || "",
          passage: r.content || "",
          content: r.content_text || "",
          correctAnswer: r.correct_answer || "",
          timeLimit: r.time_limit || "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load reading task");
      } finally {
        setLoading(false);
      }
    };
    fetchReading();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];

      // Excel File
      if (
        name === "file" &&
        (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))
      ) {
        const reader = new FileReader();

        reader.onload = (evt) => {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Read Task Sheet
          const tasksSheet = workbook.Sheets["Tasks"];
          const tasksJson = tasksSheet
            ? XLSX.utils.sheet_to_json(tasksSheet)
            : [];

          // Read Blanks (Gap Filling)
          const blanksSheet = workbook.Sheets["Blanks"];
          const blanksJson = blanksSheet
            ? XLSX.utils.sheet_to_json(blanksSheet)
            : [];

          // Read MultipleChoice
          const mcqSheet = workbook.Sheets["MultipleChoice"];
          const mcqJson = mcqSheet ? XLSX.utils.sheet_to_json(mcqSheet) : [];

          if (tasksJson.length > 0) {
            const task = tasksJson[0];

            let contentFinal = task.passage || "";
            let correctAnsFinal = "";

            // GAP FILLING
            const blanksForTask = blanksJson.filter(
              (b) => b.taskId === task.taskId
            );
            if (blanksForTask.length > 0) {
              correctAnsFinal = blanksForTask
                .map((b) => b.correctAnswer)
                .join(", ");
            }

            // MULTIPLE CHOICE
            const mcqForTask = mcqJson.filter((q) => q.taskId === task.taskId);
            if (mcqForTask.length > 0) {
              let mcqText = "";

              mcqForTask.forEach((q, index) => {
                mcqText += `Question ${index + 1}: ${q.question}
  A. ${q.optionA}
  B. ${q.optionB}
  C. ${q.optionC}
  D. ${q.optionD}
  
  `;
              });

              contentFinal = mcqText;
              correctAnsFinal = mcqForTask.map((q) => q.correct).join(", ");
            }

            setFormData((prev) => ({
              ...prev,
              section: task.section || "",
              title: task.title || "",
              type: task.type || "",
              passage: task.passageText || "",
              contentText: contentFinal,
              timeLimit: task.timeLimit || "",
              correctAnswer: correctAnsFinal,
              file,
            }));
          }
        };

        reader.readAsArrayBuffer(file);
      }

      // Upload image
      else if (name === "image") {
        const folder = "reading_images";
        const fileName = `${Date.now()}_${file.name}`;
        const fileRef = ref(storage, `${folder}/${fileName}`);

        uploadBytes(fileRef, file)
          .then(() => getDownloadURL(fileRef))
          .then((url) => {
            setFormData((prev) => ({
              ...prev,
              image: file,
              imageURL: url,
            }));
          })
          .catch((err) => {
            console.error("Upload error:", err);
            alert("Image upload failed!");
          });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        section: formData.section,
        title: formData.title,
        type: formData.type,
        passage: formData.passage,
        content: formData.content,
        correctAnswer: formData.correctAnswer,
        timeLimit: formData.timeLimit,
        imageURL: formData.imageURL,
      };

      const res = await fetch(`https://skillforge-99ct.onrender.com/api/reading/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update");

      alert("Reading task updated!");
      navigate("/admin/practice_reading");
    } catch (err) {
      console.error(err);
      alert("Failed to update reading task");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Edit Reading Task</h1>

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
          <option value="Multiple Choice">Multiple Choice</option>
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

        {/* Passage */}
        <label>Content Passage</label>
        <textarea
          name="passage"
          value={formData.passage}
          onChange={handleChange}
          placeholder="Edit passage here..."
        />

        {/* Content */}
        <label>Content Text</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Edit content here..."
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

export default AdminEditRead;
