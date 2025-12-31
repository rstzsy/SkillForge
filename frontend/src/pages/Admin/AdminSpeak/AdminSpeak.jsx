import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faUpload,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "../AdminListen/AdminListen.css";

const AdminSpeak = () => {
  const [speakings, setSpeakings] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const navigate = useNavigate();

  // ✅ Lấy dữ liệu Speaking từ backend
  useEffect(() => {
    fetchSpeakings();
  }, []);

  const fetchSpeakings = async () => {
    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/speaking");
      const data = await res.json();
      setSpeakings(data);
      console.log("🔥 Loaded speakings:", data);
    } catch (error) {
      console.error("❌ Error fetching speaking:", error);
    }
  };

  // ✅ Lọc dữ liệu theo search + section
  const filteredSpeakings = speakings.filter((item) => {
    return (
      item.topic?.toLowerCase().includes(search.toLowerCase()) &&
      (filterSection ? item.section === filterSection : true)
    );
  });

  // ✅ Xóa Speaking
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this speaking topic?")) {
      try {
        const res = await fetch(`https://skillforge-99ct.onrender.com/api/speaking/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();

        if (result.success) {
          alert("✅ Deleted successfully");
          setSpeakings((prev) =>
            prev.filter((item) => item.speaking_practices_id !== id)
          );
        } else {
          alert(result.message || "Failed to delete");
        }
      } catch (error) {
        console.error("❌ Delete error:", error);
        alert("Failed to delete speaking topic");
      }
    }
  };

  // ✅ Upload file Excel và import
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/speaking/import-excel", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      alert(result.message || "Import completed");

      await fetchSpeakings(); // Reload lại dữ liệu
    } catch (error) {
      console.error("❌ Import error:", error);
      alert("Failed to import Excel file");
    }
  };

  return (
    <div className="lesson-container-listenadmin">
      <AdminHeader />
      <h1 className="lesson-title-listenadmin">
        <FontAwesomeIcon icon={faMicrophone} /> Manage Speaking Practices
      </h1>

      {/* Bộ lọc + Upload */}
      <div className="lesson-filter-listenadmin">
        <input
          type="text"
          placeholder="Search topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lesson-search-listenadmin"
        />

        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Sections</option>
          <option value="Part 1">Part 1</option>
          <option value="Part 2">Part 2</option>
          <option value="Part 3">Part 3</option>
          <option value="Full Test">Full Test</option>
        </select>

        {/* Upload button */}
        <label className="lesson-upload-label-listenadmin">
          <FontAwesomeIcon icon={faUpload} /> Upload Excel
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Danh sách Speaking */}
      <div className="lesson-grid-listenadmin">
        {filteredSpeakings.length > 0 ? (
          filteredSpeakings.map((item) => (
            <div
              key={item.speaking_practices_id}
              className="lesson-card-listenadmin"
            >
              <img
                src={"/assets/listpic.jpg"}
                alt={item.topic}
                className="lesson-image-listenadmin"
              />
              <span className="lesson-section-badge-listenadmin">
                {item.section}
              </span>
              <h2 className="lesson-card-title-listenadmin">{item.topic}</h2>
              <p className="lesson-type-listenadmin">{item.type}</p>
              <p className="lesson-attempts-listenadmin">
                {item.questions?.length || 0} questions
              </p>

              <div className="lesson-control-listenadmin">
                <button
                  className="lesson-btn-edit-listenadmin"
                  onClick={() =>
                    navigate(
                      `/admin/practice_speaking/edit/${item.speaking_practices_id}`
                    )
                  }
                >
                  <FontAwesomeIcon icon={faPen} size="sm" />
                </button>
                <button
                  className="lesson-btn-delete-listenadmin"
                  onClick={() => handleDelete(item.speaking_practices_id)}
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center w-full text-gray-500 mt-8">
            No speaking topics found.
          </p>
        )}
      </div>

      {/* Nút thêm */}
      <button
        className="lesson-btn-add-listadmin"
        onClick={() => navigate("/admin/practice_speaking/add")}
      >
        Add Speaking Topic
      </button>
    </div>
  );
};

export default AdminSpeak;