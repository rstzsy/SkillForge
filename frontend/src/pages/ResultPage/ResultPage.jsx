import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faPen,
  faMicrophone,
  faBook,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "./ResultPage.css";

export default function ResultPage() {
  const [filterSkill, setFilterSkill] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const TASKS_PER_PAGE = 6;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id;
        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `http://localhost:3002/api/results/user/${userId}`
        );
        const data = await res.json();

        const submissions = (data.submissions || []).map((s) => ({
          ...s,
          createdAt: s.createdAt?.toDate
            ? s.createdAt.toDate().toISOString()
            : new Date(s.createdAt || Date.now()).toISOString(),
          skill: s.skill.toLowerCase(),
        }));

        setResults(submissions);
        setSummary(data.summary || {});
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const skills = [
    { key: "all", label: "All", color: "#000000" },
    { key: "writing", label: "Writing", icon: faPen, color: "#f7dbaeff" },
    {
      key: "speaking",
      label: "Speaking",
      icon: faMicrophone,
      color: "#fab4ccff",
    },
    {
      key: "listening",
      label: "Listening",
      icon: faHeadphones,
      color: "#a6d8fcff",
    },
    { key: "reading", label: "Reading", icon: faBook, color: "#b8f5bdff" },
  ];

  const filtered =
    filterSkill === "all"
      ? results
      : results.filter((r) => r.skill === filterSkill);

  const totalPages = Math.ceil(filtered.length / TASKS_PER_PAGE);
  const currentTasks = filtered.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  const calculateSkillScore = (skill) => summary[skill] ?? "-";

  if (loading) return <div>Loading results...</div>;

  return (
    <div className="resultpage-container-userresult">
      {/* Title */}
      <h1 className="page-title-userresult">My Test Results</h1>

      {/* Left Panel */}
      <div className="left-panel-userresult">
        <div className="results-grid-userresult">
          {currentTasks.length === 0 ? (
            <div className="no-results-userresult">
              You haven't completed any tests yet.
            </div>
          ) : (
            currentTasks.map((test) => (
              <div
                key={test.id}
                className={`result-card-userresult ${test.skill}-userresult`}
                onClick={() => setSelectedTest(test)}
              >
                <div className="card-header-userresult">
                  <span className="skill-icon-userresult">
                    {test.skill === "writing" && (
                      <FontAwesomeIcon icon={faPen} color="#f7dbaeff" />
                    )}
                    {test.skill === "speaking" && (
                      <FontAwesomeIcon icon={faMicrophone} color="#fab4ccff" />
                    )}
                    {test.skill === "listening" && (
                      <FontAwesomeIcon icon={faHeadphones} color="#a6d8fcff" />
                    )}
                    {test.skill === "reading" && (
                      <FontAwesomeIcon icon={faBook} color="#b8f5bdff" />
                    )}
                  </span>

                  <span className="skill-name-userresult">{test.skill}</span>
                </div>
                <div className="card-title-userresult">{test.title}</div>
                <div className="card-section-userresult">
                  Section: {test.section}
                </div>
                <div className="card-score-userresult">
                  <strong>{test.score}</strong>
                </div>
                <div className="card-date-userresult">
                  {new Date(test.createdAt).toLocaleDateString()}{" "}
                  {new Date(test.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls-userresult">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel-userresult">
        {/* Custom Dropdown Filter */}
        <div className="custom-dropdown">
          <div
            className="selected-item"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {skills.find((s) => s.key === filterSkill)?.icon && (
              <FontAwesomeIcon
                icon={skills.find((s) => s.key === filterSkill).icon}
                color={skills.find((s) => s.key === filterSkill).color}
              />
            )}
            <span>
              {skills.find((s) => s.key === filterSkill)?.label ?? "All"}
            </span>
          </div>

          {dropdownOpen && (
            <div className="dropdown-list">
              {skills.map((skill) => (
                <div
                  key={skill.key}
                  onClick={() => {
                    setFilterSkill(skill.key);
                    setCurrentPage(1);
                    setDropdownOpen(false);
                  }}
                  className="dropdown-item"
                >
                  {skill.icon && (
                    <FontAwesomeIcon icon={skill.icon} color={skill.color} />
                  )}
                  {skill.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="summary-card-userresult">
          <p>
            <strong>Overall Band Test:</strong>{" "}
            <span className="overband-userresult">
              {summary.overallBand ?? "-"}
            </span>
          </p>
          <div className="skill-summary-userresult">
            <div className="skill-box-userresult writing-userresult">
              Writing: {calculateSkillScore("writing")}
            </div>
            <div className="skill-box-userresult speaking-userresult">
              Speaking: {calculateSkillScore("speaking")}
            </div>
            <div className="skill-box-userresult listening-userresult">
              Listening: {calculateSkillScore("listening")}
            </div>
            <div className="skill-box-userresult reading-userresult">
              Reading: {calculateSkillScore("reading")}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTest && (
        <div className="modal-userresult" onClick={() => setSelectedTest(null)}>
          <div
            className="modal-content-userresult"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {selectedTest.skill === "writing" && (
                <>
                  <FontAwesomeIcon icon={faPen} color="#f7dbaeff" /> Writing
                  Result
                </>
              )}
              {selectedTest.skill === "speaking" && (
                <>
                  <FontAwesomeIcon icon={faMicrophone} color="#fab4ccff" />{" "}
                  Speaking Result
                </>
              )}
              {selectedTest.skill === "listening" && (
                <>
                  <FontAwesomeIcon icon={faHeadphones} color="#a6d8fcff" />{" "}
                  Listening Result
                </>
              )}
              {selectedTest.skill === "reading" && (
                <>
                  <FontAwesomeIcon icon={faBook} color="#b8f5bdff" /> Reading
                  Result
                </>
              )}
            </h3>

            <p>
              <strong>Title:</strong> {selectedTest.title}
            </p>
            <p>
              <strong>Section:</strong> {selectedTest.section}
            </p>
            <p>
              <strong>Score:</strong> {selectedTest.score}
            </p>
            {selectedTest.feedback && (
              <p>
                <strong>Feedback:</strong> {selectedTest.feedback}
              </p>
            )}
            {selectedTest.audioUrl && (
              <audio
                controls
                src={selectedTest.audioUrl}
                className="audio-player-userresult"
              />
            )}
            <button
              className="close-btn-userresult"
              onClick={() => setSelectedTest(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
