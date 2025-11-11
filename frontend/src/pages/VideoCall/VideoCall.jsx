import React, { useState, useRef, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useLocation } from "react-router-dom";
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
  const urlPath = location.pathname;
  const roomId = urlPath.split("/video_call/")[1]?.replace("class-", "class--");

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({}); // 🔹 State for triggering re-renders
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showPending, setShowPending] = useState(false);

  const localStreamRef = useRef(null);
  const mainVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.id;
  const userName = storedUser?.userName || "Unknown";

  const [isStreamReady, setIsStreamReady] = useState(false);
  const videoRefs = useRef({});

  const pendingUser = {
    name: "Ruben Dias",
    message: "Want to join the meeting!",
  };

  // ===== Start local camera =====
  // ===== Start local camera (Improved - No reinit PC) =====
  // ===== Start local camera =====
useEffect(() => {
  if (!userId) return;

  let isMounted = true;

  const handleStartVideo = async () => {
    try {
      // === 1️⃣ Nếu đã có stream cũ
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];

        // --- Nếu đang tắt camera ---
        if (isVideoOff) {
          if (videoTrack) videoTrack.enabled = false;
          console.log("🚫 Camera disabled (track muted, not stopped)");
          setIsStreamReady(true); // vẫn có stream, chỉ disable track
          return;
        }

        // --- Nếu đang bật camera lại ---
        if (videoTrack) {
          videoTrack.enabled = true;
          console.log("🎥 Re-enabled existing video track");

          // 🚀 Đảm bảo video render lại
          if (mainVideoRef.current) {
            mainVideoRef.current.srcObject = localStreamRef.current;
            mainVideoRef.current
              .play()
              .catch(() =>
                setTimeout(() => mainVideoRef.current.play().catch(() => {}), 100)
              );
          }

          if (videoRefs.current[userId]) {
            videoRefs.current[userId].srcObject = localStreamRef.current;
            videoRefs.current[userId]
              .play()
              .catch(() =>
                setTimeout(() => videoRefs.current[userId].play().catch(() => {}), 100)
              );
          }

          setIsStreamReady(true);
          return;
        }
      }

      // === 2️⃣ Nếu chưa có stream nào hoặc đã bị stop hoàn toàn ===
      if (isVideoOff) {
        console.log("📷 Camera off, not creating stream");
        setIsStreamReady(false);
        return;
      }

      console.log("📹 Requesting camera access...");
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      if (!isMounted) {
        newStream.getTracks().forEach((t) => t.stop());
        return;
      }

      // === 3️⃣ Nếu có stream cũ thì replace video track ===
      if (localStreamRef.current) {
        const oldStream = localStreamRef.current;
        const oldAudioTrack = oldStream.getAudioTracks()[0];
        const newVideoTrack = newStream.getVideoTracks()[0];

        // Replace video track trong mọi peer connection
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender && newVideoTrack) sender.replaceTrack(newVideoTrack);
        });

        oldStream.getVideoTracks().forEach((t) => t.stop());
        localStreamRef.current = new MediaStream([
          newVideoTrack,
          ...(oldAudioTrack ? [oldAudioTrack] : []),
        ]);
      } else {
        localStreamRef.current = newStream;
      }

      // === 4️⃣ Hiển thị lại video local ===
      setIsStreamReady(true);

      const playSafely = (videoEl, stream) => {
        if (!videoEl) return;
        videoEl.srcObject = stream;
        videoEl.play().catch(() =>
          setTimeout(() => videoEl.play().catch(() => {}), 100)
        );
      };

      playSafely(mainVideoRef.current, localStreamRef.current);
      playSafely(videoRefs.current[userId], localStreamRef.current);

      console.log("✅ Camera started or replaced track");
    } catch (err) {
      console.error("❌ Camera error:", err);
      if (err.name === "NotReadableError") {
        alert("Camera is being used by another app.");
      }
    }
  };

  handleStartVideo();

  return () => {
    isMounted = false;
    // Không stop track ở đây — chỉ stop khi rời phòng
  };
}, [isVideoOff, userId]);


  // ===== Add participant to Firestore =====
  useEffect(() => {
    if (!roomId || !userId) return;
    const participantRef = doc(db, "rooms", roomId, "participants", userId);
    setDoc(participantRef, { name: userName, joinedAt: new Date() }).catch(
      console.error
    );

    return () => {
      deleteDoc(participantRef).catch(console.error);
    };
  }, [roomId, userId, userName]);

  // ===== Listen participants realtime =====
  useEffect(() => {
    if (!roomId) return;
    const participantsCol = collection(db, "rooms", roomId, "participants");
    const unsub = onSnapshot(participantsCol, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setParticipants(list);
      console.log(
        "👥 Participants:",
        list.map((p) => p.id)
      );
    });
    return () => unsub();
  }, [roomId]);

  // 🔹 Assign remote streams to video elements
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      const videoEl = videoRefs.current[peerId];
      if (videoEl && stream && videoEl.srcObject !== stream) {
        console.log(`📺 Assigning stream to video element for ${peerId}`);
        videoEl.srcObject = stream;
        videoEl.play().catch((e) => {
          console.warn(
            `⚠️ Autoplay blocked for ${peerId}, retrying...`,
            e.message
          );
          setTimeout(() => videoEl.play().catch(() => {}), 1000);
        });
      }
    });
  }, [remoteStreams]);

  // ===== WebRTC - Completely rewritten =====//
  useEffect(() => {
    if (!roomId || !userId || !isStreamReady || !localStreamRef.current) {
      console.log("⏳ Waiting for setup...", { roomId, userId, isStreamReady });
      return;
    }

    console.log("🚀 Starting WebRTC signaling (per-peer)");

    const pcConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const offersCol = collection(db, "rooms", roomId, "offers");
    const answersCol = collection(db, "rooms", roomId, "answers");
    const candidatesRoot = collection(db, "rooms", roomId, "candidates");
    const participantsCol = collection(db, "rooms", roomId, "participants");

    // buffer for incoming candidates before pc.remoteDescription is set
    const pendingCandidates = {};

    const createPeerConnection = (peerId) => {
      if (peerConnectionsRef.current[peerId]) {
        return peerConnectionsRef.current[peerId];
      }

      console.log("🔗 Creating PC for", peerId);
      const pc = new RTCPeerConnection(pcConfig);

      // Add local tracks
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      // incoming tracks -> set remoteStreams
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStreams((prev) => ({ ...prev, [peerId]: event.streams[0] }));
        } else {
          // fallback: combine tracks into stream
          const stream = new MediaStream();
          stream.addTrack(event.track);
          setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
        }
      };

      // ICE candidate generated locally -> send to peer's candidates/peerId/items
      pc.onicecandidate = (e) => {
        if (!e.candidate) return;
        const targetCandidatesCol = collection(
          db,
          "rooms",
          roomId,
          "candidates",
          peerId,
          "items"
        );
        addDoc(targetCandidatesCol, {
          candidate: e.candidate.toJSON(),
          from: userId,
          to: peerId,
          ts: Date.now(),
        }).catch(console.error);
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE state (${peerId}):`, pc.iceConnectionState);
      };
      pc.onconnectionstatechange = () => {
        console.log(`Conn state (${peerId}):`, pc.connectionState);
      };

      peerConnectionsRef.current[peerId] = pc;

      // apply any pending candidates for this peer
      if (pendingCandidates[peerId] && pendingCandidates[peerId].length) {
        const list = pendingCandidates[peerId];
        // try to add, if remoteDescription present
        (async () => {
          for (const cand of list) {
            try {
              if (pc.remoteDescription && pc.remoteDescription.type) {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
                console.log(`✅ Applied pending candidate for ${peerId}`);
              } else {
                console.log(
                  `⏳ Still waiting remoteDesc before applying pending candidate for ${peerId}`
                );
              }
            } catch (err) {
              console.error("Error applying pending candidate", err);
            }
          }
          // keep pending (some may remain) - but clear to avoid duplicate attempts
          pendingCandidates[peerId] = [];
        })();
      }

      return pc;
    };

    // Listen incoming candidates targeted to me: candidates/{userId}/items
    const candidatesListenerUnsub = onSnapshot(
      collection(db, "rooms", roomId, "candidates", userId, "items"),
      (snap) => {
        snap.docChanges().forEach(async (change) => {
          if (change.type !== "added") return;
          const data = change.doc.data();
          if (!data || !data.candidate || data.from === userId) return;

          const fromId = data.from;
          const candidate = data.candidate;

          let pc = peerConnectionsRef.current[fromId];
          if (!pc) {
            // create a placeholder pc so we can add candidate later after answer/offer processed
            pc = createPeerConnection(fromId);
          }

          try {
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log(`✅ Added ICE candidate from ${fromId}`);
            } else {
              // buffer candidate until remoteDescription is set
              pendingCandidates[fromId] = pendingCandidates[fromId] || [];
              pendingCandidates[fromId].push(candidate);
              console.log(`🗄 Buffered ICE candidate from ${fromId}`);
            }
          } catch (err) {
            console.error("❌ Error adding remote ICE candidate", err);
          }
        });
      }
    );

    const unsubscribers = [candidatesListenerUnsub];

    // Listen offers collection -> when someone posts offer { from, to, sdp, type }
    const offersUnsub = onSnapshot(offersCol, async (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type === "removed") continue;
        const docId = change.doc.id; // we expect format `${from}_${to}`
        const data = change.doc.data();
        if (!data) continue;

        // only respond to offers that target me
        if (data.to !== userId) continue;

        const fromId = data.from;
        console.log("📥 Received offer doc", docId, "from", fromId);

        const pc = createPeerConnection(fromId);

        try {
          // set remote description with offer
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: data.type, sdp: data.sdp })
          );
          console.log(`✅ setRemoteDescription (offer) from ${fromId}`);

          // create answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`📤 Created answer for ${fromId}`);

          // write answer document with id `${from}_${to}` where from=offer.from, to=offer.to
          // We'll write answer doc id as `${fromId}_${userId}` so the offerer can listen for it.
          const answerDocRef = doc(
            db,
            "rooms",
            roomId,
            "answers",
            `${fromId}_${userId}`
          );
          await setDoc(answerDocRef, {
            from: userId,
            to: fromId,
            type: answer.type,
            sdp: answer.sdp,
            ts: Date.now(),
          });

          // apply any buffered candidates for this peer now that remoteDescription exists
          if (pendingCandidates[fromId] && pendingCandidates[fromId].length) {
            for (const cand of pendingCandidates[fromId]) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
                console.log(`✅ Applied buffered candidate for ${fromId}`);
              } catch (err) {
                console.warn("Error applying buffered candidate", err);
              }
            }
            pendingCandidates[fromId] = [];
          }
        } catch (err) {
          console.error("❌ Error handling incoming offer", err);
        }
      }
    });
    unsubscribers.push(offersUnsub);

    // Listen answers collection -> when somebody answers my offer
    const answersUnsub = onSnapshot(answersCol, async (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type === "removed") continue;
        const docId = change.doc.id; // expected `${offerFrom}_${responder}`
        const data = change.doc.data();
        if (!data) continue;

        // This answer is for someone -> we only process answers that target me (i.e., data.to === userId)
        // Specifically, if I (userId) was the offerer, I created offer doc id `${userId}_${peerId}`.
        // Responder writes answers doc id `${userId}_${responderId}`, so data.to === userId.
        if (data.to !== userId) continue;

        const responderId = data.from;
        console.log("📥 Received answer from", responderId, "doc:", docId);

        const pc =
          peerConnectionsRef.current[responderId] ||
          createPeerConnection(responderId);

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: data.type, sdp: data.sdp })
          );
          console.log(`✅ setRemoteDescription (answer) for ${responderId}`);

          // apply any buffered candidates
          if (
            pendingCandidates[responderId] &&
            pendingCandidates[responderId].length
          ) {
            for (const cand of pendingCandidates[responderId]) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
                console.log(`✅ Applied buffered candidate for ${responderId}`);
              } catch (err) {
                console.warn(
                  "Error applying buffered candidate after answer",
                  err
                );
              }
            }
            pendingCandidates[responderId] = [];
          }
        } catch (err) {
          console.error("❌ Error handling incoming answer", err);
        }
      }
    });
    unsubscribers.push(answersUnsub);

    // Watch participants so we can initiate offers to new peers (per-pair offer)
    const participantsUnsub = onSnapshot(participantsCol, async (snap) => {
      for (const docSnap of snap.docs) {
        const peerId = docSnap.id;
        if (peerId === userId) continue;

        // If I'm the initiator for this pair (deterministic)
        if (userId < peerId) {
          // create pc for this peer (if not exist)
          const pc = createPeerConnection(peerId);

          // if no localDescription (haven't created offer for this pair), create offer and write it
          if (!pc.localDescription) {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              console.log(`📤 Created offer for ${peerId}`);

              // write offer doc id `${userId}_${peerId}` so target can read
              const offerDocRef = doc(
                db,
                "rooms",
                roomId,
                "offers",
                `${userId}_${peerId}`
              );
              await setDoc(offerDocRef, {
                from: userId,
                to: peerId,
                type: offer.type,
                sdp: offer.sdp,
                ts: Date.now(),
              });
              console.log(`✅ Sent offer doc ${userId}_${peerId}`);
            } catch (err) {
              console.error("❌ Error creating/sending offer", err);
            }
          }
        }
      }
    });
    unsubscribers.push(participantsUnsub);

    // cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up WebRTC listeners & PCs");
      unsubscribers.forEach((u) => u && u());
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        try {
          pc.getSenders().forEach((s) => s.track && s.track.stop());
        } catch (e) {}
        try {
          pc.close();
        } catch (e) {}
      });
      peerConnectionsRef.current = {};
      setRemoteStreams({});

      // optionally remove our transient signaling docs we created (offers from me, answers from me, my candidates)
      // best-effort cleanup (ignore errors)
      (async () => {
        try {
          await deleteDoc(
            doc(db, "rooms", roomId, "offers", `${userId}_${/* any */ ""}`)
          ).catch(() => {});
        } catch (e) {}
        try {
          // delete my candidates collection docs if desired (firestore doesn't allow deleting collection in one call easily)
        } catch (e) {}
      })();
    };
  }, [roomId, userId, isStreamReady]);

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
    console.log(audioTrack.enabled ? "🎙️ Mic unmuted" : "🔇 Mic muted");
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        user: "You",
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      },
    ]);
    setMessage("");
  };

  return (
    <div
      className={`vc-container ${
        showChat || showPending ? "vc-sidebar-open" : ""
      }`}
    >
      {viewMode === "grid" && (
        <div className="vc-thumbnails grid-view">
          {participants.map((p) => (
            <div key={p.id} className="vc-thumbnail">
              <video
                ref={(el) => {
                  if (el) videoRefs.current[p.id] = el;
                }}
                autoPlay
                playsInline
                muted={p.id === userId}
                className="vc-thumbnail-video-element"
              />
              <div className="vc-thumbnail-overlay">
                <span className="vc-participant-name">
                  {p.name}
                  {p.id === userId ? " (You)" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="vc-main-content">
        <div className="vc-main-video">
          <div className="vc-recording-badge">
            <div className="vc-recording-dot"></div>
            Recording 1:04:20
            <button className="vc-recording-pause">
              <span className="vc-pause-icon"></span>
            </button>
            <span className="vc-recording-time">00</span>
          </div>

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
                playsInline
                className="vc-speaker-content"
              />
            )}

            <div className="vc-subtitle">
              <span className="vc-subtitle-label">CC/Subtitle</span>
              <p className="vc-subtitle-text">
                i never know what made it so exciting
              </p>
            </div>
          </div>

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

          <div className="vc-controls">
            <div className="vc-main-controls">
              <button
                className={`vc-control-btn ${
                  !isMuted ? "vc-control-active" : ""
                }`}
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
                className={`vc-control-btn ${
                  !isVideoOff ? "vc-control-active" : ""
                }`}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                <Video size={24} />
              </button>
              <button
                className={`vc-control-btn ${
                  showChat ? "vc-control-active" : ""
                }`}
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

      {(showChat || showPending) && (
        <div className="vc-sidebar">
          <div className="vc-sidebar-tabs">
            <button
              className={`vc-tab ${showPending ? "vc-tab-active" : ""}`}
              onClick={() => {
                setShowPending(true);
                setShowChat(false);
              }}
            >
              Pending<span className="vc-tab-badge">1</span>
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

          {showChat && (
            <div className="vc-chat-section">
              <div className="vc-chat-messages">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`vc-chat-message ${
                      msg.isOwn ? "vc-chat-own" : ""
                    }`}
                  >
                    {!msg.isOwn && <div className="vc-chat-avatar"></div>}
                    <div className="vc-chat-bubble-wrapper">
                      {!msg.isOwn && (
                        <span className="vc-chat-user">{msg.user}</span>
                      )}
                      <div className="vc-chat-bubble">{msg.text}</div>
                      <span className="vc-chat-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
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

      <div className="vc-bottom-bar">
        <div className="vc-view-controls">
          <button
            className={`vc-view-btn ${
              viewMode === "grid" ? "vc-view-active" : ""
            }`}
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
