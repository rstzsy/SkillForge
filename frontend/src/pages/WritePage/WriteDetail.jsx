import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import "./WriteDetail.css";

const WriteDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sections, setSections] = useState({
    introduction: "",
    body1: "",
    body2: "",
    conclusion: "",
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const docRef = doc(db, "writing_practices", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTask(data);
          setTimeLeft((data.time_limit || 40) * 60);
        } else {
          console.warn("Task not found");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTask();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const text = Object.values(sections).join(" ");
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  }, [sections]);

  const handleChange = (section, value) => {
    setSections((prev) => ({ ...prev, [section]: value }));
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!task) return <p>Loading task...</p>;

  return (
    <div className="write-page">
      <div className="write-left">
        <div className="question-box">
          <p className="question-text">{task.question_text}</p>
          {task.image_url && (
            <img src={task.image_url} alt={task.title} className="question-image" />
          )}
        </div>
      </div>

      <div className="write-right">
        <div className="write-header">
          <h3>{task.title}</h3>
          <span className="word-count">Word count: {wordCount}</span>
        </div>

        <div className="write-form">
          {["introduction", "body1", "body2", "conclusion"].map((sec) => (
            <div className="form-section" key={sec}>
              <label>{sec.charAt(0).toUpperCase() + sec.slice(1)}</label>
              <textarea
                placeholder={`Write your ${sec} here...`}
                value={sections[sec]}
                onChange={(e) => handleChange(sec, e.target.value)}
              />
            </div>
          ))}
        </div>

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
