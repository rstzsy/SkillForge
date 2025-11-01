import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVolumeUp,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./SpeakDetail.css";

const SpeakDetail = () => {
  const { id } = useParams();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [note, setNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [showMicroPopup, setShowMicroPopup] = useState(false);
  const [recordedQuestions, setRecordedQuestions] = useState([]); // ✅ Câu hỏi đã ghi âm
  const [loading, setLoading] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🔹 Lấy dữ liệu Speaking từ Firestore qua backend
  useEffect(() => {
    const fetchSpeaking = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/speaking");
        const data = await res.json();
        setTopics(data);

        const found = data.find((item) => item.speaking_practices_id === id);
        if (found) {
          const formattedTopic = {
            id: found.speaking_practices_id,
            title: found.topic,
            section: found.section,
            questions: found.questions?.map((q) => q.question_text) || [],
          };
          setSelectedTopic(formattedTopic);
        }
      } catch (error) {
        console.error("❌ Error fetching speaking topics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpeaking();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!selectedTopic) return <p>Topic not found.</p>;

  const currentQuestion = selectedTopic.questions[currentQuestionIndex];

  // Điều khiển câu hỏi
  const handlePrev = () =>
    setCurrentQuestionIndex((i) => Math.max(i - 1, 0));
  const handleNext = () =>
    setCurrentQuestionIndex((i) =>
      Math.min(i + 1, selectedTopic.questions.length - 1)
    );

  // Đọc câu hỏi bằng giọng nói
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // Ghi âm
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // ✅ Đánh dấu câu hỏi này là đã ghi âm
        setRecordedQuestions((prev) =>
          prev.includes(currentQuestionIndex)
            ? prev
            : [...prev, currentQuestionIndex]
        );
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, 20000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access!");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="speak-detail-page">
      {/* Sidebar trái */}
      <aside className="sidebar-left">
        <h3 className="sidebar-title">{selectedTopic.title}</h3>
        <div className="questions-list">
          {selectedTopic.questions.map((q, index) => (
            <div
              key={index}
              className={`question-item ${
                index === currentQuestionIndex ? "active" : ""
              } ${recordedQuestions.includes(index) ? "recorded" : ""}`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              Q{index + 1}. {q}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="question-area">
        <div className="question-box">
          <p>{currentQuestion}</p>
          <button className="audio-btn" onClick={handleSpeak}>
            <FontAwesomeIcon icon={faVolumeUp} />
          </button>
        </div>

        <div className="nav-buttons">
          <button onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            onClick={handleNext}
            disabled={
              currentQuestionIndex === selectedTopic.questions.length - 1
            }
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </main>

      {/* Sidebar phải */}
      <aside className="sidebar-right">
        <div className="note-box">
          <div className="note-header">
            Note <span>{note.length}/1000</span>
          </div>
          <textarea
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your notes here..."
          />
        </div>
      </aside>

      {/* Thanh ghi âm */}
      <div className="bottom-bar">
        {!recording ? (
          <button className="record-btn" onClick={handleStartRecording}>
            <FontAwesomeIcon icon={faMicrophone} /> Record your answer
          </button>
        ) : (
          <button className="record-btn stop" onClick={handleStopRecording}>
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Phát lại audio */}
      {audioURL && (
        <div className="playback" style={{ textAlign: "center", marginTop: "10px" }}>
          <h4>🔊 Listen to your answer:</h4>
          <audio src={audioURL} controls />
        </div>
      )}
    </div>

    
  );
};

export default SpeakDetail;
