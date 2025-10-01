import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { mockWriteData } from "./WritePage"; 
import "./WriteDetail.css";

const WriteDetail = () => {
  const { id } = useParams(); 
  const task = mockWriteData.find((item) => item.id === Number(id));

  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(task?.timeLimit * 60 || 40 * 60); 
  const [sections, setSections] = useState({
    introduction: "",
    body1: "",
    body2: "",
    conclusion: "",
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Count words from all sections
  useEffect(() => {
    const text = Object.values(sections).join(" ");
    const count = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, [sections]);

  const handleChange = (section, value) => {
    setSections((prev) => ({ ...prev, [section]: value }));
  };

  if (!task) {
    return <p>Task not found</p>;
  }

  return (
    <div className="write-page">
      {/* Left Side - Question */}
      <div className="write-left">
        <div className="question-box">
          <p className="question-text">
            The diagram below shows how geothermal energy is used to produce
            electricity. Summarise the information by selecting and reporting
            the main features and make comparisons where relevant.
          </p>
          <img
            src="/assets/diargam.png"
            alt="Geothermal Power Plant"
            className="question-image"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="write-right">
        <div className="write-header">
          <h3>{task.title}</h3>
          <span className="word-count">Word count: {wordCount}</span>
        </div>

        {/* Writing Form */}
        <div className="write-form">
          <div className="form-section">
            <label>Introduction</label>
            <textarea
              placeholder="Write your introduction here..."
              value={sections.introduction}
              onChange={(e) => handleChange("introduction", e.target.value)}
            />
          </div>
          <div className="form-section">
            <label>Body 1</label>
            <textarea
              placeholder="Write your first body paragraph..."
              value={sections.body1}
              onChange={(e) => handleChange("body1", e.target.value)}
            />
          </div>
          <div className="form-section">
            <label>Body 2</label>
            <textarea
              placeholder="Write your second body paragraph..."
              value={sections.body2}
              onChange={(e) => handleChange("body2", e.target.value)}
            />
          </div>
          <div className="form-section">
            <label>Conclusion</label>
            <textarea
              placeholder="Write your conclusion here..."
              value={sections.conclusion}
              onChange={(e) => handleChange("conclusion", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="write-footer">
            <span className="timeCountdown">Time left: {formatTime(timeLeft)}</span>
            <div className="buttons">
                <button className="back-btn">Back</button>
                <button className="ai-btn">Check with AI</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WriteDetail;
