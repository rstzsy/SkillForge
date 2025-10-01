import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./WritePage.css";

export const mockWriteData = [
  {
    id: 1,
    section: "Task 1",
    title: "Bar Chart - International Students",
    type: "Report",
    attempts: 742,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 20,
  },
  {
    id: 2,
    section: "Task 2",
    title: "Essay - Technology & Education",
    type: "Opinion Essay",
    attempts: 589,
    img: "/assets/listpic.jpg",
    completed: true,
    timeLimit: 40,
  },
  {
    id: 3,
    section: "Task 2",
    title: "Essay - Environment Issues",
    type: "Discussion Essay",
    attempts: 921,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 40,
  },
  {
    id: 4,
    section: "Full Test",
    title: "Cambridge 16 Test 4",
    type: "Task 1 + Task 2",
    attempts: 318,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 60,
  },
  {
    id: 5,
    section: "Full Test",
    title: "Cambridge 16 Test 4",
    type: "Task 1 + Task 2",
    attempts: 318,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 60,
  },
  {
    id: 6,
    section: "Full Test",
    title: "Cambridge 16 Test 4",
    type: "Task 1 + Task 2",
    attempts: 318,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 60,
  },
  {
    id: 7,
    section: "Full Test",
    title: "Cambridge 16 Test 4",
    type: "Task 1 + Task 2",
    attempts: 318,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 60,
  }
];

const sectionColors = {
  "Task 1": "#fcd5ce",
  "Task 2": "#d0f4de",
  "Full Test": "#cddafd",
};

const WritePage = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const sections = ["Task 1", "Task 2", "Full Test"];

  const filteredData = mockWriteData.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  return (
    <div className="writing-page">
      {/* Sidebar */}
      <aside className="sidebar-write">
        <h3>
          <FontAwesomeIcon icon={faPenNib} size="x" /> Writing Practise
        </h3>
        <div className="filter-group-write">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="writing"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="writing"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />
            All Sections
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content-write">
        {/* Tabs + Search */}
        <div className="tabs-search-write">
          <div className="tabs-write">
            <button
              className={tab === "uncompleted" ? "active" : ""}
              onClick={() => setTab("uncompleted")}
            >
              Uncomplete Task
            </button>
            <button
              className={tab === "completed" ? "active" : ""}
              onClick={() => setTab("completed")}
            >
              Complete Task
            </button>
          </div>

          <div className="search-write">
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
            <input
              type="text"
              placeholder="Search Writing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Card list */}
        <div className="cards-write">
          {filteredData.map((item) => (
            <div
              className="card-write"
              key={item.id}
              onClick={() => navigate(`/write/${item.id}`)} // chuyển sang trang chi tiết Writing
              style={{ cursor: "pointer" }}
            >
              <img src={item.img} alt={item.title} />
              <div className="card-info-write">
                <span
                  className="section-write"
                  style={{ backgroundColor: sectionColors[item.section] }}
                >
                  {item.section}
                </span>
                <h4>{item.title}</h4>
                <p className="type-write">{item.type}</p>
                <p className="attempts-write">{item.attempts} attempts</p>
                {item.completed && (
                  <span className="completed-label">Completed</span>
                )}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && <p>No tasks found.</p>}
        </div>
      </main>
    </div>
  );
};

export default WritePage;
