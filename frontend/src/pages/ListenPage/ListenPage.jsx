import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./ListenPage.css";

const sectionColors = {
  "Section 1": "#d2b5de",
  "Section 2": "#f2b8e4",
  "Section 3": "#c2eff9",
  "Section 4": "#ddffe6",
  "Full Test": "#D3D3D3",
};

const ListeningPage = () => {
  const [listeningData, setListeningData] = useState([]);
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // 🔹 Lấy danh sách bài nghe từ Firestore qua backend
  useEffect(() => {
    const fetchListening = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/user/listening");
        const result = await res.json();
        setListeningData(result.data || []);
      } catch (err) {
        console.error("Error fetching listening:", err);
      }
    };
    fetchListening();
  }, []);

  // filter
  const filteredData = listeningData.filter((item) => {
    const sectionMatch = selectedSection
      ? item.section === selectedSection
      : true;
    const searchMatch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return sectionMatch && searchMatch;
  });

  const sections = [
    "Section 1",
    "Section 2",
    "Section 3",
    "Section 4",
    "Full Test",
  ];

  return (
    <div className="listening-page">
      {/* Sidebar */}
      <aside className="sidebar-lis">
        <h3>
          <FontAwesomeIcon icon={faHeadphones} /> Listening Practice
        </h3>
        <div className="filter-group-lis">
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
            <FontAwesomeIcon icon={faMagnifyingGlass} color="#dc9f36" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="cards-lis">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="card-lis"
              onClick={() => navigate(`/listen/${item.id}`)}
            >
              <img src={item.image_url} alt={item.title} />
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
