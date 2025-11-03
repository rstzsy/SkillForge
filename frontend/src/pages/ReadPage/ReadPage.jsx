import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faMagnifyingGlass, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ReadPage.css";

const sectionColors = {
  "Section 1": "#d2b5de",
  "Section 2": "#f2b8e4",
  "Section 3": "#c2eff9",
  "Full Test": "#D3D3D3",
};

const ReadingPage = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [readingData, setReadingData] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sections = ["Section 1", "Section 2", "Section 3", "Full Test"];

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  useEffect(() => {
    if (!userId) {
      setError("User not found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // get all reading task
        const resReadings = await axios.get(
          "http://localhost:3002/api/user/reading"
        );
        const readings = resReadings.data.data || [];

        // get submission task
        const resSub = await axios.get(
          `http://localhost:3002/api/user/read/submit/reading/${userId}`
        );
        const userSubs = resSub.data.data || [];

        // sorted complete task
        const merged = readings.map((r) => {
          const sub = userSubs.find((s) => s.practice_id === r.id);
          return {
            ...r,
            completed: !!sub,
            submitted_at: sub?.submitted_at || null,
          };
        });

        setReadingData(merged);
        setSubmissions(userSubs);
      } catch (err) {
        console.error("Error fetching readings or submissions:", err);
        setError("Failed to load readings or submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Filtered data based on tab, section, search
  const filteredData = readingData.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection
      ? item.section === selectedSection
      : true;
    const searchMatch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  // wishlist
  const handleAddToWishlist = async (item) => {
    try {
      // da co trong wishlist thi khong can them
      const exists = wishlist.some((w) => w.id === item.id);
      if (exists) {
        setMessage("Task này đã có trong wishlist!");
        setTimeout(() => setMessage(""), 2000);
        return;
      }

      await axios.post("http://localhost:3002/api/user/wishlist", {
        user_id: userId,
        practice_id: item.id,
        type: "reading",
      });

      // cap nhap state o frontend
      setWishlist([...wishlist, item]);
      setMessage("Đã thêm vào wishlist thành công!");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error("Lỗi khi thêm vào wishlist:", err);
      setMessage("Không thể thêm vào wishlist.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div className="reading-page">
      {/* Sidebar */}
      <aside className="sidebar-read">
        <h3>
          <FontAwesomeIcon icon={faBook} size="x" /> Reading Practise
        </h3>
        <div className="filter-group-read active">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="reading"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />{" "}
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="reading"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />{" "}
            All Sections
          </label>
        </div>
      </aside>

      {/* Main content */}
      <main className="content-read">
        {/* Tabs + Search */}
        <div className="tabs-search-read">
          <div className="tabs-read">
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

          <div className="search-read">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size="x"
              color="#dc9f36"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Reading cards */}
        {loading ? (
          <p>Loading readings...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className="cards-read">
            {filteredData.map((item) => (
              <div
                className="card-read"
                key={item.id}
                onClick={() => navigate(`/read/${item.id}`)}
                style={{ cursor: "pointer", position: "relative" }}
              >
                {/* Icon trái tim */}
                <div
                  className="wishlist-heart"
                  onClick={(e) => {
                    e.stopPropagation(); // tranh click vao card
                    handleAddToWishlist(item);
                  }}
                  title="Add to wishlist"
                >
                  <FontAwesomeIcon icon={faHeart} color="#ff4757" />
                </div>
                <img
                  src={item.image_url || "/assets/listpic.jpg"}
                  alt={item.title}
                />
                <div className="card-info-read">
                  <span
                    className="section-read"
                    style={{
                      backgroundColor: sectionColors[item.section] || "#ddd",
                    }}
                  >
                    {item.section}
                  </span>
                  <h4>{item.title}</h4>
                  <p className="type-read">{item.type}</p>
                  <p className="attempts-read">{item.attempts || 0} attempts</p>
                  {item.completed && item.submitted_at && (
                    <span className="completed-label">Completed</span>
                  )}
                </div>
              </div>
            ))}
            {filteredData.length === 0 && <p>No tasks found.</p>}
          </div>
        )}
        {message && <div className="wishlist-message">{message}</div>}
      </main>
    </div>
  );
};

export default ReadingPage;
