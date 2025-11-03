import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faMagnifyingGlass,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [confirmItem, setConfirmItem] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  const sections = [
    "Section 1",
    "Section 2",
    "Section 3",
    "Section 4",
    "Full Test",
  ];

  useEffect(() => {
    if (!userId) {
      setError("User not found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // get all tasks
        const resListening = await axios.get(
          "http://localhost:3002/api/user/listening"
        );
        const listenings = resListening.data.data || [];

        // get all submission user
        const resSubs = await axios.get(
          `http://localhost:3002/api/user/listen/submit/listening/${userId}`
        );
        const userSubs = resSubs.data.data || [];

        // sorted completion task
        const merged = listenings.map((item) => {
          const sub = userSubs.find(
            (s) => s.practice_id === item.id && s.status === "submitted"
          );
          return {
            ...item,
            completed: !!sub,
            submitted_at: sub?.submitted_at || null,
          };
        });

        setListeningData(merged);
      } catch (err) {
        console.error("Error fetching listening or submissions:", err);
        setError("Failed to load listening data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const filteredData = listeningData.filter((item) => {
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
      // neu da co trong wishlist thi khong can them
      const exists = wishlist.some((w) => w.id === item.id);
      if (exists) {
        setMessage("Task này đã có trong wishlist!");
        setTimeout(() => setMessage(""), 2000);
        return;
      }

      // call api
      await axios.post("http://localhost:3002/api/user/wishlist", {
        user_id: userId,
        practice_id: item.id,
        type: "listening",
      });

      // cap nhap wishlist
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
        {loading ? (
          <p>Loading listening tasks...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className="cards-lis">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="card-lis"
                onClick={() => navigate(`/listen/${item.id}`)}
                style={{ cursor: "pointer", position: "relative" }} 
              >
                {/* Icon trái tim */}
                <div
                  className="wishlist-heart"
                  onClick={(e) => {
                    e.stopPropagation(); 
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
                <div className="card-info-lis">
                  <span
                    className="section-lis"
                    style={{
                      backgroundColor: sectionColors[item.section] || "#ddd",
                    }}
                  >
                    {item.section}
                  </span>
                  <h4>{item.title}</h4>
                  <p className="type-lis">{item.type}</p>
                  <p className="attempts-lis">{item.attempts || 0} attempts</p>
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

export default ListeningPage;
