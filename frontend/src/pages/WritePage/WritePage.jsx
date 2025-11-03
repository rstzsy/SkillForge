import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib, faMagnifyingGlass, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import axios from "axios";
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
  const [writingData, setWritingData] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sections = ["Task 1", "Task 2", "Full Test"];

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  // 🔹 1. Load đề bài (writing_practices)
  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "writing_practices"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWritingData(items);
      } catch (err) {
        console.error("Error loading writing_practices:", err);
      }
    };
    fetchPractices();
  }, []);

  // 🔹 2. Load bài làm của user hiện tại (writing_submissions)
  useEffect(() => {
    const fetchUserSubmissions = async () => {
      if (!userId) return;
      try {
        const q = query(collection(db, "writing_submissions"), where("user_id", "==", userId));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubmissions(items);
      } catch (err) {
        console.error("Error loading user submissions:", err);
      }
    };
    fetchUserSubmissions();
  }, [userId]);

  // 🔹 3. Gộp 2 bảng lại
  const combinedData = writingData.map((task) => {
    const userSubmission = submissions.find((sub) => sub.practice_id === task.id);
    return {
      ...task,
      // Giữ nguyên attempts từ writing_practices
      status: userSubmission?.status || "Not Started",
      overall_band: userSubmission?.ai_feedback?.overall_band || null,
    };
  });


  // 🔹 4. Lọc dữ liệu hiển thị
  const filteredData = combinedData.filter((item) => {
    const statusMatch =
      tab === "completed" ? item.status === "Completed" : item.status !== "Completed";
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  // 🔹 5. Wishlist
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

  // 🔹 6. Render giao diện
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
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
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
                  <p className="attempts-write">{item.attempts || 0} attempts</p>
                  {item.status === "Completed" && <span className="completed-label">Completed</span>}
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
