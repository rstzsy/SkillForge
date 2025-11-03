import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib, faMagnifyingGlass, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config"; // đường dẫn tới file firebase.js
import axios from "axios"
import "./WritePage.css";

const sectionColors = {
  "Task 1": "#fcd5ce",
  "Task 2": "#d0f4de",
  "Full Test": "#cddafd",
};

const WritePage = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [writingData, setWritingData] = useState([]); // 🔹 dữ liệu từ Firebase
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sections = ["Task 1", "Task 2", "Full Test"];

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  // 🔹 Load dữ liệu từ Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "writing_practices")
        );
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWritingData(items);
      } catch (err) {
        console.error("Error loading writings:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Bộ lọc dữ liệu
  const filteredData = writingData.filter((item) => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection
      ? item.section === selectedSection
      : true;
    const searchMatch = item.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  // wishlist
  const handleAddToWishlist = async (item) => {
    try {
      const exists = wishlist.some((w) => w.id === item.id);
      if (exists) {
        setMessage("Task này đã có trong wishlist!");
        setTimeout(() => setMessage(""), 2000);
        return;
      }

      await axios.post("http://localhost:3002/api/user/wishlist", {
        user_id: userId,
        practice_id: item.id,
        type: "writing",
      });

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
    <div className="writing-page">
      <aside className="sidebar-write">
        <h3>
          <FontAwesomeIcon icon={faPenNib} size="x" /> Writing Practise
        </h3>
        <div className="filter-group-write">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="writing"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="writing"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />
            All Sections
          </label>
        </div>
      </aside>

      <main className="content-write">
        <div className="tabs-search-write">
          <div className="tabs-write">
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

          <div className="search-write">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size="x"
              color="#dc9f36"
            />
            <input
              type="text"
              placeholder="Search Writing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="cards-write">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div
                className="card-write"
                key={item.id}
                onClick={() => navigate(`/write/${item.id}`)}
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
                <img src={"/assets/listpic.jpg"} alt={item.title} />
                <div className="card-info-write">
                  <span
                    className="section-write"
                    style={{ backgroundColor: sectionColors[item.section] }}
                  >
                    {item.section}
                  </span>
                  <h4>{item.title}</h4>
                  <p className="type-write">{item.type}</p>
                  <p className="attempts-write">
                    {item.attempts || 0} attempts
                  </p>
                  {item.completed && (
                    <span className="completed-label">Completed</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No tasks found.</p>
          )}
        </div>
        {message && <div className="wishlist-message">{message}</div>}
      </main>
    </div>
  );
};

export default WritePage;
