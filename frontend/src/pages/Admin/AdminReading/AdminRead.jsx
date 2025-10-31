import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../AdminListen/AdminListen.css";

const AdminRead = () => {
  const [lessons, setLessons] = useState([]); // data from Firestore
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  // call api get list
  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/reading");
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch readings");

        const formatted = data.data.map((item) => ({
          id: item.id,
          section: item.section,
          title: item.title,
          type: item.type,
          image: item.image_url || "/assets/listpic.jpg",
          attempts: item.attempts || 0,
        }));

        setLessons(formatted);
      } catch (err) {
        console.error("Error loading reading practices:", err);
        alert("Failed to load reading practices.");
      }
    };

    fetchReadings();
  }, []);

  // filter and search
  const filteredLessons = lessons.filter((lesson) => {
    return (
      lesson.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterSection ? lesson.section === filterSection : true) &&
      (filterType ? lesson.type === filterType : true)
    );
  });

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reading task?"))
      return;

    try {
      const res = await fetch(`http://localhost:3002/api/reading/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
      alert("Reading task deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete reading task.");
    }
  };

  return (
    <div className="lesson-container-listenadmin">
      <AdminHeader />
      <h1 className="lesson-title-listenadmin">Manage Reading Practices</h1>

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
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Types</option>
          <option value="Gap Filling">Gap Filling</option>
          <option value="Map">Map</option>
          <option value="True/False">True/False</option>
        </select>
      </div>

      {/* list */}
      <div className="lesson-grid-listenadmin">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card-listenadmin">
              <img
                src={lesson.image}
                alt={lesson.title}
                className="lesson-image-listenadmin"
              />

              {/* Section */}
              <span className="lesson-section-badge-listenadmin">
                {lesson.section}
              </span>

              {/* Title */}
              <h2 className="lesson-card-title-listenadmin">{lesson.title}</h2>

              {/* Type */}
              <p className="lesson-type-listenadmin">{lesson.type}</p>

              {/* Attempts */}
              <p className="lesson-attempts-listenadmin">
                {lesson.attempts} attempts
              </p>

              {/* button */}
              <div className="lesson-control-listenadmin">
                <button
                  className="lesson-btn-edit-listenadmin"
                  onClick={() =>
                    navigate(`/admin/practice_reading/edit/${lesson.id}`)
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
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>
            No reading tasks found.
          </p>
        )}
      </div>

      {/* add button */}
      <button
        className="lesson-btn-add-listadmin"
        onClick={() => navigate("/admin/practice_reading/add")}
      >
        Add New Reading Task
      </button>
    </div>
  );
};

export default AdminRead;
