import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

const sectionColors = {
  Listening: "#c2eff9",
  Reading: "#d2b5de",
  Writing: "#f2b8e4",
  Speaking: "#f9ecc0",
};

const Wishlist = () => {
  const [tab, setTab] = useState("uncompleted");
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [confirmItem, setConfirmItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const navigate = useNavigate();

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3002/api/user/wishlist/${userId}`
        );
        setWishlist(res.data.data || []);
      } catch (err) {
        console.error("❌ Failed to load wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [userId]);

  // Remove item from wishlist
  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/user/wishlist/${id}`);
      setWishlist((prev) => prev.filter((item) => item.id !== id));
      setConfirmItem(null);
    } catch (err) {
      console.error("❌ Failed to remove wishlist item:", err);
    }
  };

  // Filtered data
  const filteredData = wishlist.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const searchMatch = (
      item.title?.toLowerCase() ||
      item.topic?.toLowerCase() ||
      ""
    ).includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="wishlist-page">
      {/* Banner */}
      <section
        className="wishlist-banner"
        style={{ backgroundImage: "url('/assets/background.png')" }}
      >
        <h2 className="wishlist-title">Wish List</h2>
      </section>

      {/* Main Content */}
      <div className="wishlist-content">
        {/* Tabs + Search */}
        <div className="tabs-search-wishlist">
          <div className="tabs-wishlist">
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

          <div className="search-wishlist">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size="x"
              color="#dc9f36"
            />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <p className="wishlist-loading">Loading wishlist...</p>
        ) : filteredData.length === 0 ? (
          <p className="wishlist-empty">No favorite lessons found.</p>
        ) : (
          <div className="cards-wishlist">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="card-wishlist"
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => {
                  const type = item.type?.toLowerCase(); 
                  const practiceId = item.practice_id; 
                  switch (type) {
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
                      console.warn("Unknown type:", item);
                  }
                }}
              >
                {/* Wishlist icon luôn màu đỏ */}
                <div
                  className="wishlist-heart"
                  onClick={(e) => {
                    e.stopPropagation(); // ngan navigate khi click vao icon
                    setConfirmItem(item); 
                  }}
                  title="Remove from wishlist"
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    color="#ff4757" 
                  />
                </div>

                <img
                  src={item.image_url || "/assets/listpic.jpg"}
                  alt={item.title || item.topic}
                />
                <div className="card-info-wishlist">
                  <span
                    className="section-wishlist"
                    style={{
                      backgroundColor: sectionColors[item.section] || "#f0f0f0",
                    }}
                  >
                    {item.section || "General"}
                  </span>
                  <h4>{item.title || item.topic}</h4>
                  <p className="type-wishlist">{item.type}</p>
                  <p className="attempts-wishlist">
                    {item.attempts || 0} learners
                  </p>
                  {item.completed && (
                    <span className="completed-label">Completed</span>
                  )}
                </div>
              </div>
            ))}

            {filteredData.length === 0 && (
              <p className="wishlist-empty">No favorite lessons found.</p>
            )}
          </div>
        )}
      </div>

      {/* Confirm remove */}
      {confirmItem && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Remove from wishlist?</h3>
            <p>
              Are you sure you want to remove{" "}
              <strong>{confirmItem.title}</strong> from your favorites?
            </p>
            <div className="confirm-buttons">
              <button
                className="btn-cancel"
                onClick={() => setConfirmItem(null)}
              >
                Cancel
              </button>
              <button
                className="btn-remove"
                onClick={() => handleRemove(confirmItem.id)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
