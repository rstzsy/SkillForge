import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./SpeakPage.css";

export const mockSpeakData = [
  {
    id: 1,
    section: "Part 1",
    title: "Introduce Yourself",
    type: "General Questions",
    attempts: 652,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 5,
  },
  {
    id: 2,
    section: "Part 2",
    title: "Describe a Place You Love",
    type: "Cue Card",
    attempts: 489,
    img: "/assets/listpic.jpg",
    completed: true,
    timeLimit: 2,
  },
  {
    id: 3,
    section: "Part 3",
    title: "Discussion on Tourism",
    type: "Follow-up Questions",
    attempts: 371,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 4,
  },
  {
    id: 4,
    section: "Full Test",
    title: "Cambridge 17 Speaking Test 2",
    type: "Part 1 + 2 + 3",
    attempts: 210,
    img: "/assets/listpic.jpg",
    completed: false,
    timeLimit: 15,
  },
];

const sectionColors = {
  "Part 1": "#fcd5ce",
  "Part 2": "#d0f4de",
  "Part 3": "#cddafd",
  "Full Test": "#ffe066",
};

const SpeakPage = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const sections = ["Part 1", "Part 2", "Part 3", "Full Test"];

  const filteredData = mockSpeakData.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  return (
    <div className="speaking-page">
      {/* Sidebar */}
      <aside className="sidebar-speak">
        <h3>
          <FontAwesomeIcon icon={faMicrophone} size="x" /> Speaking Practise
        </h3>
        <div className="filter-group-speak">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="speaking"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="speaking"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />
            All Sections
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content-speak">
        {/* Tabs + Search */}
        <div className="tabs-search-speak">
          <div className="tabs-speak">
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

          <div className="search-speak">
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
            <input
              type="text"
              placeholder="Search Speaking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Card list */}
        <div className="cards-speak">
          {filteredData.map((item) => (
            <div
              className="card-speak"
              key={item.id}
              onClick={() => navigate(`/speak/${item.id}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={item.img} alt={item.title} />
              <div className="card-info-speak">
                <span
                  className="section-speak"
                  style={{ backgroundColor: sectionColors[item.section] }}
                >
                  {item.section}
                </span>
                <h4>{item.title}</h4>
                <p className="type-speak">{item.type}</p>
                <p className="attempts-speak">{item.attempts} attempts</p>
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

export default SpeakPage;
