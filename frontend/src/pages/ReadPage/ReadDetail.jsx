import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ReadDetail.css";

const ReadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch reading detail from backend
  useEffect(() => {
    const fetchReading = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3002/api/user/reading/${id}`
        );
        const data = res.data.data;

        if (!data) {
          setError("Reading not found");
          return;
        }

        setTest(data);
        setTimeLeft((data.time_limit || 0) * 60); 
      } catch (err) {
        console.error("Error fetching reading detail:", err);
        setError("Failed to load reading detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [id]);

  // Countdown Timer
  useEffect(() => {
    if (!test || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time is up! Bài sẽ tự động nộp.");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeLeft]);

  // Handle answer input
  const handleChange = (blankId, value) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  // Render passage inline
  const renderPassageInline = () => {
    if (!test?.content_text) return null;

    const regex = /\((\d+)\) ___/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(test.content_text)) !== null) {
      const index = match.index;
      const blankId = Number(match[1]);

      parts.push(test.content_text.slice(lastIndex, index));

      parts.push(
        <span key={`blank-${blankId}`} className="read-detail-blank">
          <sup className="read-detail-blank-number">{blankId}</sup>
          <input
            value={answers[blankId] || ""}
            onChange={(e) => handleChange(blankId, e.target.value)}
            className="read-detail-input"
          />
        </span>
      );

      lastIndex = index + match[0].length;
    }

    parts.push(test.content_text.slice(lastIndex));

    return parts;
  };

  //  Handle submit
  const handleSubmit = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.id) {
      alert("User not found!");
      return;
    }

    if (!test || !test.id) {
      alert("Test data not loaded yet!");
      return;
    }

    const user_id = storedUser.id;
    const practice_id = test.id;
    const time_spent = test.time_limit
      ? Math.floor((test.time_limit * 60 - timeLeft) / 60)
      : 0; // thoi gian lam bai tinh bang phut

    try {
      const res = await axios.post(
        "http://localhost:3002/api/user/read/submit",
        {
          user_id,
          practice_id,
          user_answers: answers,
          time_spent,
        }
      );

      const data = res.data;

      if (!res.status || res.status !== 200) {
        throw new Error(
          data.message || "Network error while submitting your test."
        );
      }

      alert("Submission saved successfully!");
      setShowModal(true);

      // save submissionId
      const submissionId = res.data.data.id;
      console.log("Firestore doc ID:", submissionId);

      // navigate to score page
      navigate(`/score/read/${submissionId}`, { state: { userAnswers: answers } });
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Error submitting test. See console.");
    }
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) return <p>Loading reading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!test) return <p>Test not found!</p>;

  return (
    <div className="read-detail-container">
      <h2 className="read-detail-title">{test.title}</h2>

      <div className="read-detail-main">
        {/* LEFT: full passage */}
        <div className="read-detail-left">
          <h3>Reading Passage</h3>
          <div className="read-detail-full-passage">
            {test.content
              ?.split(/\\n|\n/g)
              .filter((line) => line.trim())
              .map((line, index) => (
                <p key={index}>{line}</p>
              ))}
          </div>
        </div>

        {/* RIGHT: inline answer passage */}
        {test.image_url && (
          <div className="read-detail-right">
            <div className="read-detail-right-inner">
              <div className="read-detail-passage">{renderPassageInline()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className="read-detail-bottom-controls"
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <div className="read-detail-timer">
          <strong>{formatTime(timeLeft)}</strong>
        </div>
        <button className="read-detail-submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="read-detail-modal">
          <div className="read-detail-modal-content">
            <h3>The assignment has been submitted</h3>
            <div className="read-detail-modal-buttons">
              <button onClick={() => navigate("/")}>Return Course Page</button>
              <button
                onClick={() =>
                  navigate(`/score/read/${test.id}`, {
                    state: { userAnswers: answers },
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

export default ReadDetail;
