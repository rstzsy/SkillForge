import React, { useState, useEffect } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { mockData } from "../ReadPage/ReadPage";
import "./ReadDetail.css";

const ReadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = mockData.find((t) => t.id === Number(id));

  // State
  const [answers, setAnswers] = useState({});
  const initialTime = test?.timeLimit ? test.timeLimit * 60 : 0; // thoi gian tinh bang giay
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [showModal, setShowModal] = useState(false);

  // Countdown Timer
  useEffect(() => {
    if (!test || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time is up! Bài sẽ tự động nộp.");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeLeft]);

  if (!test) return <p>Test not found!</p>;

  // Handle input change
  const handleChange = (blankId, value) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  // Render passage with inline inputs
  const renderPassageInline = () => {
    const regex = /\((\d+)\) ___/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(test.passage)) !== null) {
      const index = match.index;
      const blankId = Number(match[1]);

      parts.push(test.passage.slice(lastIndex, index));

      parts.push(
        <span key={`blank-${blankId}`} className="read-detail-blank">
          <sup className="read-detail-blank-number">{blankId}</sup>
          <input
            value={answers[blankId] || ""}
            onChange={(e) => handleChange(blankId, e.target.value)}
            className="read-detail-input"
          />
        </span>
      );

      lastIndex = index + match[0].length;
    }

    parts.push(test.passage.slice(lastIndex));

    return parts;
  };


  // Handle submit
  const handleSubmit = () => {
    console.log("User answers:", answers);
    setShowModal(true);
  };

  // Format time MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="read-detail-container">
      <h2 className="read-detail-title">{test.title}</h2>

      <div className="read-detail-main">
        <div className="read-detail-left">
            <h3>Reading Passage</h3>
            <div className="read-detail-full-passage">
                {test.passageText.split("\n").map((line, index) => {
                    const trimmed = line.trim();
                    return trimmed ? <p key={index}>{trimmed}</p> : null;
                })}
            </div>
        </div>

        {test.img && (
            <div className="read-detail-right">
            <div className="read-detail-right-inner">
                <div className="read-detail-passage">{renderPassageInline()}</div>
            </div>
            </div>
        )}
        </div>

        {/* Timer + Submit*/}
        <div className="read-detail-bottom-controls" style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="read-detail-timer">
                <strong>{formatTime(timeLeft)}</strong>
            </div>
            <button className="read-detail-submit" onClick={handleSubmit}>
                Submit
            </button>
        </div>


      {/* Modal */}
      {showModal && (
        <div className="read-detail-modal">
          <div className="read-detail-modal-content">
            <h3>The assignment has been submitted</h3>
            <div className="read-detail-modal-buttons">
              <button onClick={() => navigate("/")}>Return Course Page</button>
              <button
                onClick={() =>
                  navigate(`/score/read/${test.id}`, { state: { userAnswers: answers } })
                }
              >
                View Score
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadDetail;
