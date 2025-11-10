import React, { useState, useRef, useEffect } from "react";
import { collection, doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/config";
import { useLocation } from "react-router-dom"; // <-- để lấy URL
import "./VideoCall.css";
import {
  Phone,
  Video,
  Mic,
  MessageSquare,
  Users,
  Plus,
  Copy,
} from "lucide-react";

const VideoCall = () => { 
  const location = useLocation();
  const urlPath = location.pathname; // ví dụ: "/video_call/class-Speaking-103-1762791490006"
  const roomId = urlPath.split("/video_call/")[1]?.replace("class-", "class--"); 
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  const mainVideoRef = useRef(null);
  const localStreamRef = useRef(null);


  // ===== Lấy user từ localStorage =====
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const userName = storedUser?.userName || "Unknown";

  // ===== Add pendingUser =====
  const pendingUser = { 
    name: "Ruben Dias", 
    message: "Want to join the meeting!" 
  };

  // ===== Add participant vào Firestore =====
  useEffect(() => {
    if (!roomId || !userId) return;

    const participantRef = doc(db, "rooms", roomId, "participants", userId);

    setDoc(participantRef, {
      name: userName,
      audio: true,
      joinedAt: new Date(),
    }).catch(console.error);

    return () => {
      deleteDoc(participantRef).catch(console.error);
    };
  }, [roomId, userId, userName]);

  // ===== Listen participants realtime =====
  useEffect(() => {
    if (!roomId) return;

    const participantsCol = collection(db, "rooms", roomId, "participants");
    const unsub = onSnapshot(participantsCol, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      console.log("Participants realtime:", list);
      setParticipants(list);
    });

    return () => unsub();
  }, [roomId]);


  // ===== Video =====
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (mainVideoRef.current) mainVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isVideoOff) startVideo();
    else if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
  }, [isVideoOff]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatMessages([
      ...chatMessages,
      { user: "You", text: message, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isOwn: true },
    ]);
    setMessage("");
  };

  return (
    <div
      className={`vc-container ${
        showChat || showPending ? "vc-sidebar-open" : ""
      }`}
    >
      {/* Participant Thumbnails - Grid View */}
      {viewMode === "grid" && (
        <div className="vc-thumbnails grid-view">
          {participants.map((participant, index) => (
            <div key={index} className="vc-thumbnail">
              <div className="vc-thumbnail-video">
                <div className="vc-thumbnail-overlay">
                  <span className="vc-participant-name">{participant.name}</span>
                  {participant.audio && (
                    <div className="vc-audio-indicator">
                      <div className="vc-audio-wave"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Video Area */}
      <div className="vc-main-content">
        <div className="vc-main-video">
          {/* Recording Indicator */}
          <div className="vc-recording-badge">
            <div className="vc-recording-dot"></div>
            Recording 1:04:20
            <button className="vc-recording-pause">
              <span className="vc-pause-icon"></span>
            </button>
            <span className="vc-recording-time">00</span>
          </div>

          {/* Main Speaker Video */}
          <div className="vc-speaker-video">
            {isVideoOff ? (
              <div className="vc-speaker-avatar">
                <span>YOU</span>
              </div>
            ) : (
              <video
                ref={mainVideoRef}
                autoPlay
                muted
                className="vc-speaker-content"
              ></video>
            )}

            <div className="vc-subtitle">
              <span className="vc-subtitle-label">CC/Subtitle</span>
              <p className="vc-subtitle-text">
                i never know what made it so exciting
              </p>
            </div>
          </div>

          {/* Full Screen Button */}
          <button className="vc-fullscreen-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>

          {/* Control Bar */}
          <div className="vc-controls">
            <div className="vc-main-controls">
              <button
                className={`vc-control-btn ${!isMuted ? "vc-control-active" : ""}`}
                onClick={toggleMic}
              >
                <Mic size={24} />
              </button>

              <button className="vc-control-btn vc-control-cc">
                <span>CC</span>
              </button>

              <button className="vc-control-btn vc-control-end">
                <Phone size={24} />
              </button>

              <button
                className={`vc-control-btn ${!isVideoOff ? "vc-control-active" : ""}`}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                <Video size={24} />
              </button>

              <button
                className={`vc-control-btn ${showChat ? "vc-control-active" : ""}`}
                onClick={() => {
                  setShowChat(!showChat);
                  setShowPending(false);
                }}
              >
                <MessageSquare size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {(showChat || showPending) && (
        <div className="vc-sidebar">
          {/* Tabs */}
          <div className="vc-sidebar-tabs">
            <button
              className={`vc-tab ${showPending ? "vc-tab-active" : ""}`}
              onClick={() => {
                setShowPending(true);
                setShowChat(false);
              }}
            >
              Pending
              <span className="vc-tab-badge">1</span>
            </button>
            <button
              className={`vc-tab ${showChat ? "vc-tab-active" : ""}`}
              onClick={() => {
                setShowChat(true);
                setShowPending(false);
              }}
            >
              Chat
            </button>
          </div>

          {/* Pending Section */}
          {showPending && (
            <div className="vc-pending-section">
              <div className="vc-pending-user">
                <div className="vc-pending-avatar"></div>
                <div className="vc-pending-content">
                  <span className="vc-pending-name">{pendingUser.name}</span>
                  <p className="vc-pending-message">{pendingUser.message}</p>
                </div>
              </div>
              <div className="vc-pending-actions">
                <button className="vc-btn-admit">Admit</button>
                <button className="vc-btn-deny">Deny</button>
              </div>
            </div>
          )}

          {/* Chat Section */}
          {showChat && (
            <div className="vc-chat-section">
              <div className="vc-chat-messages">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`vc-chat-message ${msg.isOwn ? "vc-chat-own" : ""}`}
                  >
                    {!msg.isOwn && <div className="vc-chat-avatar"></div>}
                    <div className="vc-chat-bubble-wrapper">
                      {!msg.isOwn && <span className="vc-chat-user">{msg.user}</span>}
                      <div className="vc-chat-bubble">{msg.text}</div>
                      <span className="vc-chat-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="vc-chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="vc-message-input"
                />
                <button className="vc-send-btn" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="vc-bottom-bar">
        <div className="vc-view-controls">
          <button
            className={`vc-view-btn ${viewMode === "grid" ? "vc-view-active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <div className="vc-grid-icon"></div>
          </button>
        </div>

        <div className="vc-participants-info">
          <Users size={20} />
          <span>Participants ({participants.length})</span>
        </div>

        <button className="vc-add-participant">
          <Plus size={20} />
          Add Participant
        </button>

        <div className="vc-meeting-link">
          <span>VirtuFit.io/joinid245</span>
        </div>

        <button className="vc-copy-link">
          <Copy size={20} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
