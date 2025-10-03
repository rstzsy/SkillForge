import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import React, { useState } from "react";
import "./AdminTestResult.css";

const testResults = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "vana@example.com",
    listening: { correct: 35, wrong: 5, skipped: 0, score: 7.5 },
    reading: { correct: 36, wrong: 3, skipped: 1, score: 8.0 },
    writing: { correct: 2, wrong: 1, skipped: 0, score: 6.5 },
    speaking: { correct: 3, wrong: 1, skipped: 0, score: 7.0 },
    overall: 7.3,
    duration: "2h 45m",
    date: "2025-09-15",
  },
  {
    id: 2,
    name: "Tran Thi B",
    email: "thib@example.com",
    listening: { correct: 28, wrong: 10, skipped: 2, score: 6.0 },
    reading: { correct: 30, wrong: 8, skipped: 2, score: 6.5 },
    writing: { correct: 1, wrong: 2, skipped: 0, score: 5.5 },
    speaking: { correct: 2, wrong: 2, skipped: 0, score: 6.0 },
    overall: 6.0,
    duration: "2h 30m",
    date: "2025-09-18",
  },
];

const AdminTestResult = () => {
  const [filterSkill, setFilterSkill] = useState("all");
  const [search, setSearch] = useState("");

  const handleReset = () => {
    setFilterSkill("all");
    setSearch("");
  };

  const renderSkill = (skill) => {
    return (
      <>
        <td>{skill.correct}</td>
        <td>{skill.wrong}</td>
        <td>{skill.skipped}</td>
        <td>{skill.score}</td>
      </>
    );
  };

  // chỉ lọc theo search (id, email, name)
  const filteredResults = testResults.filter((result) => {
    const searchLower = search.toLowerCase();
    return (
      result.id.toString().includes(searchLower) ||
      result.email.toLowerCase().includes(searchLower) ||
      result.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="main-content-testresult">
      <AdminHeader />
      <h2 className="page-title-testresult">Test Results</h2>

      {/* Filter + Search + Reset */}
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
          placeholder="Search by ID, Email or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input-testresult"
        />

        <button className="reset-btn-testresult" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="table-wrapper-testresult">
        <table className="result-table-testresult">
          <thead>
            <tr>
              <th>#</th>
              <th>Candidate</th>
              <th>Email</th>

              {(filterSkill === "all" || filterSkill === "listening") && (
                <>
                  <th>Listening Correct</th>
                  <th>Listening Wrong</th>
                  <th>Listening Skipped</th>
                  <th>Listening Score</th>
                </>
              )}

              {(filterSkill === "all" || filterSkill === "reading") && (
                <>
                  <th>Reading Correct</th>
                  <th>Reading Wrong</th>
                  <th>Reading Skipped</th>
                  <th>Reading Score</th>
                </>
              )}

              {(filterSkill === "all" || filterSkill === "writing") && (
                <>
                  <th>Writing Correct</th>
                  <th>Writing Wrong</th>
                  <th>Writing Skipped</th>
                  <th>Writing Score</th>
                </>
              )}

              {(filterSkill === "all" || filterSkill === "speaking") && (
                <>
                  <th>Speaking Correct</th>
                  <th>Speaking Wrong</th>
                  <th>Speaking Skipped</th>
                  <th>Speaking Score</th>
                </>
              )}

              <th>Overall</th>
              <th>Duration</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={result.id}>
                <td>{index + 1}</td>
                <td>{result.name}</td>
                <td>{result.email}</td>

                {(filterSkill === "all" || filterSkill === "listening") &&
                  renderSkill(result.listening)}

                {(filterSkill === "all" || filterSkill === "reading") &&
                  renderSkill(result.reading)}

                {(filterSkill === "all" || filterSkill === "writing") &&
                  renderSkill(result.writing)}

                {(filterSkill === "all" || filterSkill === "speaking") &&
                  renderSkill(result.speaking)}

                <td className="overall-score-testresult">{result.overall}</td>
                <td>{result.duration}</td>
                <td>{result.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTestResult;
