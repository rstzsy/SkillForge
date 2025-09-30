import React, { useState, useEffect } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { mockData } from "../ListenPage/ListenPage";
import "./ListenDetail.css";

const ListenDetail = () => {
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
        <span key={`blank-${blankId}`} className="listen-detail-blank">
          <sup className="listen-detail-blank-number">{blankId}</sup>
          <input
            value={answers[blankId] || ""}
            onChange={(e) => handleChange(blankId, e.target.value)}
            className="listen-detail-input"
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
    <div className="listen-detail-container">
      <h2 className="listen-detail-title">{test.title}</h2>

      {/* Audio Player */}
      {test.audio && (
        <div className="listen-detail-audio">
          <audio controls>
            <source src={test.audio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="listen-detail-main">
        <div className="listen-detail-left">
          <div className="listen-detail-passage">{renderPassageInline()}</div>
        </div>

        {test.img && (
          <div className="listen-detail-right">
            {/* image */}
            <div className="listen-detail-right-inner">
              <img
                src={test.img}
                alt={test.title}
                className="listen-detail-image"
              />
              {/* timer */}
              <div className="listen-detail-timer">
                <strong>{formatTime(timeLeft)}</strong>
              </div>
              <button className="listen-detail-submit" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="listen-detail-modal">
          <div className="listen-detail-modal-content">
            <h3>The assignment has been submitted</h3>
            <div className="listen-detail-modal-buttons">
              <button onClick={() => navigate("/")}>Return Course Page</button>
              <button
                onClick={() =>
                  navigate(`/score/${test.id}`, { state: { userAnswers: answers } })
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

export default ListenDetail;
