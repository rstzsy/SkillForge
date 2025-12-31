import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import "./WriteDetail.css";

const WriteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showModal, setShowModal] = useState(false);
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

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;
    const essayText = Object.values(sections).join("\n\n");

    console.log("📤 Sending to API:", {
      userId,
      practiceId: id,
      essayText: essayText.substring(0, 100) + "...",
      imageUrl: task.image_url,
      section: task.section,
    });

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/ai-writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          practiceId: id,
          essayText,
          imageUrl: task.image_url || null,
          section: task.section,
        }),
      });

      const data = await res.json();
      console.log("📥 Received from API:", data); // ✅ DEBUG

      if (res.status === 200) {
        const taskRef = doc(db, "writing_practices", id);
        const taskSnap = await getDoc(taskRef);
        const currentAttempts = taskSnap.data()?.attempts || 0;

        await updateDoc(taskRef, {
          status: "Complete",
          attempts: currentAttempts + 1,
          last_completed_at: new Date(),
        });

        navigate(`/score/write/${id}`, {
          state: { aiResult: data, userWriting: sections },
        });
      } else {
        alert("AI evaluation failed: " + data.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error during submission");
    }
  };



  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!task) return <p>Loading task...</p>;

  return (
    <div className="write-detail-container">
      <h2 className="write-detail-title">{task.title}</h2>

      <div className="write-detail-main">
        {/* Left side */}
        <div className="write-detail-left">
          <p className="write-detail-question">{task.question_text}</p>
          {task.image_url && (
            <img src={task.image_url} alt={task.title} className="write-detail-image" />
          )}
        </div>

        {/* Right side */}
        <div className="write-detail-right">
          <div className="write-detail-top-info">
            <span className="write-detail-word-count">Word count: {wordCount}</span>
            <span className="write-detail-timer">{formatTime(timeLeft)}</span>
          </div>

          <div className="write-detail-form">
            {["introduction", "body1", "body2", "conclusion"].map((sec) => (
              <div className="write-detail-section" key={sec}>
                <label>{sec.charAt(0).toUpperCase() + sec.slice(1)}</label>
                <textarea
                  placeholder={`Write your ${sec} here...`}
                  value={sections[sec]}
                  onChange={(e) => handleChange(sec, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="write-detail-buttons">
            <button className="write-detail-back" onClick={() => navigate(-1)}>
              Back
            </button>
            <button className="write-detail-submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Modal */}
      {showModal && (
        <div className="write-detail-modal">
          <div className="write-detail-modal-content">
            <h3>Your writing has been submitted!</h3>
            <div className="write-detail-modal-buttons">
              <button onClick={() => navigate("/")}>Return to Course Page</button>
              <button
                onClick={() =>
                  navigate(`/score/write/${id}`, {
                    state: { userWriting: sections },
                  })
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

export default WriteDetail;