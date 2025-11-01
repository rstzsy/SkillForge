import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./SpeakPage.css";

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
  const [speakData, setSpeakData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sections = ["Part 1", "Part 2", "Part 3", "Full Test"];

  // 🔹 Lấy dữ liệu từ Firestore qua API
  useEffect(() => {
    const fetchSpeaking = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/speaking");
        const data = await res.json();

        // Định dạng lại dữ liệu
        const formatted = data.map((item) => ({
          id: item.speaking_practices_id,
          section: item.section,
          title: item.topic,
          type: item.type || "General",
          attempts: item.attempts || 0,
          img: "/assets/listpic.jpg",
          completed: false, // ✅ tạm thời luôn là chưa hoàn thành
          timeLimit: item.time_limit || 2,
        }));

        setSpeakData(formatted);
      } catch (err) {
        console.error("❌ Error loading speaking data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpeaking();
  }, []);

  // 🔹 Lọc theo section & search term
  const filteredData = speakData.filter((item) => {
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return sectionMatch && searchMatch;
  });

  if (loading) return <p>Loading Speaking Data...</p>;

  return (
    <div className="speaking-page">
      {/* Sidebar */}
      <aside className="sidebar-speak">
        <h3>
          <FontAwesomeIcon icon={faMicrophone} size="x" /> Speaking Practice
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
              Uncompleted Task
            </button>
            <button
              className={tab === "completed" ? "active" : ""}
              onClick={() => setTab("completed")}
            >
              Completed Task
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
