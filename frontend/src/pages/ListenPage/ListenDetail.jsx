import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../component/Toast/ToastContainer";
import "./ListenDetail.css";

const ListenDetail = () => {
  const { id } = useParams(); // Firestore doc ID of listen task
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0); // time tested
  const toast = useToast();
  

  // get usedid in local
  const userId = localStorage.getItem("userId") || 1;

  // get detail task
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `https://skillforge-99ct.onrender.com/api/user/listening/${id}`
        );
        const data = await res.json();
        if (res.ok || res.status === 200) {
          setTest(data.data);

          // Khởi tạo countdown
          const initialTime = data.data.time_limit
            ? data.data.time_limit * 60
            : 0;
          setTimeLeft(initialTime);
        } else {
          console.error("Error:", data.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchDetail();
  }, [id]);

  // countdown Timer
  useEffect(() => {
    if (!test || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        setDurationSeconds((prev) => prev + 1); // increase time do tesst
        if (prev <= 1) {
          clearInterval(timer);
          toast("Time is up! The test will be submitted.");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeLeft]);

  if (!test) return <p>Loading...</p>;

  const handleChange = (blankId, value) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const renderPassageInline = () => {
    const regex = /\((\d+)\) ___/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(test.content_text || "")) !== null) {
      const index = match.index;
      const blankId = Number(match[1]);

      parts.push(test.content_text.slice(lastIndex, index));

      parts.push(
        <span key={`blank-${blankId}`} className="listen-detail-blank">
          <sup className="listen-detail-blank-number">{blankId}</sup>
          <input
            value={answers[blankId] || ""}
            onChange={(e) => handleChange(blankId, e.target.value)}
            className="listen-detail-input"
          />
        </span>
      );

      lastIndex = index + match[0].length;
    }

    parts.push(test.content_text.slice(lastIndex));
    return parts;
  };

  // submit task
  const handleSubmit = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.id) {
      toast("User not found!");
      return;
    }

    if (!test || !test.id) {
      toast("Test data not loaded yet!");
      return;
    }

    const user_id = storedUser.id;
    const practice_id = test.id;
    const duration_seconds = test.time_limit
      ? test.time_limit * 60 - timeLeft
      : 0;

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/user/listen/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          practice_id,
          user_answer: answers,
          duration_seconds,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Network error while submitting your test."
        );

      toast("Submission saved successfully!");
      setShowModal(true);

      // save submissionId
      const submissionId = data.data.id;

      // navigate to score page
      navigate(`/score/${submissionId}`, {
        state: { userAnswers: answers },
      });
    } catch (err) {
      console.error("Error submitting test:", err);
      toast("Error submitting test. See console.");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="listen-detail-container">
      <h2 className="listen-detail-title">{test.title}</h2>

      {/* Audio Player */}
      {test.audio_url && (
        <div className="listen-detail-audio">
          <audio controls>
            <source src={test.audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="listen-detail-main">
        <div className="listen-detail-left">
          <div className="listen-detail-passage">{renderPassageInline()}</div>
        </div>

        {test.image_url && (
          <div className="listen-detail-right">
            <div className="listen-detail-right-inner">
              <img
                src={test.image_url}
                alt={test.title}
                className="listen-detail-image"
              />
              <div className="listen-detail-timer">
                <strong>{formatTime(timeLeft)}</strong>
              </div>
              <button className="listen-detail-submit" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal submit task */}
      {showModal && (
        <div className="listen-detail-modal">
          <div className="listen-detail-modal-content">
            <h3>The assignment has been submitted</h3>
            <div className="listen-detail-modal-buttons">
              <button onClick={() => navigate("/")}>Return Course Page</button>
              <button
                onClick={() =>
                  navigate(`/score/${test.id}`, {
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

export default ListenDetail;
