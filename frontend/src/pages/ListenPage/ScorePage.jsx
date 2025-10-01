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

  // dap an dung
  const correctAnswers = test.correctAnswers || {};
  // dap an cua user
  const userAnswers = location.state?.userAnswers || {};

  let score = 0;
  const total = Object.keys(correctAnswers).length;
  //tinh diem
  Object.keys(correctAnswers).forEach((key) => {
    if (
      userAnswers[key] &&
      userAnswers[key].trim().toLowerCase() ===
        correctAnswers[key].trim().toLowerCase()
    ) {
      score++;
    }
  });

  // feedback AI 
  const percent = (score / total) * 100;
  let feedback = "";

  if (percent >= 80) {
    feedback = "🔥 Xuất sắc! Bạn đọc hiểu rất tốt, chỉ cần luyện thêm để đạt độ chính xác tuyệt đối.";
  } else if (percent >= 50) {
    feedback = "👍 Khá ổn! Bạn đã nắm được ý chính, nhưng cần tập trung cải thiện chi tiết và từ vựng.";
  } else {
    feedback = "⚠️ Cần cải thiện! Bạn nên luyện kỹ năng scanning & skimming để bắt ý chính nhanh hơn.";
  }

  return (
    <div className="score-page-layout">
      {/* left side */}
      <div className="ai-feedback-lis">
        <h3>AI Feedback</h3>
        <p>{feedback}</p>
      </div>

      {/* right side */}
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
    </div>
  );
};

export default ScorePage;
