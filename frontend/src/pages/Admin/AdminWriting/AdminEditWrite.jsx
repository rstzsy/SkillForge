import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../firebase/config"; // ✅ dùng storage từ config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminAddListen.css";

const AdminEditWrite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    section: "",
    title: "",
    type: "",
    question_text: "",
    image_url: "",
    time_limit: "",
    attempts: 0,
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 🔹 Lấy dữ liệu từ Firestore
  useEffect(() => {
    const fetchWriting = async () => {
      try {
        const docRef = doc(db, "writing_practices", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          alert("Writing task not found");
          navigate("/admin/practice_writing");
        }
      } catch (error) {
        console.error("❌ Error fetching writing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWriting();
  }, [id, navigate]);

  // 🔹 Upload ảnh lên Firebase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `writing_images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData((prev) => ({ ...prev, image_url: downloadURL }));
      alert("✅ Image uploaded successfully!");
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Cập nhật Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "writing_practices", id);
      await updateDoc(docRef, { ...formData, updated_at: serverTimestamp() });
      alert("✅ Writing task updated successfully!");
      navigate("/admin/practice_writing");
    } catch (error) {
      console.error("❌ Error updating writing:", error);
      alert("Failed to update writing task.");
    }
  };

  if (loading) return <p>Loading writing task...</p>;

  return (
    <div className="addlisten-container">
      <AdminHeader />
      <h1 className="addlisten-title">Edit Writing Task</h1>

      <form className="addlisten-form" onSubmit={handleSubmit}>
        <label>Section</label>
        <select name="section" value={formData.section} onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}>
          <option value="">Select Section</option>
          <option value="Task 1">Task 1</option>
          <option value="Task 2">Task 2</option>
          <option value="Test">Test</option>
        </select>

        <label>Title</label>
        <input type="text" name="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />

        <label>Type</label>
        <select name="type" value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}>
          <option value="">Select Type</option>
          <option value="Academic">Academic</option>
          <option value="Essay">Essay</option>
          <option value="Line Graph">Line Graph</option>
          <option value="Process">Process</option>
          <option value="Table">Table</option>
          <option value="Pie Chart">Pie Chart</option>
          <option value="Bar Chart">Bar Chart</option>
          <option value="Pie Chart">Mixed Graph</option>
        </select>

        <label>Question Text</label>
        <textarea name="question_text" value={formData.question_text} onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))} />

        <label>Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {uploading ? <p>Uploading image...</p> : formData.image_url && (
          <img src={formData.image_url} alt="Preview" width="150" style={{ marginTop: "10px", borderRadius: "8px" }} />
        )}

        <label>Time Limit (minutes)</label>
        <input type="number" name="time_limit" value={formData.time_limit} onChange={(e) => setFormData(prev => ({ ...prev, time_limit: e.target.value }))} />

        <label>Status</label>
        <select name="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
          <option value="Not Started">Not Started</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>

        <button type="submit" className="addlisten-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Update Writing Task"}
        </button>
      </form>
    </div>
  );
};

export default AdminEditWrite;
