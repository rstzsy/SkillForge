import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMagnifyingGlass,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import axios from "axios";
import "./SpeakPage.css";

const sectionColors = {
  "Part 1": "#fcd5ce",
  "Part 2": "#d0f4de",
  "Part 3": "#cddafd",
};

const SpeakPage = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [speakingData, setSpeakingData] = useState([]);
  const [userCompleted, setUserCompleted] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sections = ["Part 1", "Part 2", "Part 3"];
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch speaking practices
        const practicesSnap = await getDocs(collection(db, "speaking_practices"));
        const practices = practicesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch submissions
        const submissionsSnap = await getDocs(collection(db, "speaking_submissions"));
        const submissions = submissionsSnap.docs.map((doc) => doc.data());

        // Count attempts
        const attemptsCount = {};
        submissions.forEach((sub) => {
          const id = sub.speaking_id;
          if (!attemptsCount[id]) attemptsCount[id] = 0;
          attemptsCount[id]++;
        });

        // User completed
        if (userId) {
          const userSubmissionsQuery = query(
            collection(db, "speaking_submissions"),
            where("user_id", "==", userId)
          );
          const userSubSnap = await getDocs(userSubmissionsQuery);
          const completedIds = userSubSnap.docs.map((d) => d.data().speaking_id);
          setUserCompleted(completedIds);
        }

        // Combine attempts
        const combined = practices.map((p) => ({
          ...p,
          attempts: attemptsCount[p.id] || 0,
        }));

        setSpeakingData(combined);
      } catch (err) {
        console.error("Error fetching speaking data:", err);
      }
    };

    fetchData();
  }, [userId]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!userId) return;
        const res = await axios.get(`http://localhost:3002/api/user/wishlist/${userId}`);
        setWishlist(res.data.data || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, [userId]);

  // Filter displayed data
  const filteredData = speakingData.filter((item) => {
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const completed = userCompleted.includes(item.id);

    if (tab === "completed" && !completed) return false;
    if (tab === "uncompleted" && completed) return false;

    return sectionMatch && searchMatch;
  });

  const handleWishlistToggle = async (item, e) => {
    e.stopPropagation();
    const existing = wishlist.find(
      (w) => w.practice_id === item.id && w.user_id === userId
    );

    if (existing) {
      try {
        await axios.delete(`http://localhost:3002/api/user/wishlist/${existing.id}`);
        setWishlist((prev) => prev.filter((w) => w.id !== existing.id));
        setMessage("Đã xóa khỏi wishlist");
      } catch (err) {
        console.error("❌ Lỗi khi xóa khỏi wishlist:", err);
        setMessage("Không thể xóa khỏi wishlist");
      }
    } else {
      // ✅ Thêm vào wishlist
      try {
        const res = await axios.post("http://localhost:3002/api/user/wishlist", {
          user_id: userId,
          practice_id: item.id,
          type: "speaking",
        });

        const newItem = { id: res.data.id, user_id: userId, practice_id: item.id, type: "speaking" };
        setWishlist((prev) => [...prev, newItem]);
        setMessage("Đã thêm vào wishlist");
      } catch (err) {
        console.error("❌ Lỗi khi thêm vào wishlist:", err);
        setMessage("Không thể thêm vào wishlist");
      }
    }

    setTimeout(() => setMessage(""), 2000);
  };


  return (
    <div className="speaking-page">
      <aside className="sidebar-speak">
        <h3>
          <FontAwesomeIcon icon={faMicrophone} size="x" /> Speaking Practice
        </h3>

        <div className="filter-group-speak">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="speak"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="speak"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />
            All Sections
          </label>
        </div>
      </aside>

      <main className="content-speak">
        <div className="tabs-search-speak">
          <div className="tabs-speak">
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

          <div className="search-speak">
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
            <input
              type="text"
              placeholder="Search Speaking Topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="cards-speak">
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
              const inWishlist = wishlist.some((w) => w.practice_id === item.id);
              return (
                <div
                  className={`card-speak ${
                    userCompleted.includes(item.id) ? "completed" : ""
                  }`}
                  key={item.id}
                  onClick={() => navigate(`/speak/${item.id}`)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  {/* Wishlist heart */}
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

                  <img src={"/assets/listpic.jpg"} alt={item.topic} />
                  <div className="card-info-speak">
                    <span
                      className="section-speak"
                      style={{ backgroundColor: sectionColors[item.section] }}
                    >
                      {item.section}
                    </span>
                    <h4>{item.topic}</h4>
                    <p className="type-speak">{item.type}</p>
                    <p className="attempts-speak">{item.attempts} attempts</p>
                    {userCompleted.includes(item.id) && (
                      <p className="completed-label">Completed</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No speaking topics found.</p>
          )}
        </div>

        {message && <div className="wishlist-message">{message}</div>}
      </main>
    </div>
  );
};

export default SpeakPage;
