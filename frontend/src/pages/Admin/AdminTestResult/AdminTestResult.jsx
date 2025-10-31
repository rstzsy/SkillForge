import React, { useState, useEffect } from "react";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import "./AdminTestResult.css";

const AdminTestResult = () => {
  const [filterSkill, setFilterSkill] = useState("all");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data từ Firestore (writing_feedbacks)
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const feedbackSnapshot = await getDocs(collection(db, "writing_feedbacks"));
        const resultsData = [];

        for (const fbDoc of feedbackSnapshot.docs) {
          const fbData = fbDoc.data();

          // 🔹 Lấy thông tin user
          let username = "Unknown User";
          let email = "N/A";
          if (fbData.user_id) {
            const userRef = doc(db, "users", fbData.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              username =
                userData.userName ||
                userData.username ||
                userData.user_name ||
                "Unnamed";
              email = userData.email || "No email";
            }
          }

          // 🔹 Lấy thông tin writing task
          let title = "Unknown Task";
          if (fbData.practice_id) {
            const taskRef = doc(db, "writing_practices", fbData.practice_id);
            const taskSnap = await getDoc(taskRef);
            if (taskSnap.exists()) {
              const taskData = taskSnap.data();
              title = taskData.title || "Untitled";
            }
          }

          resultsData.push({
            id: fbDoc.id,
            username,
            email,
            title,
            skill: "writing", // để filter theo kỹ năng
            feedback: fbData.ai_feedback,
            createdAt: fbData.created_at?.toDate
              ? fbData.created_at.toDate().toLocaleString()
              : new Date(fbData.created_at).toLocaleString(),
          });
        }

        setResults(resultsData);
      } catch (error) {
        console.error("❌ Error fetching writing feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // 🔹 Filter theo search và kỹ năng
  const filteredResults = results.filter((r) => {
    const s = search.toLowerCase();
    const matchesSearch =
      r.username.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.title.toLowerCase().includes(s);

    if (filterSkill === "all") return matchesSearch;
    return matchesSearch && r.skill === filterSkill;
  });

  const handleReset = () => {
    setFilterSkill("all");
    setSearch("");
  };

  if (loading) return <p className="loading">Loading results...</p>;

  return (
    <div className="main-content-testresult">
      <AdminHeader />
      <h2 className="page-title-testresult">Test Results</h2>

      {/* Filter bar */}
      <div className="filter-bar-testresult">
        <label>Filter by Skill: </label>
        <select
          value={filterSkill}
          onChange={(e) => setFilterSkill(e.target.value)}
        >
          <option value="all">All</option>
          <option value="listening">Listening</option>
          <option value="reading">Reading</option>
          <option value="writing">Writing</option>
          <option value="speaking">Speaking</option>
        </select>

        <input
          type="text"
          placeholder="Search by Username, Email, or Title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input-testresult"
        />

        <button className="reset-btn-testresult" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper-testresult">
        <table className="result-table-testresult">
          <thead>
            <tr>
              <th>#</th>
              <th>Candidate</th>
              <th>Email</th>
              <th>Skill</th>
              <th>Title</th>
              {(filterSkill === "all" || filterSkill === "writing") && (
                <>
                  <th>Task Achievement</th>
                  <th>Coherence</th>
                  <th>Lexical</th>
                  <th>Grammar</th>
                  <th>Overall Band</th>
                  <th>Feedback</th>
                </>
              )}
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  No results found.
                </td>
              </tr>
            ) : (
              filteredResults.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.username}</td>
                  <td>{r.email}</td>
                  <td>{r.skill}</td>
                  <td>{r.title}</td>

                  {(filterSkill === "all" || filterSkill === "writing") && (
                    <>
                      <td>{r.feedback?.task_achievement || "-"}</td>
                      <td>{r.feedback?.coherence || "-"}</td>
                      <td>{r.feedback?.lexical || "-"}</td>
                      <td>{r.feedback?.grammar || "-"}</td>
                      <td className="overall-score-testresult">
                        {r.feedback?.overall_band || "-"}
                      </td>
                      <td>{r.feedback?.feedback || "-"}</td>
                    </>
                  )}

                  <td>{r.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTestResult;
