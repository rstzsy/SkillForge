import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ScoreWritePage.css";

const ScoreWritePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userWriting = location.state?.userWriting;

  const [loading, setLoading] = useState(true);
  const [mockResult, setMockResult] = useState(null);

  useEffect(() => {
    if (!userWriting) {
      navigate("/");
      return;
    }

    // 🔹 Giả lập AI chấm điểm (2 giây)
    setTimeout(() => {
      setMockResult({
        overall_band: 7.0,
        task_achievement: 7.5,
        coherence: 6.5,
        lexical: 7.0,
        grammar: 6.0,
        feedback:
          "Your essay demonstrates a clear understanding of the topic with good organization. However, some grammatical mistakes and limited vocabulary range reduce clarity.",
        errors: [
          {
            sentence: "The chart show the number of people who travel abroad.",
            correction: "The chart shows the number of people who travel abroad.",
          },
          {
            sentence: "People is more interested in traveling now.",
            correction: "People are more interested in traveling now.",
          },
        ],
        suggestions: [
          "Use a wider range of complex sentence structures.",
          "Pay more attention to subject–verb agreement.",
          "Include more linking words to improve cohesion.",
        ],
      });
      setLoading(false);
    }, 2000);
  }, [userWriting, navigate]);

  if (loading) return <p className="loading">Analyzing your writing...</p>;
  if (!mockResult) return <p>No result available.</p>;

  // 🔹 Ghép toàn bộ bài viết
  const fullWriting = Object.values(userWriting).join("\n\n");

  // 🔹 Highlight lỗi trong bài viết
  const highlightedWriting = mockResult.errors.reduce((text, err) => {
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

      {/* 🔹 Tổng điểm */}
      <div className="score-summary">
        <h3>Overall Band: {mockResult.overall_band}</h3>
        <div className="score-grid">
          <div className="score-item">
            <span>Task Achievement</span>
            <strong>{mockResult.task_achievement}</strong>
          </div>
          <div className="score-item">
            <span>Coherence & Cohesion</span>
            <strong>{mockResult.coherence}</strong>
          </div>
          <div className="score-item">
            <span>Lexical Resource</span>
            <strong>{mockResult.lexical}</strong>
          </div>
          <div className="score-item">
            <span>Grammar Accuracy</span>
            <strong>{mockResult.grammar}</strong>
          </div>
        </div>
      </div>

      {/* 🔹 Feedback tổng */}
      <div className="score-feedback">
        <h3>General Feedback</h3>
        <p>{mockResult.feedback}</p>
      </div>

      {/* 🔹 Bài viết của người dùng */}
      <div className="score-user-writing">
        <h3>Your Writing (with highlighted errors)</h3>
        <div
          className="writing-content"
          dangerouslySetInnerHTML={{ __html: highlightedWriting }}
        ></div>
      </div>

      {/* 🔹 Lỗi chi tiết */}
      <div className="score-errors">
        <h3>Detected Mistakes</h3>
        {mockResult.errors.map((err, i) => (
          <div key={i} className="error-item">
            <p className="error-wrong">❌ {err.sentence}</p>
            <p className="error-correct">✅ {err.correction}</p>
          </div>
        ))}
      </div>

      {/* 🔹 Gợi ý cải thiện */}
      <div className="score-suggestions">
        <h3>Suggestions for Improvement</h3>
        <ul>
          {mockResult.suggestions.map((sug, i) => (
            <li key={i}>{sug}</li>
          ))}
        </ul>
      </div>

      {/* 🔹 Nút điều hướng */}
      <div className="score-buttons">
        <button onClick={() => navigate("/")}>Return to Course</button>
        <button onClick={() => navigate(-1)}>Write Again</button>
      </div>
    </div>
  );
};

export default ScoreWritePage;
