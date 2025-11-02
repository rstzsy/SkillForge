import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ScorePage.css";

const ScorePage = () => {
  const { id } = useParams(); // submissionId
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const res = await fetch(
          `http://localhost:3002/api/user/listen/submit/grade/${id}`
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch grade");
        }

        const data = await res.json();
        setResult(data.data);
      } catch (err) {
        console.error("Error fetching grade:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrade();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!result) return <p>No result found.</p>;

  const {
    score,
    total,
    userAnswers,
    correctAnswers,
    practiceTitle,
    aiFeedback,
  } = result;
  const feedbackText = aiFeedback?.feedback || "No AI feedback available";

  return (
    <div className="score-page-layout">
      {/* left side */}
      <div className="ai-feedback-lis">
        <h3>AI Feedback</h3>
        <p>{feedbackText}</p>
        <div className="ai-detailed-feedback">
          {aiFeedback?.detailed_feedback &&
            Object.keys(aiFeedback.detailed_feedback).map((key) => (
              <div key={key}>
                <strong>Blank {key}:</strong>{" "}
                {aiFeedback.detailed_feedback[key]}
              </div>
            ))}
        </div>
      </div>

      {/* right side */}
      <div className="score-container-lis">
        <h2 className="score-title-lis">{practiceTitle} - Result</h2>

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
                  userAnswers[num]?.trim().toLowerCase() ===
                  correctAnswers[num]?.trim().toLowerCase()
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
