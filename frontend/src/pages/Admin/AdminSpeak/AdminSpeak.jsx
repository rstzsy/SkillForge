import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../AdminListen/AdminListen.css";

const speakingData = [
  {
    id: 1,
    part: "Part 1",
    topic: "Hometown and Work",
    type: "General",
    image: "/assets/listpic.jpg",
    attempts: 74,
  },
  {
    id: 2,
    part: "Part 1",
    topic: "Hobbies and Free Time",
    type: "General",
    image: "/assets/listpic.jpg",
    attempts: 60,
  },
  {
    id: 3,
    part: "Part 2",
    topic: "Describe a Place You Visited",
    type: "Cue Card",
    image: "/assets/listpic.jpg",
    attempts: 88,
  },
  {
    id: 4,
    part: "Part 3",
    topic: "Technology and Communication",
    type: "Discussion",
    image: "/assets/listpic.jpg",
    attempts: 91,
  },
  {
    id: 5,
    part: "Part 2",
    topic: "Describe a Memorable Meal",
    type: "Cue Card",
    image: "/assets/listpic.jpg",
    attempts: 54,
  },
];

const AdminSpeak = () => {
  const [speakingTasks, setSpeakingTasks] = useState(speakingData);
  const [search, setSearch] = useState("");
  const [filterPart, setFilterPart] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  // Lọc dữ liệu
  const filteredSpeaking = speakingTasks.filter((item) => {
    return (
      item.topic.toLowerCase().includes(search.toLowerCase()) &&
      (filterPart ? item.part === filterPart : true) &&
      (filterType ? item.type === filterType : true)
    );
  });

  // Xóa bài
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this speaking task?")) {
      setSpeakingTasks(speakingTasks.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="lesson-container-listenadmin">
      <AdminHeader />
      <h1 className="lesson-title-listenadmin">Manage Speaking Practices</h1>

      {/* Bộ lọc */}
      <div className="lesson-filter-listenadmin">
        <input
          type="text"
          placeholder="Search topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lesson-search-listenadmin"
        />

        <select
          value={filterPart}
          onChange={(e) => setFilterPart(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Parts</option>
          <option value="Part 1">Part 1</option>
          <option value="Part 2">Part 2</option>
          <option value="Part 3">Part 3</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Types</option>
          <option value="General">General</option>
          <option value="Cue Card">Cue Card</option>
          <option value="Discussion">Discussion</option>
        </select>
      </div>

      {/* Danh sách bài */}
      <div className="lesson-grid-listenadmin">
        {filteredSpeaking.map((item) => (
          <div key={item.id} className="lesson-card-listenadmin">
            <img
              src={item.image}
              alt={item.topic}
              className="lesson-image-listenadmin"
            />

            {/* Part */}
            <span className="lesson-section-badge-listenadmin">{item.part}</span>

            {/* Title */}
            <h2 className="lesson-card-title-listenadmin">{item.topic}</h2>

            {/* Type */}
            <p className="lesson-type-listenadmin">{item.type}</p>

            {/* Attempts */}
            <p className="lesson-attempts-listenadmin">
              {item.attempts} attempts
            </p>

            {/* Nút điều khiển */}
            <div className="lesson-control-listenadmin">
              <button
                className="lesson-btn-edit-listenadmin"
                onClick={() =>
                  navigate(`/admin/practice_speaking/edit/${item.id}`)
                }
              >
                <FontAwesomeIcon icon={faPen} size="sm" />
              </button>
              <button
                className="lesson-btn-delete-listenadmin"
                onClick={() => handleDelete(item.id)}
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm */}
      <button
        className="lesson-btn-add-listadmin"
        onClick={() => navigate("/admin/practice_speaking/add")}
      >
        Add Speaking Task
      </button>
    </div>
  );
};

export default AdminSpeak;
