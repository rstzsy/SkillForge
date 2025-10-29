import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const AdminAddWrite = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    section: "",
    title: "",
    type: "",
    question_text: "",
    image_url: "",
    time_limit: "",
    attempts: 0,
    status: "Not Started",
  });
  const [uploading, setUploading] = useState(false);

  // Upload ảnh (nếu có)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `writing_images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData((prev) => ({ ...prev, image_url: url }));
      alert("✅ Image uploaded successfully!");
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Gửi form thêm mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "writing_practices"), {
        ...formData,
        created_at: serverTimestamp(),
      });
      alert("✅ Writing task added!");
      navigate("/admin/practice_writing");
    } catch (error) {
      console.error("❌ Add failed:", error);
      alert("Failed to add writing task.");
    }
  };

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Add Writing Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
        <label>Section</label>
        <select
          name="section"
          value={formData.section}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, section: e.target.value }))
          }
        >
          <option value="">Select Section</option>
          <option value="Task 1">Task 1</option>
          <option value="Task 2">Task 2</option>
        </select>

        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <label>Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, type: e.target.value }))
          }
        >
          <option value="">Select Type</option>
          <option value="Academic">Academic</option>
          <option value="Essay">Essay</option>
        </select>

        <label>Question Text</label>
        <textarea
          name="question_text"
          value={formData.question_text}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, question_text: e.target.value }))
          }
        />

        {/* Ẩn upload ảnh nếu là Task 2 */}
        {formData.section !== "Task 2" && (
          <>
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {uploading ? (
              <p>Uploading image...</p>
            ) : (
              formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  width="150"
                  style={{ marginTop: "10px", borderRadius: "8px" }}
                />
              )
            )}
          </>
        )}

        <label>Time Limit (minutes)</label>
        <input
          type="number"
          name="time_limit"
          value={formData.time_limit}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, time_limit: e.target.value }))
          }
        />

        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="Not Started">Not Started</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>

        <button type="submit" className="addlisten-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Add Writing Task"}
        </button>
      </form>
    </div>
  );
};

export default AdminAddWrite;
