import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../AdminListen/AdminListen.css";

const lessonsData = [
  {
    id: 1,
    section: "Section 1",
    title: "Gap Filling - Daily Routine",
    type: "Gap Filling",
    image: "/assets/listpic.jpg",
    attempts: 120,
  },
  {
    id: 2,
    section: "Section 2",
    title: "Map Reading Task",
    type: "Map",
    image: "/assets/listpic.jpg",
    attempts: 95,
  },
  {
    id: 3,
    section: "Section 3",
    title: "Listening Practice Quiz",
    type: "True/False",
    image: "/assets/listpic.jpg",
    attempts: 75,
  },
  {
    id: 4,
    section: "Section 4",
    title: "Video - Grammar Explanation",
    type: "Filling",
    image: "/assets/listpic.jpg",
    attempts: 40,
  },
  {
    id: 5,
    section: "Section 1",
    title: "Audio Conversation",
    type: "Audio",
    image: "/assets/listpic.jpg",
    attempts: 60,
  },
];

const AdminRead = () => {
  const [lessons, setLessons] = useState(lessonsData);
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  const filteredLessons = lessons.filter((lesson) => {
    return (
      lesson.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterSection ? lesson.section === filterSection : true) &&
      (filterType ? lesson.type === filterType : true)
    );
  });

  // Hàm xoa bai
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setLessons(lessons.filter((lesson) => lesson.id !== id));
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

      {/* task list */}
      <div className="lesson-grid-listenadmin">
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card-listenadmin">
            <img
              src={lesson.image}
              alt={lesson.title}
              className="lesson-image-listenadmin"
            />

            {/* Section tag */}
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

            {/* Control buttons */}
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
        ))}
      </div>

      {/* add button */}
      <button
        className="lesson-btn-add-listadmin"
        onClick={() => navigate("/admin/practice_reading/add")}
      >
        Add Task
      </button>
    </div>
  );
};

export default AdminRead;
