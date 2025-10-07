import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../AdminListen/AdminListen.css"; 

const writingData = [
  {
    id: 1,
    section: "Task 1",
    title: "Describing Bar Chart - Global Internet Users",
    type: "Academic",
    image: "/assets/listpic.jpg",
    attempts: 80,
  },
  {
    id: 2,
    section: "Task 1",
    title: "Describing Line Graph - Temperature Trends",
    type: "Academic",
    image: "/assets/listpic.jpg",
    attempts: 65,
  },
  {
    id: 3,
    section: "Task 2",
    title: "Agree or Disagree - Technology and Education",
    type: "Essay",
    image: "/assets/listpic.jpg",
    attempts: 110,
  },
  {
    id: 4,
    section: "Task 2",
    title: "Advantages & Disadvantages - Online Shopping",
    type: "Essay",
    image: "/assets/listpic.jpg",
    attempts: 95,
  },
  {
    id: 5,
    section: "Task 1",
    title: "Describing Pie Chart - Energy Sources",
    type: "Academic",
    image: "/assets/listpic.jpg",
    attempts: 52,
  },
];

const AdminWrite = () => {
  const [writings, setWritings] = useState(writingData);
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  // Bộ lọc
  const filteredWritings = writings.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterSection ? item.section === filterSection : true) &&
      (filterType ? item.type === filterType : true)
    );
  });

  // Xóa bài
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this writing task?")) {
      setWritings(writings.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="lesson-container-listenadmin">
      <AdminHeader />
      <h1 className="lesson-title-listenadmin">Manage Writing Practices</h1>

      {/* Bộ lọc */}
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
          <option value="Task 1">Task 1</option>
          <option value="Task 2">Task 2</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Types</option>
          <option value="Academic">Academic</option>
          <option value="Essay">Essay</option>
        </select>
      </div>

      {/* Danh sách bài */}
      <div className="lesson-grid-listenadmin">
        {filteredWritings.map((item) => (
          <div key={item.id} className="lesson-card-listenadmin">
            <img
              src={item.image}
              alt={item.title}
              className="lesson-image-listenadmin"
            />

            {/* Section tag */}
            <span className="lesson-section-badge-listenadmin">
              {item.section}
            </span>

            {/* Title */}
            <h2 className="lesson-card-title-listenadmin">{item.title}</h2>

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
                  navigate(`/admin/practice_writing/edit/${item.id}`)
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
        onClick={() => navigate("/admin/practice_writing/add")}
      >
        Add Writing Task
      </button>
    </div>
  );
};

export default AdminWrite;
