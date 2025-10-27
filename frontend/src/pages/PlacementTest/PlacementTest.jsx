import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./PlacementTest.css";

export const mockPlacementData = [
  {
    id: 1,
    section: "Test Reading",
    title: "Reading Comprehension Test",
    type: "Multiple Choice",
    attempts: 842,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 10,
  },
  {
    id: 2,
    section: "Test Listening",
    title: "Listening Practice Test",
    type: "Audio Questions",
    attempts: 731,
    img: "/assets/listening.jpg",
    completed: true,
    timeLimit: 8,
  },
  {
    id: 3,
    section: "Test Writing",
    title: "Writing Task 1 & 2",
    type: "Essay and Graph Description",
    attempts: 615,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 20,
  },
  {
    id: 4,
    section: "Test Speaking",
    title: "Speaking Interview Simulation",
    type: "Part 1 + 2 + 3",
    attempts: 402,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 15,
  },
];

const sectionColors = {
  "Test Reading": "#cddafd",
  "Test Writing": "#fcd5ce",
  "Test Listening": "#d0f4de",
  "Test Speaking": "#ffe066",
};

const PlacementTest = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const sections = ["Test Reading", "Test Listening", "Test Writing", "Test Speaking"];

  const filteredData = mockPlacementData.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  return (
    <div className="placement-page">
      {/* Sidebar */}
      <aside className="sidebar-placement">
        <h3>
          <FontAwesomeIcon icon={faBookOpen} size="x" /> Placement Test
        </h3>
        <div className="filter-group-placement">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="placement"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="placement"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />
            All Skills
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content-placement">
        {/* Tabs + Search */}
        <div className="tabs-search-placement">
          <div className="tabs-placement">
            <button
              className={tab === "uncompleted" ? "active" : ""}
              onClick={() => setTab("uncompleted")}
            >
              Uncompleted
            </button>
            <button
              className={tab === "completed" ? "active" : ""}
              onClick={() => setTab("completed")}
            >
              Completed
            </button>
          </div>

          <div className="search-placement">
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
            <input
              type="text"
              placeholder="Search placement test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="cards-placement">
          {filteredData.map((item) => (
            <div
              className="card-placement"
              key={item.id}
              onClick={() => navigate(`/placement/${item.id}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={item.img} alt={item.title} />
              <div className="card-info-placement">
                <span
                  className="section-placement"
                  style={{ backgroundColor: sectionColors[item.section] }}
                >
                  {item.section}
                </span>
                <h4>{item.title}</h4>
                <p className="type-placement">{item.type}</p>
                <p className="attempts-placement">{item.attempts} attempts</p>
                {item.completed && (
                  <span className="completed-label-placement">Completed</span>
                )}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && <p>No tests found.</p>}
        </div>
      </main>
    </div>
  );
};

export default PlacementTest;
