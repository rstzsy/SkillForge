import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { mockData } from "../ListenPage/ListenPage";
import "./ScorePage.css";

const ScorePage = () => {
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
    <div className="score-container-lis">
      <h2 className="score-title-lis">{test.title} - Result</h2>

      <div className="score-summary-lis">
        <p>
          <strong>Score: {score}</strong> / {total}
        </p>
      </div>

      <div className="score-detail-lis">
        {Object.keys(correctAnswers).map((num) => (
          <div key={num} className="score-item-lis">
            <span className="score-num-lis">({num})</span>
            <span
              className={`score-user-lis ${
                userAnswers[num] &&
                userAnswers[num].trim().toLowerCase() ===
                  correctAnswers[num].trim().toLowerCase()
                  ? "correct-lis"
                  : "wrong-lis"
              }`}
            >
              Your answer: {userAnswers[num] || "—"}
            </span>
            <span className="score-correct-lis">
              Correct: {correctAnswers[num]}
            </span>
          </div>
        ))}
      </div>

      <div className="score-buttons-lis">
        <button onClick={() => navigate("/")}>Return Home Page</button>
        <button onClick={() => navigate("/listen")}>Try Another Test</button>
      </div>
    </div>
  );
};

export default ScorePage;
