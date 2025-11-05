import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PlacementTest.css";

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
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sections = ["Test Reading", "Test Listening", "Test Writing", "Test Speaking"];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id;
        if (!userId) throw new Error("User not logged in");

        // get all test
        const resTests = await axios.get("http://localhost:3002/api/placement-tests");
        const allTests = resTests.data.data.map((item) => ({
          ...item,
          section: `Test ${item.skill}`,
          completed: false, // default
        }));

        // get user submission
        const resUser = await axios.get(
          `http://localhost:3002/api/placement-tests/user/${userId}`
        );
        const userTests = resUser.data.data;

        // merge complete task
        const merged = allTests.map((test) => {
          const done = userTests.find((ut) => ut.id === test.id && ut.completed === true);
          return { ...test, completed: !!done };
        });

        setTests(merged);
      } catch (err) {
        console.error("❌ Failed to fetch placement tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Filter theo tab / section / search
  const filteredData = tests.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed === true : item.completed === false;
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
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
        {loading ? (
          <p>Loading placement tests...</p>
        ) : filteredData.length === 0 ? (
          <p>No tests found.</p>
        ) : (
          <div className="cards-placement">
            {filteredData.map((item) => (
              <div
                className="card-placement"
                key={item.id}
                onClick={() => {
                  const practiceId = item.id;
                  switch (item.skill.toLowerCase()) {
                    case "listening":
                      navigate(`/listen/${practiceId}`);
                      break;
                    case "reading":
                      navigate(`/read/${practiceId}`);
                      break;
                    case "writing":
                      navigate(`/write/${practiceId}`);
                      break;
                    case "speaking":
                      navigate(`/speak/${practiceId}`);
                      break;
                    default:
                      console.warn("Unknown type:", item.skill);
                  }
                }}
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
          </div>
        )}
      </main>
    </div>
  );
};

export default PlacementTest;
