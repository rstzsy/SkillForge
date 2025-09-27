import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./ListenPage.css";

const mockData = [
  {
    id: 1,
    section: "Section 4",
    title: "VOL 6 Test 6 - Crocodile",
    type: "Gap Filling",
    attempts: 1716,
    img: "listpic.jpg",
    completed: false,
  },
  {
    id: 2,
    section: "Section 3",
    title: "VOL 6 Test 6 - Taking part",
    type: "Map, Diagram Label, Multiple Choice",
    attempts: 946,
    img: "listpic.jpg",
    completed: true,
  },
  {
    id: 3,
    section: "Section 2",
    title: "VOL 6 Test 6 - The Map",
    type: "Map, Diagram Label, One Answer",
    attempts: 887,
    img: "listpic.jpg",
    completed: false,
  },
  {
    id: 4,
    section: "Section 1",
    title: "VOL 6 Test 6 - A Hotel",
    type: "Gap Filling",
    attempts: 1338,
    img: "listpic.jpg",
    completed: true,
  },
  {
    id: 5,
    section: "Section 4",
    title: "VOL 6 Test 6 - Crocodile",
    type: "Gap Filling",
    attempts: 1716,
    img: "listpic.jpg",
    completed: false,
  },
  {
    id: 6,
    section: "Full Test",
    title: "VOL 6 Test 6 - Taking part",
    type: "Map, Diagram Label, Multiple Choice",
    attempts: 946,
    img: "listpic.jpg",
    completed: false,
  },
  {
    id: 7,
    section: "Section 2",
    title: "VOL 6 Test 6 - The Map",
    type: "Map, Diagram Label, One Answer",
    attempts: 887,
    img: "listpic.jpg",
    completed: false,
  },
  {
    id: 8,
    section: "Section 1",
    title: "VOL 6 Test 6 - A Hotel",
    type: "Gap Filling",
    attempts: 1338,
    img: "listpic.jpg",
    completed: false,
  },
];

const sectionColors = {
  "Section 1": "#d2b5de",
  "Section 2": "#f2b8e4",
  "Section 3": "#c2eff9",
  "Section 4": "#ddffe6",
  "Full Test": "#D3D3D3",
};

const ListeningPage = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const sections = [
    "Section 1",
    "Section 2",
    "Section 3",
    "Section 4",
    "Full Test",
  ];

  const filteredData = mockData.filter(item => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  return (
    <div className="listening-page">
      {/* Sidebar */}
      <aside className="sidebar-lis">
        <h3>
          <FontAwesomeIcon icon={faHeadphones} size="x" />
          Listening Practise
        </h3>
        <div className="filter-group-lis active">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="listening"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />{" "}
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="listening"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />{" "}
            All Sections
          </label>
        </div>
      </aside>

      {/* Main content */}
      <main className="content-lis">
        {/* Tabs + Search */}
        <div className="tabs-search-lis">
          <div className="tabs-lis">
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

          <div className="search-lis">
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="cards-lis">
          {filteredData.map((item) => (
            <div className="card-lis" key={item.id}>
              <img src={item.img} alt={item.title} />
              <div className="card-info-lis">
                <span
                  className="section-lis"
                  style={{ backgroundColor: sectionColors[item.section] }}
                >
                  {item.section}
                </span>
                <h4>{item.title}</h4>
                <p className="type-lis">{item.type}</p>
                <p className="attempts-lis">{item.attempts} attempts</p>
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

export default ListeningPage;
