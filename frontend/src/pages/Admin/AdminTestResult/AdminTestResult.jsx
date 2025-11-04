import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../../firebase/config";
import "./AdminTestResult.css";

const AdminTestResult = () => {
  const [filterSkill, setFilterSkill] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [viewMode, setViewMode] = useState("grouped");

  const getOverallScore = (result) => {
    if (result.skill === "writing") {
      return parseFloat(result.feedback?.overall_band) || 0;
    }
    if (result.skill === "speaking") {
      return parseFloat(result.feedback?.overall_band || result.feedback?.ai_score) || 0;
    }
    if (result.skill === "listening" || result.skill === "reading") {
      return result.score || 0;
    }
    return 0;
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resultsData = [];

        // 🔹 Fetch Writing Results
        const feedbackSnapshot = await getDocs(collection(db, "writing_submissions"));
        for (const fbDoc of feedbackSnapshot.docs) {
          const fbData = fbDoc.data();

          let username = "Unknown User";
          let email = "N/A";
          let userId = fbData.user_id || "unknown";
          
          if (fbData.user_id) {
            const userRef = doc(db, "users", fbData.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              username = userData.userName || userData.username || userData.user_name || "Unnamed";
              email = userData.email || "No email";
            }
          }

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
            userId,
            username,
            email,
            title,
            skill: "writing",
            feedback: fbData.ai_feedback,
            createdAt: fbData.created_at?.toDate
              ? fbData.created_at.toDate()
              : new Date(fbData.created_at),
          });
        }

        // 🔹 Fetch Speaking Question Submissions
        const speakingSnapshot = await getDocs(collection(db, "speaking_question_submissions"));
        
        for (const spDoc of speakingSnapshot.docs) {
          const spData = spDoc.data();

          let username = "Unknown User";
          let email = "N/A";
          let userId = spData.user_id || "unknown";
          
          if (spData.user_id) {
            try {
              const userRef = doc(db, "users", spData.user_id);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                username = userData.userName || userData.username || userData.user_name || "Unnamed";
                email = userData.email || "No email";
              }
            } catch (err) {
              console.error("Error fetching user:", err);
            }
          }

          let title = "Unknown Speaking Task";
          if (spData.speaking_id || spData.speaking_practices_id) {
            try {
              const speakingId = spData.speaking_id || spData.speaking_practices_id;
              const taskRef = doc(db, "speaking_practices", speakingId);
              const taskSnap = await getDoc(taskRef);
              
              if (taskSnap.exists()) {
                const taskData = taskSnap.data();
                title = taskData.topic || taskData.title || "Untitled";
              }
            } catch (err) {
              console.error("Error fetching speaking practice:", err);
            }
          }

          let questionText = spData.question_text || "N/A";
          
          if (spData.question_id && (spData.speaking_id || spData.speaking_practices_id)) {
            try {
              const speakingId = spData.speaking_id || spData.speaking_practices_id;
              const qRef = doc(db, "speaking_practices", speakingId, "questions", spData.question_id);
              const qSnap = await getDoc(qRef);
              
              if (qSnap.exists()) {
                questionText = qSnap.data().question_text || questionText;
              }
            } catch (err) {
              console.error("Error fetching question:", err);
            }
          }

          let feedback = spData.feedback;
          if (typeof feedback === "string") {
            try {
              feedback = JSON.parse(feedback);
            } catch (e) {
              console.warn("Could not parse feedback JSON:", e);
            }
          }

          resultsData.push({
            id: spDoc.id,
            userId,
            username,
            email,
            title,
            questionText,
            skill: "speaking",
            type: "question",
            transcript: spData.transcript || "N/A",
            audioUrl: spData.audio_url,
            feedback,
            createdAt: spData.created_at?.toDate
              ? spData.created_at.toDate()
              : new Date(spData.created_at),
          });
        }

        // 🔹 Fetch Speaking Submissions (Topic Complete)
        const speakingSubmissionsSnapshot = await getDocs(collection(db, "speaking_submissions"));
        
        for (const subDoc of speakingSubmissionsSnapshot.docs) {
          const subData = subDoc.data();

          let username = "Unknown User";
          let email = "N/A";
          let userId = subData.user_id || "unknown";
          
          if (subData.user_id) {
            try {
              const userRef = doc(db, "users", subData.user_id);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                username = userData.userName || userData.username || userData.user_name || "Unnamed";
                email = userData.email || "No email";
              }
            } catch (err) {
              console.error("Error fetching user:", err);
            }
          }

          let title = "Unknown Speaking Topic";
          if (subData.speaking_id) {
            try {
              const taskRef = doc(db, "speaking_practices", subData.speaking_id);
              const taskSnap = await getDoc(taskRef);
              
              if (taskSnap.exists()) {
                const taskData = taskSnap.data();
                title = taskData.topic || taskData.title || "Untitled";
              }
            } catch (err) {
              console.error("Error fetching speaking practice:", err);
            }
          }

          resultsData.push({
            id: subDoc.id,
            userId,
            username,
            email,
            title: `${title} - Complete Topic`,
            skill: "speaking",
            type: "topic",
            feedback: {
              overall_band: subData.ai_score,
              pronunciation_score: subData.pronunciation_score,
              fluency_score: subData.fluency_score,
              grammar_score: subData.grammar_score,
              lexical_score: subData.vocab_score,
              feedback: subData.feedback,
            },
            createdAt: subData.submitted_at?.toDate
              ? subData.submitted_at.toDate()
              : new Date(subData.submitted_at || Date.now()),
          });
        }

        // 🔹 Fetch Listening Submissions
        const listeningSnapshot = await getDocs(collection(db, "listening_submissions"));
        
        for (const lisDoc of listeningSnapshot.docs) {
          const lisData = lisDoc.data();

          let username = "Unknown User";
          let email = "N/A";
          let userId = lisData.user_id || "unknown";
          
          if (lisData.user_id) {
            try {
              const userRef = doc(db, "users", lisData.user_id);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                username = userData.userName || userData.username || userData.user_name || "Unnamed";
                email = userData.email || "No email";
              }
            } catch (err) {
              console.error("Error fetching user:", err);
            }
          }

          let title = "Unknown Listening Task";
          if (lisData.practice_id) {
            try {
              const taskRef = doc(db, "listening_practices", lisData.practice_id);
              const taskSnap = await getDoc(taskRef);
              
              if (taskSnap.exists()) {
                const taskData = taskSnap.data();
                title = taskData.title || "Untitled";
              }
            } catch (err) {
              console.error("Error fetching listening practice:", err);
            }
          }

          resultsData.push({
            id: lisDoc.id,
            userId,
            username,
            email,
            title,
            skill: "listening",
            score: lisData.score || 0,
            total: lisData.total || 0,
            userAnswers: lisData.user_answer || {},
            correctAnswers: lisData.correct_answers || {},
            aiFeedback: lisData.ai_feedback,
            durationSeconds: lisData.duration_seconds || 0,
            createdAt: lisData.submitted_at?.toDate
              ? lisData.submitted_at.toDate()
              : new Date(lisData.submitted_at || Date.now()),
          });
        }

        // 🔹 Fetch Reading Submissions
        const readingSnapshot = await getDocs(collection(db, "reading_submissions"));
        
        for (const readDoc of readingSnapshot.docs) {
          const readData = readDoc.data();

          let username = "Unknown User";
          let email = "N/A";
          let userId = readData.user_id || "unknown";
          
          if (readData.user_id) {
            try {
              const userRef = doc(db, "users", readData.user_id);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                username = userData.userName || userData.username || userData.user_name || "Unnamed";
                email = userData.email || "No email";
              }
            } catch (err) {
              console.error("Error fetching user:", err);
            }
          }

          let title = "Unknown Reading Task";
          if (readData.practice_id) {
            try {
              const taskRef = doc(db, "reading_practices", readData.practice_id);
              const taskSnap = await getDoc(taskRef);
              
              if (taskSnap.exists()) {
                const taskData = taskSnap.data();
                title = taskData.title || "Untitled";
              }
            } catch (err) {
              console.error("Error fetching reading practice:", err);
            }
          }

          resultsData.push({
            id: readDoc.id,
            userId,
            username,
            email,
            title,
            skill: "reading",
            score: readData.score || 0,
            total: readData.total || 0,
            userAnswers: readData.user_answers || {},
            correctAnswers: readData.correct_answers || {},
            aiFeedback: readData.ai_feedback,
            timeSpent: readData.time_spent || 0,
            createdAt: readData.submitted_at?.toDate
              ? readData.submitted_at.toDate()
              : new Date(readData.submitted_at || Date.now()),
          });
        }

        console.log("✅ Total results loaded:", resultsData.length);
        setResults(resultsData);
      } catch (error) {
        console.error("❌ Error fetching test results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Filter results
  const filteredResults = results.filter((r) => {
    const s = search.toLowerCase();
    const matchesSearch =
      r.username.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.title.toLowerCase().includes(s);

    if (filterSkill === "all") return matchesSearch;
    return matchesSearch && r.skill === filterSkill;
  });

  // Sort filtered results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "date") {
      return b.createdAt - a.createdAt;
    }
    if (sortBy === "skill") {
      return a.skill.localeCompare(b.skill);
    }
    if (sortBy === "score") {
      const scoreA = getOverallScore(a);
      const scoreB = getOverallScore(b);
      return scoreB - scoreA;
    }
    return 0;
  });

  // Group results by user
  const groupedByUser = () => {
    const grouped = {};
    sortedResults.forEach((r) => {
      const key = r.userId;
      if (!grouped[key]) {
        grouped[key] = {
          userId: r.userId,
          username: r.username,
          email: r.email,
          tests: [],
        };
      }
      grouped[key].tests.push(r);
    });

    return Object.values(grouped).sort((a, b) => {
      return b.tests.length - a.tests.length;
    });
  };

  const handleReset = () => {
    setFilterSkill("all");
    setSearch("");
    setSortBy("date");
  };

  const getFullAudioURL = (audio_url) => {
    if (!audio_url) return null;
    return audio_url.startsWith("http")
      ? audio_url
      : audio_url.startsWith("/uploads/")
        ? `http://localhost:3002${audio_url}`
        : `http://localhost:3002/uploads/audio/${audio_url}`;
  };

  const handlePlayAudio = (audioUrl) => {
    const fullUrl = getFullAudioURL(audioUrl);
    setSelectedAudio(fullUrl);
  };

  const toggleUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (loading) return <div className="loading">⏳ Loading results...</div>;

  const groupedUsers = groupedByUser();

  return (
    <div className="main-content-testresult">
      <AdminHeader />
      <h2 className="page-title-testresult">📊 Test Results Management</h2>

      {/* Control Bar */}
      <div className="control-bar-testresult">
        <div className="filter-section-testresult">
          <label className="label-testresult">View Mode:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="select-testresult"
          >
            <option value="grouped">👥 Grouped by User</option>
            <option value="list">📋 List View</option>
          </select>

          <label className="label-testresult">Filter Skill:</label>
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="select-testresult"
          >
            <option value="all">All Skills</option>
            <option value="writing">✍️ Writing</option>
            <option value="speaking">🎤 Speaking</option>
            <option value="listening">🎧 Listening</option>
            <option value="reading">📖 Reading</option>
          </select>

          <label className="label-testresult">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-testresult"
          >
            <option value="date">📅 Date (Newest First)</option>
            <option value="skill">📚 Skill (A-Z)</option>
            <option value="score">⭐ Score (Highest First)</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="🔍 Search by name, email, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input-testresult"
        />

        <button onClick={handleReset} className="reset-btn-testresult">
          🔄 Reset
        </button>
      </div>

      {/* Results Display */}
      {viewMode === "grouped" ? (
        <div className="grouped-container-testresult">
          {groupedUsers.length === 0 ? (
            <div className="no-results-testresult">No results found.</div>
          ) : (
            groupedUsers.map((user) => (
              <div key={user.userId} className="user-card-testresult">
                <div
                  className="user-header-testresult"
                  onClick={() => toggleUser(user.userId)}
                >
                  <div className="user-info-testresult">
                    <div className="user-name-testresult">
                      <FontAwesomeIcon icon={expandedUser === user.userId ? faChevronDown : faChevronRight} /> 
                      {user.username}
                    </div>
                    <div className="user-email-testresult">{user.email}</div>
                  </div>
                  <div className="test-count-testresult">
                    {user.tests.length} test{user.tests.length > 1 ? "s" : ""}
                  </div>
                </div>

                {expandedUser === user.userId && (
                  <div className="tests-container-testresult">
                    {user.tests.map((test, idx) => (
                      <div key={test.id} className="test-card-testresult">
                        <div className="test-header-testresult">
                          <span className="test-number-testresult">#{idx + 1}</span>
                          <span className={`skill-badge-testresult ${test.skill}`}>
                            {test.skill === "writing" && "✍️ Writing"}
                            {test.skill === "speaking" && "🎤 Speaking"}
                            {test.skill === "listening" && "🎧 Listening"}
                            {test.skill === "reading" && "📖 Reading"}
                          </span>
                          {test.type === "topic" && (
                            <span className="topic-complete-badge">🏆 Complete</span>
                          )}
                          <span className="test-date-testresult">
                            {test.createdAt.toLocaleDateString()} {test.createdAt.toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="test-title-testresult">📝 {test.title}</div>

                        {/* Writing Results */}
                        {test.skill === "writing" && (
                          <div className="scores-grid-testresult">
                            <div className="score-item-testresult">
                              <span>Task Achievement:</span>
                              <strong>{test.feedback?.task_achievement || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Coherence:</span>
                              <strong>{test.feedback?.coherence || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Lexical:</span>
                              <strong>{test.feedback?.lexical || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Grammar:</span>
                              <strong>{test.feedback?.grammar || "-"}</strong>
                            </div>
                            <div className="score-item-testresult overall-score-item">
                              <span>Overall Band:</span>
                              <strong>{test.feedback?.overall_band || "-"}</strong>
                            </div>
                            <div className="feedback-text-testresult">
                              <strong>Feedback:</strong> {test.feedback?.feedback || "-"}
                            </div>
                          </div>
                        )}

                        {/* Speaking Question Results */}
                        {test.skill === "speaking" && test.type === "question" && (
                          <div className="scores-grid-testresult">
                            <div className="question-box-testresult">
                              <strong>Question:</strong> {test.questionText}
                            </div>
                            <div className="transcript-box-testresult">
                              <strong>Transcript:</strong> {test.transcript}
                            </div>
                            <div className="score-item-testresult">
                              <span>Pronunciation:</span>
                              <strong>{test.feedback?.pronunciation_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Fluency:</span>
                              <strong>{test.feedback?.fluency_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Grammar:</span>
                              <strong>{test.feedback?.grammar_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Vocabulary:</span>
                              <strong>{test.feedback?.lexical_score || test.feedback?.vocab_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult overall-score-item">
                              <span>Overall Band:</span>
                              <strong>{test.feedback?.overall_band || test.feedback?.ai_score || "-"}</strong>
                            </div>
                            {test.audioUrl && (
                              <button
                                onClick={() => handlePlayAudio(test.audioUrl)}
                                className="audio-btn-testresult"
                              >
                                🔊 Play Audio
                              </button>
                            )}
                          </div>
                        )}

                        {/* Speaking Topic Results */}
                        {test.skill === "speaking" && test.type === "topic" && (
                          <div className="scores-grid-testresult">
                            <div className="topic-summary-box">
                              <strong>🏆 Topic Completed - Average Score</strong>
                              <p>This is the average score across all questions in this topic.</p>
                            </div>
                            <div className="score-item-testresult">
                              <span>Pronunciation:</span>
                              <strong>{test.feedback?.pronunciation_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Fluency:</span>
                              <strong>{test.feedback?.fluency_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Grammar:</span>
                              <strong>{test.feedback?.grammar_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Vocabulary:</span>
                              <strong>{test.feedback?.lexical_score || "-"}</strong>
                            </div>
                            <div className="score-item-testresult overall-score-item">
                              <span>Overall Band:</span>
                              <strong>{test.feedback?.overall_band || "-"}</strong>
                            </div>
                            <div className="feedback-text-testresult">
                              <strong>Summary:</strong> {test.feedback?.feedback || "-"}
                            </div>
                          </div>
                        )}

                        {/* Listening Results */}
                        {test.skill === "listening" && (
                          <div className="scores-grid-testresult">
                            <div className="score-item-testresult overall-score-item">
                              <span>Score:</span>
                              <strong>{test.score} / {test.total}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Duration:</span>
                              <strong>{Math.floor(test.durationSeconds / 60)}m {test.durationSeconds % 60}s</strong>
                            </div>
                            {test.aiFeedback?.feedback && (
                              <div className="feedback-text-testresult">
                                <strong>AI Feedback:</strong> {test.aiFeedback.feedback}
                              </div>
                            )}
                            {test.aiFeedback?.detailed_feedback && (
                              <div className="detailed-feedback-box">
                                <strong>Detailed Feedback:</strong>
                                {Object.entries(test.aiFeedback.detailed_feedback).map(([key, value]) => (
                                  <div key={key}>
                                    <em>Blank {key}:</em> {value}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reading Results */}
                        {test.skill === "reading" && (
                          <div className="scores-grid-testresult">
                            <div className="score-item-testresult overall-score-item">
                              <span>Score:</span>
                              <strong>{test.score} / {test.total}</strong>
                            </div>
                            <div className="score-item-testresult">
                              <span>Time Spent:</span>
                              <strong>{test.timeSpent} minutes</strong>
                            </div>
                            {test.aiFeedback?.feedback && (
                              <div className="feedback-text-testresult">
                                <strong>AI Feedback:</strong> {test.aiFeedback.feedback}
                              </div>
                            )}
                            {test.aiFeedback?.detailed_feedback && (
                              <div className="detailed-feedback-box">
                                <strong>Detailed Feedback:</strong>
                                {Object.entries(test.aiFeedback.detailed_feedback).map(([key, value]) => (
                                  <div key={key}>
                                    <em>Blank {key}:</em> {value}
                                  </div>
                                ))}
                              </div>
                            )}
                            {test.aiFeedback?.suggestions?.length > 0 && (
                              <div className="suggestions-box">
                                <strong>Suggestions:</strong>
                                <ul>
                                  {test.aiFeedback.suggestions.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        // List View
        <div className="table-wrapper-testresult">
          <table className="result-table-testresult">
            <thead>
              <tr>
                <th>#</th>
                <th>Candidate</th>
                <th>Email</th>
                <th>Skill</th>
                <th>Type</th>
                <th>Title</th>
                <th>Overall Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No results found.
                  </td>
                </tr>
              ) : (
                sortedResults.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.username}</td>
                    <td>{r.email}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.skill}</td>
                    <td>
                      {r.type === "topic" ? (
                        <span className="topic-badge-table">🏆 Complete</span>
                      ) : r.type === "question" ? (
                        <span className="question-badge-table">💬 Question</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{r.title}</td>
                    <td className="overall-score-testresult">
                      {r.skill === "writing" && (r.feedback?.overall_band || "-")}
                      {r.skill === "speaking" && (r.feedback?.overall_band || r.feedback?.ai_score || "-")}
                      {r.skill === "listening" && `${r.score}/${r.total}`}
                      {r.skill === "reading" && `${r.score}/${r.total}`}
                    </td>
                    <td>{r.createdAt.toLocaleString()}</td>
                    <td>
                      {r.audioUrl && (
                        <button
                          onClick={() => handlePlayAudio(r.audioUrl)}
                          className="play-audio-btn"
                        >
                          🔊
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audio Modal */}
      {selectedAudio && (
        <div className="audio-modal" onClick={() => setSelectedAudio(null)}>
          <div className="audio-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔊 Student's Answer</h3>
            <audio src={selectedAudio} controls autoPlay className="audio-player" />
            <button onClick={() => setSelectedAudio(null)} className="close-btn-modal">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestResult;