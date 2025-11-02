import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ScoreReadPage.css";

const ScoreReadPage = () => {
  const { id: submissionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // score and ai feedback
  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3002/api/user/read/submit/grade/${submissionId}`
        );

        const result = res.data.data;
        setData(result);
      } catch (err) {
        console.error("Error fetching score:", err);
        setError("Failed to load score.");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [submissionId]);

  if (loading) return <p>Loading score...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>No data found.</p>;

  const {
    practiceTitle,
    score,
    total,
    userAnswers,
    correctAnswers,
    aiFeedback,
  } = data;

  return (
    <div className="score-page-layout-read">
      {/* AI feedback */}
      <div className="ai-feedback-read">
        <h3>AI Feedback</h3>
        <p>{aiFeedback?.feedback || "No feedback available"}</p>
        {aiFeedback?.detailed_feedback && (
          <div>
            <h4>Detailed Feedback:</h4>
            {Object.keys(aiFeedback.detailed_feedback).map((num) => (
              <p key={num}>
                ({num}): {aiFeedback.detailed_feedback[num]}
              </p>
            ))}
          </div>
        )}
        {aiFeedback?.suggestions?.length > 0 && (
          <div>
            <h4>Suggestions:</h4>
            <ul>
              {aiFeedback.suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Result */}
      <div className="score-container-read">
        <h2 className="score-title-read">{practiceTitle} - Result</h2>

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
    </div>
  );
};

export default ScoreReadPage;
