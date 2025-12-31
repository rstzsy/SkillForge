import * as XLSX from "xlsx";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase/config";
import "../AdminListen/AdminAddListen.css";

const AdminAddRead = () => {
  const storage = getStorage(app);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    section: "",
    title: "",
    type: "",
    image: null,
    imageURL: "",
    passage: "",
    contentText: "",
    correctAnswer: "",
    timeLimit: "",
    file: null,
  });

  // handle change
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

  // download template
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // SHEET 1: TASKS
    const tasksSheet = XLSX.utils.aoa_to_sheet([
      [
        "taskId",
        "section",
        "title",
        "type",
        "passageText",
        "passage",
        "timeLimit",
      ],
      [
        1,
        "Section 1",
        "Sample Reading",
        "Multiple Choice",
        "This is the passage text...",
        "",
        30,
      ],
    ]);

    // SHEET 2: MULTIPLE CHOICE
    const mcqSheet = XLSX.utils.aoa_to_sheet([
      [
        "taskId",
        "question",
        "optionA",
        "optionB",
        "optionC",
        "optionD",
        "correct",
      ],
      [
        1,
        "What is the main idea?",
        "Choice A",
        "Choice B",
        "Choice C",
        "Choice D",
        "A",
      ],
      [
        1,
        "Why did the event happen?",
        "Option A",
        "Option B",
        "Option C",
        "Option D",
        "C",
      ],
    ]);

    // SHEET 3: BLANKS
    const blanksSheet = XLSX.utils.aoa_to_sheet([
      ["taskId", "blankId", "correctAnswer"],
      [1, 1, "answer1"],
      [1, 2, "answer2"],
    ]);

    XLSX.utils.book_append_sheet(wb, tasksSheet, "Tasks");
    XLSX.utils.book_append_sheet(wb, mcqSheet, "MultipleChoice");
    XLSX.utils.book_append_sheet(wb, blanksSheet, "Blanks");

    XLSX.writeFile(wb, "reading_template.xlsx");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      section: formData.section,
      title: formData.title,
      type: formData.type,
      imageURL: formData.imageURL || "",
      passage: formData.passage,
      content: formData.contentText,
      correctAnswer: formData.correctAnswer,
      timeLimit: formData.timeLimit,
    };

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      alert("New Reading Task Added!");
      navigate("/admin/practice_reading");
    } catch (err) {
      console.error(err);
      alert("Failed to add reading task!");
    }
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
          <option value="Test">Test</option>
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
          <option value="Matching Headings">Matching Headings</option>
          <option value="True/False">True/False</option>
          <option value="Multiple Choice">Multiple Choice</option>
        </select>

        {/* Image */}
        <label>Image (optional)</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        {/* Passage */}
        <label>Passage (Main Reading Text)</label>
        <textarea
          name="passage"
          placeholder="Enter the full passage here..."
          value={formData.passage}
          onChange={handleChange}
        />

        {/* Content */}
        <label>Content Passage (Questions, Instructions...)</label>
        <textarea
          name="contentText"
          placeholder="Enter passage or question content..."
          value={formData.contentText}
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

        {/* Buttons */}
        <div className="addlisten-buttons">
          <button
            type="button"
            className="addlisten-btn"
            style={{ marginRight: "10px" }}
            onClick={handleDownloadTemplate}
          >
            Download Excel Template
          </button>

          <button type="submit" className="addlisten-btn">
            Save Task
          </button>

          {/* note */}
          <small style={{ display: "block", color: "#555", marginTop: "4px" }}>
            If you choose type is Multiple Choice, please delete Blank Sheet in file excel
          </small>
        </div>
      </form>
    </div>
  );
};

export default AdminAddRead;
