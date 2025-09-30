import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { mockData } from "../ReadPage/ReadPage";
import "./ScoreReadPage.css";

const ScoreReadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const test = mockData.find((t) => t.id === Number(id));
  if (!test) return <p>Test not found!</p>;

  // lay dap an tu data o trang listen page
  const correctAnswers = test.correctAnswers || {};

  // ;ay dap an cua user
  const userAnswers = location.state?.userAnswers || {};

  // tinh diem
  let score = 0;
  const total = Object.keys(correctAnswers).length;

  Object.keys(correctAnswers).forEach((key) => {
    if (
      userAnswers[key] &&
      userAnswers[key].trim().toLowerCase() ===
        correctAnswers[key].trim().toLowerCase()
    ) {
      score++;
    }
  });

  return (
    <div className="score-container-read">
      <h2 className="score-title-read">{test.title} - Result</h2>

      <div className="score-summary-read">
        <p>
          <strong>Score: {score}</strong> / {total}
        </p>
      </div>

      <div className="score-detail-read">
        {Object.keys(correctAnswers).map((num) => (
          <div key={num} className="score-item-read">
            <span className="score-num-read">({num})</span>
            <span
              className={`score-user-read ${
                userAnswers[num] &&
                userAnswers[num].trim().toLowerCase() ===
                  correctAnswers[num].trim().toLowerCase()
                  ? "correct-read"
                  : "wrong-read"
              }`}
            >
              Your answer: {userAnswers[num] || "—"}
            </span>
            <span className="score-correct-read">
              Correct: {correctAnswers[num]}
            </span>
          </div>
        ))}
      </div>

      <div className="score-buttons-read">
        <button onClick={() => navigate("/")}>Return Home Page</button>
        <button onClick={() => navigate("/read")}>Try Another Test</button>
      </div>
    </div>
  );
};

export default ScoreReadPage;
