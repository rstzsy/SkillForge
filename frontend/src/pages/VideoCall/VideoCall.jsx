import React, { useState } from 'react';
import './VideoCall.css';
import { Phone, Video, Mic, MessageSquare, Users, Plus, Copy } from 'lucide-react';

const VideoCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 
  const [chatMessages, setChatMessages] = useState([
    { user: 'Ruben Dias', text: 'Hello Linh!', time: '03:49PM', isOwn: false },
    { user: 'Ruben Dias', text: 'I really love your work 👌', time: '03:49PM', isOwn: false },
    { user: 'You', text: 'Hi Tom 👋', time: '03:49PM', isOwn: true },
    { user: 'You', text: 'Thank you, I also love it', time: '03:49PM', isOwn: true }
  ]);

  const participants = [
    { name: 'Angel Herwitz', status: 'active', audio: true },
    { name: 'Craig Siphron', status: 'active', audio: true },
    { name: 'Jordyn Press', status: 'active', audio: true },
    { name: 'Erfan Amade', status: 'waiting', audio: false, initials: 'ER' }
  ];

  const pendingUser = {
    name: 'Ruben Dias',
    message: 'Want to join the meeting!'
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, {
        user: 'You',
        text: message,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      }]);
      setMessage('');
    }
  };

  return (
    <div className={`vc-container ${(showChat || showPending) ? 'vc-sidebar-open' : ''}`}>
      {/* Participant Thumbnails - Grid View */}
      {viewMode === 'grid' && (
        <div className="vc-thumbnails">
          {participants.slice(0, 3).map((participant, index) => (
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
            <div className="vc-speaker-content">
              {/* Subtitle */}
              <div className="vc-subtitle">
                <span className="vc-subtitle-label">CC/Subtitle</span>
                <p className="vc-subtitle-text">i never know what made it so exciting</p>
              </div>
            </div>
          </div>

          {/* Full Screen Button */}
          <button className="vc-fullscreen-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>

          {/* Control Bar */}
          <div className="vc-controls">
            <div className="vc-main-controls">
              <button className="vc-control-btn" onClick={() => setIsMuted(!isMuted)}>
                <Mic size={24} />
              </button>
              
              <button className="vc-control-btn vc-control-cc">
                <span>CC</span>
              </button>
              
              <button className="vc-control-btn vc-control-end">
                <Phone size={24} />
              </button>
              
              <button className="vc-control-btn" onClick={() => setIsVideoOff(!isVideoOff)}>
                <Video size={24} />
              </button>
              
              <button 
                className={`vc-control-btn ${showChat ? 'vc-control-active' : ''}`}
                onClick={() => { setShowChat(!showChat); setShowPending(false); }}
              >
                <MessageSquare size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting User Card */}
      <div className="vc-waiting-card">
        <div className="vc-waiting-avatar">
          {participants[3].initials}
        </div>
        <div className="vc-waiting-info">
          <span className="vc-waiting-name">{participants[3].name}</span>
          <span className="vc-waiting-status">●</span>
        </div>
        <button className="vc-wifi-off">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
        </button>
        <button 
          className="vc-pending-toggle"
          onClick={() => { setShowPending(!showPending); setShowChat(false); }}
        >
          C
        </button>
      </div>

      {/* Right Sidebar */}
      {(showChat || showPending) && (
        <div className="vc-sidebar">
          {/* Tabs */}
          <div className="vc-sidebar-tabs">
            <button 
              className={`vc-tab ${showPending ? 'vc-tab-active' : ''}`}
              onClick={() => { setShowPending(true); setShowChat(false); }}
            >
              Pending
              <span className="vc-tab-badge">1</span>
            </button>
            <button 
              className={`vc-tab ${showChat ? 'vc-tab-active' : ''}`}
              onClick={() => { setShowChat(true); setShowPending(false); }}
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
                <button className="vc-btn-deny">deny</button>
              </div>
            </div>
          )}

          {/* Chat Section */}
          {showChat && (
            <div className="vc-chat-section">
              <div className="vc-chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`vc-chat-message ${msg.isOwn ? 'vc-chat-own' : ''}`}>
                    {!msg.isOwn && (
                      <div className="vc-chat-avatar"></div>
                    )}
                    <div className="vc-chat-bubble-wrapper">
                      {!msg.isOwn && (
                        <span className="vc-chat-user">{msg.user}</span>
                      )}
                      <div className="vc-chat-bubble">
                        {msg.text}
                      </div>
                      <span className="vc-chat-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="vc-chat-input">
                <button className="vc-emoji-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Type a massage..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="vc-message-input"
                />
                <button className="vc-send-btn" onClick={handleSendMessage}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
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
            className={`vc-view-btn ${viewMode === 'grid' ? 'vc-view-active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <div className="vc-grid-icon"></div>
          </button>
        </div>

        <div className="vc-participants-info">
          <Users size={20} />
          <span>Participants (46)</span>
          <div className="vc-participant-avatars">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="vc-participant-avatar"></div>
            ))}
            <div className="vc-participant-more">+36</div>
          </div>
        </div>

        <button className="vc-add-participant">
          <Plus size={20} />
          Add Participant
        </button>

        <div className="vc-meeting-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
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