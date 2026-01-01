import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ScoreWritePage.css";

const ScoreWritePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const aiResult = location.state?.aiResult;
  const userWriting = location.state?.userWriting;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userWriting || !aiResult) {
      navigate("/");
      return;
    }
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [userWriting, aiResult, navigate]);

  if (loading) return <p className="loading">Analyzing your writing with Gemini AI...</p>;
  if (!aiResult) return <p>No AI result available.</p>;

  const fullWriting = Object.values(userWriting).join("\n\n");

  const errors = aiResult.errors || [];
  const highlightedWriting = errors.reduce((text, err) => {
    const escapedSentence = err.sentence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSentence, "g");
    return text.replace(
      regex,
      `<mark class="error-highlight" title="Correction: ${err.correction}">${err.sentence}</mark>`
    );
  }, fullWriting);

  return (
    <div className="score-page-container">
      <h2 className="score-title">AI Writing Feedback</h2>

      {aiResult.image_analysis && (
        <div className="score-image-analysis">
          <h3>Image Analysis</h3>
          <p>{aiResult.image_analysis}</p>
        </div>
      )}

      <div className="score-summary">
        <h3>Overall Band: {aiResult.overall_band || "N/A"}</h3>
        <div className="score-grid">
          <div className="score-item">
            <span>Task Achievement</span>
            <strong>{aiResult.task_achievement || "-"}</strong>
          </div>
          <div className="score-item">
            <span>Coherence & Cohesion</span>
            <strong>{aiResult.coherence || "-"}</strong>
          </div>
          <div className="score-item">
            <span>Lexical Resource</span>
            <strong>{aiResult.lexical || "-"}</strong>
          </div>
          <div className="score-item">
            <span>Grammar Accuracy</span>
            <strong>{aiResult.grammar || "-"}</strong>
          </div>
        </div>
      </div>

      {/* Feedback tổng */}
      <div className="score-feedback">
        <h3>General Feedback</h3>
        <p>{aiResult.feedback}</p>
      </div>

      {/* Bài viết người dùng */}
      <div className="score-user-writing">
        <h3>Your Writing (with highlighted errors)</h3>
        <div
          className="writing-content"
          dangerouslySetInnerHTML={{ __html: highlightedWriting }}
        ></div>
      </div>

      {/* Lỗi chi tiết */}
      {errors.length > 0 && (
        <div className="score-errors">
          <h3>Detected Mistakes</h3>
          {errors.map((err, i) => (
            <div key={i} className="error-item">
              <p className="error-wrong">❌ {err.sentence}</p>
              <p className="error-correct">✅ {err.correction}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gợi ý */}
      {aiResult.suggestions && (
        <div className="score-suggestions">
          <h3>Suggestions for Improvement</h3>
          <ul>
            {aiResult.suggestions.map((sug, i) => (
              <li key={i}>{sug}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Nút điều hướng */}
      <div className="score-buttons">
        <button onClick={() => navigate("/")}>Return to Course</button>
        <button onClick={() => navigate(-1)}>Write Again</button>
      </div>
    </div>
  );
};

export default ScoreWritePage;
