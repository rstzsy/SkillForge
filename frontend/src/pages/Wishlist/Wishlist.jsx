import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./Wishlist.css";

const mockWishlist = [
  {
    id: 1,
    section: "Listening",
    title: "VOL 6 Test 6 - Crocodile",
    type: "Gap Filling",
    attempts: 1716,
    img: "/assets/listpic.jpg",
    completed: false,
  },
  {
    id: 2,
    section: "Speaking",
    title: "VOL 6 Test 6 - Taking part",
    type: "Multiple Choice",
    attempts: 946,
    img: "/assets/listpic.jpg",
    completed: true,
  },
  {
    id: 3,
    section: "Writing",
    title: "VOL 6 Test 6 - The Map",
    type: "Diagram Labeling",
    attempts: 887,
    img: "/assets/listpic.jpg",
    completed: false,
  },
  {
    id: 4,
    section: "Reading",
    title: "VOL 6 Test 6 - A Hotel",
    type: "Gap Filling",
    attempts: 1338,
    img: "/assets/listpic.jpg",
    completed: true,
  },
];

const sectionColors = {
  Listening: "#c2eff9",
  Reading: "#d2b5de",
  Writing: "#f2b8e4",
  Speaking: "#f9ecc0",
};

const Wishlist = () => {
  const [tab, setTab] = useState("uncompleted");
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState(mockWishlist);
  const [confirmItem, setConfirmItem] = useState(null); // lưu item đang được chọn để xác nhận

  const handleRemove = (id) => {
    const updatedList = wishlist.filter((item) => item.id !== id);
    setWishlist(updatedList);
    setConfirmItem(null);
  };

  const filteredData = wishlist.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="wishlist-page">
      {/* Banner */}
      <section
        className="wishlist-banner"
        style={{ backgroundImage: "url('assets/background.png')" }}
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
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="cards-wishlist">
          {filteredData.map((item) => (
            <div className="card-wishlist" key={item.id}>
              <img src={item.img} alt={item.title} />
              <div className="card-info-wishlist">
                <span
                  className="section-wishlist"
                  style={{ backgroundColor: sectionColors[item.section] }}
                >
                  {item.section}
                </span>
                <h4>{item.title}</h4>
                <p className="type-wishlist">{item.type}</p>
                <p className="attempts-wishlist">{item.attempts} learners</p>
                {item.completed && (
                  <span className="completed-label">Completed</span>
                )}
              </div>

              {/* Icon trái tim */}
              <div
                className="wishlist-heart"
                onClick={() => setConfirmItem(item)}
                title="Remove from wishlist"
              >
                <FontAwesomeIcon icon={faHeart} color="#ff4757" />
              </div>
            </div>
          ))}

          {filteredData.length === 0 && (
            <p className="wishlist-empty">No favorite lessons found.</p>
          )}
        </div>
      </div>

      {/* Xác nhận gỡ bài */}
      {confirmItem && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Remove from wishlist?</h3>
            <p>
              Are you sure you want to remove <strong>{confirmItem.title}</strong> from your favorites?
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
