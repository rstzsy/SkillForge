import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVolumeUp,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import "./SpeakDetail.css";

const mockTopics = [
  {
    id: 1,
    title: "[FC T9-12] Plants 0/4",
    questions: [
      "Do you keep plants at home?",
      "What kind of plants do people usually grow in your country?",
      "Do you think plants are important for the environment?",
      "Would you like to have a garden in the future?",
    ],
  },
  {
    id: 2,
    title: "[FC T9-12] Art 0/4",
    questions: [
      "Do you like art?",
      "What kind of art do you enjoy?",
      "Have you ever visited an art gallery?",
      "Do you think art is important in education?",
    ],
  },
];

const SpeakDetail = () => {
  const [selectedTopic, setSelectedTopic] = useState(mockTopics[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [note, setNote] = useState("");
  const [showMicroPopup, setShowMicroPopup] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const currentQuestion = selectedTopic.questions[currentQuestionIndex];

  // Điều khiển câu hỏi
  const handlePrev = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
  };
  const handleNext = () => {
    if (currentQuestionIndex < selectedTopic.questions.length - 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  // Đọc câu hỏi bằng giọng nói
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // Bắt đầu thu âm
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
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      // Tự dừng sau 20s
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

  // Dừng thu âm thủ công
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="speak-detail-page">
      {/* Sidebar left */}
      <aside className="sidebar-left">
        <div className="search-topic">
          <FontAwesomeIcon icon={faMagnifyingGlass} color="#dc9f36" />
          <input type="text" placeholder="Search by topic/question" />
          <button className="search-btn">Search</button>
        </div>

        <div className="topics-list">
          {mockTopics.map((topic) => (
            <div
              key={topic.id}
              className={`topic-item ${topic.id === selectedTopic.id ? "active" : ""}`}
              onClick={() => {
                setSelectedTopic(topic);
                setCurrentQuestionIndex(0);
              }}
            >
              {topic.title}
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
            disabled={currentQuestionIndex === selectedTopic.questions.length - 1}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </main>

      {/* Sidebar right */}
      <aside className="sidebar-right">
        <div
          className="micro-check"
          onClick={() => setShowMicroPopup(!showMicroPopup)}
          style={{ cursor: "pointer", position: "relative" }}
        >
          <FontAwesomeIcon icon={faMicrophone} /> Micro check
          {showMicroPopup && (
            <div className="modal-overlay" onClick={() => setShowMicroPopup(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>CHECK YOUR MICROPHONE</h3>
                <ul>
                    <li>You have 20 seconds to speak</li>
                    <li>Please allow the system to access your microphone to perform this step</li>
                    <li>Click the “Check Microphone” button below to start testing</li>
                </ul>
                <button
                    className="check-mic-btn"
                    onClick={handleStartRecording}
                    disabled={recording}
                >
                    <FontAwesomeIcon icon={faMicrophone} />{" "}
                    {recording ? "Recording..." : "Check Microphone"}
                </button>
                </div>
            </div>
            )}
        </div>

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

      {/* Bottom bar */}
      <div className="bottom-bar">
        {!recording ? (
          <button className="record-btn" onClick={handleStartRecording}>
            <FontAwesomeIcon icon={faMicrophone} /> Start recording your answer
          </button>
        ) : (
          <button className="record-btn stop" onClick={handleStopRecording}>
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Audio playback */}
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
