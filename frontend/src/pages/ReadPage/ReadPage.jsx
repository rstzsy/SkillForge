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
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sections = ["Section 1", "Section 2", "Section 3", "Full Test"];
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  // Fetch readings + submissions
  useEffect(() => {
    if (!userId) {
      setError("User not found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get all reading tasks
        const resReadings = await axios.get("https://skillforge-99ct.onrender.com/api/user/reading");
        const readings = resReadings.data.data || [];

        // Get user submissions
        const resSub = await axios.get(`https://skillforge-99ct.onrender.com/api/user/read/submit/reading/${userId}`);
        const userSubs = resSub.data.data || [];

        // Merge completion status
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

  // Fetch wishlist on load
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!userId) return;
        const res = await axios.get(`https://skillforge-99ct.onrender.com/api/user/wishlist/${userId}`);
        setWishlist(res.data.data || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, [userId]);

  const filteredData = readingData.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  // Handle wishlist toggle
  const handleWishlistToggle = async (item, e) => {
    e.stopPropagation();

    const existing = wishlist.find(
      (w) => w.practice_id === item.id && w.user_id === userId
    );

    if (existing) {
      try {
        await axios.delete(`https://skillforge-99ct.onrender.com/api/user/wishlist/${existing.id}`);
        setWishlist((prev) => prev.filter((w) => w.id !== existing.id));
        setMessage("Đã xóa khỏi wishlist");
      } catch (err) {
        console.error("Error removing from wishlist:", err);
        setMessage("Không thể xóa khỏi wishlist");
      } finally {
        setTimeout(() => setMessage(""), 2000);
      }
    } else {
      try {
        const res = await axios.post("https://skillforge-99ct.onrender.com/api/user/wishlist", {
          user_id: userId,
          practice_id: item.id,
          type: "reading",
        });

        const newWishlistItem = {
          id: res.data.id, 
          user_id: userId,
          practice_id: item.id,
          type: "reading",
        };

        setWishlist((prev) => [...prev, newWishlistItem]);
        setMessage("Đã thêm vào wishlist");
      } catch (err) {
        console.error("Error adding to wishlist:", err);
        setMessage("Không thể thêm vào wishlist");
      } finally {
        setTimeout(() => setMessage(""), 2000);
      }
    }
  };


  return (
    <div className="reading-page">
      {/* Sidebar */}
      <aside className="sidebar-read">
        <h3>
          <FontAwesomeIcon icon={faBook} /> Reading Practice
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
        {loading ? (
          <p>Loading readings...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className="cards-read">
            {filteredData.map((item) => {
              const inWishlist = wishlist.some((w) => w.practice_id === item.id);
              return (
                <div
                  className="card-read"
                  key={item.id}
                  onClick={() => navigate(`/read/${item.id}`)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  {/* Wishlist icon */}
                  <div
                    className="wishlist-heart"
                    onClick={(e) => handleWishlistToggle(item, e)}
                    title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      color={inWishlist ? "#ff4757" : "#ccc"}
                    />
                  </div>

                  <img src={item.image_url || "/assets/listpic.jpg"} alt={item.title} />
                  <div className="card-info-read">
                    <span
                      className="section-read"
                      style={{ backgroundColor: sectionColors[item.section] || "#ddd" }}
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
              );
            })}
            {filteredData.length === 0 && <p>No tasks found.</p>}
          </div>
        )}
        {message && <div className="wishlist-message">{message}</div>}
      </main>
    </div>
  );
};

export default ReadingPage;
