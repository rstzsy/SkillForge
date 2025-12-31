import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./AdminListen.css";

const AdminListen = () => {
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  // --- Fetch data from backend ---
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch("https://skillforge-99ct.onrender.com/api/listening");
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch lessons");

        // backend send data array
        setLessons(data.data || []);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        alert("Error fetching listening practices. See console for details.");
      }
    };

    fetchLessons();
  }, []);

  const filteredLessons = lessons.filter((lesson) => {
    return (
      lesson.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterSection ? lesson.section === filterSection : true) &&
      (filterType ? lesson.type === filterType : true)
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const res = await fetch(`https://skillforge-99ct.onrender.com/api/listening/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete");

      // update after delete successfully
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
      alert("Lesson deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete lesson. See console for details.");
    }
  };

  return (
    <div className="lesson-container-listenadmin">
      <AdminHeader />
      <h1 className="lesson-title-listenadmin">Manage Listening Practices</h1>

      {/* filter */}
      <div className="lesson-filter-listenadmin">
        <input
          type="text"
          placeholder="Search title..."
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
          <option value="Section 1">Section 1</option>
          <option value="Section 2">Section 2</option>
          <option value="Section 3">Section 3</option>
          <option value="Section 4">Section 4</option>
          <option value="Test">Test</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Types</option>
          <option value="Gap Filling">Gap Filling</option>
          <option value="Map">Map</option>
          <option value="Filling">Filling</option>
          <option value="True/False">True/False</option>
        </select>
      </div>

      {/* task list */}
      <div className="lesson-grid-listenadmin">
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card-listenadmin">
            <img
              src={lesson.image_url || "/assets/listpic.jpg"}
              alt={lesson.title}
              className="lesson-image-listenadmin"
            />

            <span className="lesson-section-badge-listenadmin">
              {lesson.section}
            </span>

            <h2 className="lesson-card-title-listenadmin">{lesson.title}</h2>

            <p className="lesson-type-listenadmin">{lesson.type}</p>

            <p className="lesson-attempts-listenadmin">
              {lesson.attempts || 0} attempts
            </p>

            <div className="lesson-control-listenadmin">
              <button
                className="lesson-btn-edit-listenadmin"
                onClick={() =>
                  navigate(`/admin/practice_listening/edit/${lesson.id}`)
                }
              >
                <FontAwesomeIcon icon={faPen} size="sm" />
              </button>
              <button
                className="lesson-btn-delete-listenadmin"
                onClick={() => handleDelete(lesson.id)}
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="lesson-btn-add-listadmin"
        onClick={() => navigate("/admin/practice_listening/add")}
      >
        Add Task
      </button>
    </div>
  );
};

export default AdminListen;
