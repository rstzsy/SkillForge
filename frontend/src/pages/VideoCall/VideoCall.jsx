import React, { useState, useRef, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Phone,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Users,
  Plus,
  Copy,
  Monitor,
  Grid3x3,
  Maximize2,
  Settings,
  MoreVertical,
  Send,
  Circle,
  Square,
  Play,
  Download,
  PhoneOff
} from "lucide-react";

const VideoCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlPath = location.pathname;
  const roomId = urlPath.split("/video_call/")[1]?.replace("class-", "class--");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.id;
  const userName = storedUser?.userName || "Unknown";

  // States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [mainVideoId, setMainVideoId] = useState(userId);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);

  // Refs
  const localStreamRef = useRef(null);
  const mainVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const videoRefs = useRef({});
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  

  const [isStreamReady, setIsStreamReady] = useState(false);
  const [participantAvatars, setParticipantAvatars] = useState({});

  // ===== Start local camera =====
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const handleStartVideo = async () => {
      try {
        // neu da co stream cu
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];

          // neu tat camera
          if (isVideoOff) {
            if (videoTrack) videoTrack.enabled = false;
            console.log("Camera disabled (track muted, not stopped)");
            setIsStreamReady(true);
            return;
          }

          // neu bat camera lai
          if (videoTrack) {
            videoTrack.enabled = true;
            console.log("Re-enabled existing video track");

            // dam bao video render lai
            if (mainVideoRef.current) {
              mainVideoRef.current.srcObject = localStreamRef.current;
              mainVideoRef.current
                .play()
                .catch(() =>
                  setTimeout(
                    () => mainVideoRef.current?.play().catch(() => {}),
                    100
                  )
                );
            }

            if (videoRefs.current[userId]) {
              videoRefs.current[userId].srcObject = localStreamRef.current;
              videoRefs.current[userId]
                .play()
                .catch(() =>
                  setTimeout(
                    () => videoRefs.current[userId]?.play().catch(() => {}),
                    100
                  )
                );
            }

            setIsStreamReady(true);
            return;
          }
        }

        // neu chua co stream nao hoac bi stop hoan toan
        if (isVideoOff) {
          console.log("Camera off, not creating stream");
          setIsStreamReady(false);
          return;
        }

        console.log("Requesting camera access...");
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!isMounted) {
          newStream.getTracks().forEach((t) => t.stop());
          return;
        }

        // neu da co stream cu thi replace video track
        if (localStreamRef.current) {
          const oldStream = localStreamRef.current;
          const oldAudioTrack = oldStream.getAudioTracks()[0];
          const newVideoTrack = newStream.getVideoTracks()[0];

          // Replace video track trong moi peer connection
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

        // hien thi lai video camera cua local user
        setIsStreamReady(true);

        const playSafely = (videoEl, stream) => {
          if (!videoEl) return;
          videoEl.srcObject = stream;
          videoEl
            .play()
            .catch(() => setTimeout(() => videoEl?.play().catch(() => {}), 100));
        };

        playSafely(mainVideoRef.current, localStreamRef.current);
        playSafely(videoRefs.current[userId], localStreamRef.current);

        console.log("Camera started or replaced track");
      } catch (err) {
        console.error("Camera error:", err);
        if (err.name === "NotReadableError") {
          alert("Camera is being used by another app.");
        }
      }
    };

    handleStartVideo();

    return () => {
      isMounted = false;
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
        "Participants:",
        list.map((p) => p.id)
      );
    });
    return () => unsub();
  }, [roomId]);

  // gan luong tu xa cho cac video element khac
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      const videoEl = videoRefs.current[peerId];
      if (videoEl && stream && videoEl.srcObject !== stream) {
        console.log(`Assigning stream to video element for ${peerId}`);
        videoEl.srcObject = stream;
        videoEl.play().catch((e) => {
          console.warn(
            `Autoplay blocked for ${peerId}, retrying...`,
            e.message
          );
          setTimeout(() => videoEl?.play().catch(() => {}), 1000);
        });
      }
    });
  }, [remoteStreams]);

  // ===== WebRTC Logic =====
  useEffect(() => {
    if (!roomId || !userId || !isStreamReady || !localStreamRef.current) {
      console.log("Waiting for setup...", { roomId, userId, isStreamReady });
      return;
    }

    console.log("Starting WebRTC signaling (per-peer)");

    const pcConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const offersCol = collection(db, "rooms", roomId, "offers");
    const answersCol = collection(db, "rooms", roomId, "answers");
    const participantsCol = collection(db, "rooms", roomId, "participants");

    const pendingCandidates = {};

    const createPeerConnection = (peerId) => {
      if (peerConnectionsRef.current[peerId]) {
        return peerConnectionsRef.current[peerId];
      }

      console.log("🔗 Creating PC for", peerId);
      const pc = new RTCPeerConnection(pcConfig);

      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStreams((prev) => ({ ...prev, [peerId]: event.streams[0] }));
        } else {
          const stream = new MediaStream();
          stream.addTrack(event.track);
          setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
        }
      };

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

      if (pendingCandidates[peerId] && pendingCandidates[peerId].length) {
        const list = pendingCandidates[peerId];
        (async () => {
          for (const cand of list) {
            try {
              if (pc.remoteDescription && pc.remoteDescription.type) {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
                console.log(`Applied pending candidate for ${peerId}`);
              }
            } catch (err) {
              console.error("Error applying pending candidate", err);
            }
          }
          pendingCandidates[peerId] = [];
        })();
      }

      return pc;
    };

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
            pc = createPeerConnection(fromId);
          }

          try {
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log(`Added ICE candidate from ${fromId}`);
            } else {
              pendingCandidates[fromId] = pendingCandidates[fromId] || [];
              pendingCandidates[fromId].push(candidate);
              console.log(`Buffered ICE candidate from ${fromId}`);
            }
          } catch (err) {
            console.error("Error adding remote ICE candidate", err);
          }
        });
      }
    );

    const unsubscribers = [candidatesListenerUnsub];

    const offersUnsub = onSnapshot(offersCol, async (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type === "removed") continue;
        const docId = change.doc.id;
        const data = change.doc.data();
        if (!data) continue;

        if (data.to !== userId) continue;

        const fromId = data.from;
        console.log("Received offer doc", docId, "from", fromId);

        const pc = createPeerConnection(fromId);

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: data.type, sdp: data.sdp })
          );
          console.log(`setRemoteDescription (offer) from ${fromId}`);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`Created answer for ${fromId}`);

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

          if (pendingCandidates[fromId] && pendingCandidates[fromId].length) {
            for (const cand of pendingCandidates[fromId]) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
                console.log(`Applied buffered candidate for ${fromId}`);
              } catch (err) {
                console.warn("Error applying buffered candidate", err);
              }
            }
            pendingCandidates[fromId] = [];
          }
        } catch (err) {
          console.error("Error handling incoming offer", err);
        }
      }
    });
    unsubscribers.push(offersUnsub);

    const answersUnsub = onSnapshot(answersCol, async (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type === "removed") continue;
        const data = change.doc.data();
        if (!data) continue;

        if (data.to !== userId) continue;

        const responderId = data.from;
        console.log("Received answer from", responderId);

        const pc =
          peerConnectionsRef.current[responderId] ||
          createPeerConnection(responderId);

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: data.type, sdp: data.sdp })
          );
          console.log(`setRemoteDescription (answer) for ${responderId}`);

          if (
            pendingCandidates[responderId] &&
            pendingCandidates[responderId].length
          ) {
            for (const cand of pendingCandidates[responderId]) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
                console.log(`Applied buffered candidate for ${responderId}`);
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
          console.error("Error handling incoming answer", err);
        }
      }
    });
    unsubscribers.push(answersUnsub);

    const participantsUnsub = onSnapshot(participantsCol, async (snap) => {
      for (const docSnap of snap.docs) {
        const peerId = docSnap.id;
        if (peerId === userId) continue;

        if (userId < peerId) {
          const pc = createPeerConnection(peerId);

          if (!pc.localDescription) {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              console.log(`📤 Created offer for ${peerId}`);

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
              console.log(`Sent offer doc ${userId}_${peerId}`);
            } catch (err) {
              console.error("Error creating/sending offer", err);
            }
          }
        }
      }
    });
    unsubscribers.push(participantsUnsub);

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
    };
  }, [roomId, userId, isStreamReady]);

  // === chat realtime ===
  useEffect(() => {
    if (!roomId) return;

    const messagesCol = collection(db, "rooms", roomId, "messages");
    const unsub = onSnapshot(
      messagesCol,
      (snapshot) => {
        const msgs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.ts - b.ts);
        setChatMessages(
          msgs.map((m) => ({
            user: m.userName,
            userId: m.userId || m.from, // Thêm userId
            text: m.text,
            time: new Date(m.ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isOwn: m.from === userId,
          }))
        );
      },
      (err) => console.error("Chat listener error:", err)
    );

    return () => unsub();
  }, [roomId, userId]);

  // Fetch avatars for all participants
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatars = {};
      
      // Add local user avatar
      avatars[userId] = storedUser?.avatar || "/assets/avatar.jpg";
      
      // Fetch avatars for other participants
      for (const p of participants) {
        if (p.id !== userId) {
          try {
            const response = await fetch(`https://skillforge-99ct.onrender.com/api/users/${p.id}`);
            const data = await response.json();
            avatars[p.id] = data.user?.avatar || "/assets/avatar.jpg";
          } catch (err) {
            avatars[p.id] = "/assets/avatar.jpg";
          }
        }
      }
      
      setParticipantAvatars(avatars);
    };
    
    if (participants.length > 0) {
      fetchAvatars();
    }
  }, [participants, userId, storedUser?.avatar]);

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
    console.log(audioTrack.enabled ? "Mic unmuted" : "Mic muted");
  };

  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!roomId || !userId) return;

    const messagesCol = collection(db, "rooms", roomId, "messages");
    await addDoc(messagesCol, {
      text: message.trim(),
      from: userId,
      userId: userId, // Thêm dòng này
      userName: userName,
      ts: Date.now(),
    });

    setMessage("");
  };

  const leaveRoom = async () => {
    try {
      console.log("Leaving room...");

      if (roomId && userId) {
        const participantRef = doc(db, "rooms", roomId, "participants", userId);
        await deleteDoc(participantRef).catch(() => {});
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      Object.values(peerConnectionsRef.current).forEach((pc) => {
        try {
          pc.getSenders().forEach((s) => s.track?.stop?.());
        } catch (err) {}
        pc.close();
      });
      peerConnectionsRef.current = {};

      setRemoteStreams({});
      setParticipants([]);

      navigate(-1, { replace: true });

      setTimeout(() => {
        if (window.location.pathname.includes("call")) {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          const role = storedUser.role || "student";

          if (role === "Teacher") {
            navigate("/teacher/manage_class", { replace: true });
          } else if (role === "Customer") {
            navigate("/coursepage", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }
      }, 150);
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  // Recording functions
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "motion" },
        audio: true,
      });

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(screenStream, {
        mimeType: "video/webm; codecs=vp9",
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        clearInterval(timerRef.current);
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        setRecordedBlob(blob);
        setIsRecording(false);
        setRecordingTime(0);
        screenStream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePauseRecording = () => {
    if (isPaused) {
      if (mediaRecorderRef.current?.state === "paused") {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        clearInterval(timerRef.current);
      }
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`https://virtufit.io/join/${roomId}`);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-sm font-medium">Room: {roomId}</span>
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-red-500/30">
                <div className="flex items-center gap-2">
                  <Circle className={`w-3 h-3 fill-red-500 text-red-500 ${isPaused ? '' : 'animate-pulse'}`} />
                  <span className="text-sm font-medium">
                    {isPaused ? 'Paused' : 'Recording'}
                  </span>
                </div>
                <span className="text-sm text-gray-300">{formatTime(recordingTime)}</span>
                
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                  <button
                    onClick={togglePauseRecording}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title={isPaused ? "Resume" : "Pause"}
                  >
                    {isPaused ? <Play className="w-4 h-4" />
: <Square className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Stop Recording"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyMeetingLink}
              className="p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all"
              title="Copy meeting link"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 pt-20">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 h-full auto-rows-fr">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                <video
                  ref={(el) => (videoRefs.current[userId] = el)}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                  <span className="text-sm font-medium">{userName} (You)</span>
                </div>
                {isMuted && (
                  <div className="absolute top-3 right-3 p-2 bg-red-500/80 rounded-full">
                    <MicOff className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Remote Videos */}
              {participants
                .filter((p) => p.id !== userId)
                .map((p) => (
                  <div
                    key={p.id}
                    className="relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/5"
                  >
                    <video
                      ref={(el) => (videoRefs.current[p.id] = el)}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // Chế độ Speaker/Focus
            <div className="h-full flex flex-col gap-4">
              {/* Main Speaker View */}
              <div className="flex-1 relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                <video
                  // Đảm bảo video đang được chọn hiển thị ở đây
                  ref={(el) => {
                    mainVideoRef.current = el;
                    if (el && mainVideoId) {
                      const stream = mainVideoId === userId
                        ? localStreamRef.current
                        : remoteStreams[mainVideoId];
                      if (stream) {
                        el.srcObject = stream;
                        el.play().catch(() => {});
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={mainVideoId === userId} // Tắt tiếng video của chính mình
                  className="w-full h-full object-contain"
                />
                {/* Hiển thị tên người đang xem chính */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                  <span className="text-sm font-medium">
                    {participants.find(p => p.id === mainVideoId)?.name || (mainVideoId === userId ? userName : 'Participant')}
                    {mainVideoId === userId && " (You)"}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                  { id: userId, name: userName + " (You)", isMuted: isMuted },
                  ...participants.filter((p) => p.id !== userId).map(p => ({...p, isMuted: false}))
                ].map((p) => (
                  <div
                    key={p.id}
                    className={`relative flex-shrink-0 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      mainVideoId === p.id ? "border-blue-500" : "border-white/10 hover:border-blue-500/50"
                    }`}
                    onClick={() => setMainVideoId(p.id)} // Thêm sự kiện click để chuyển video chính
                  >
                    <video
                      ref={(el) => (videoRefs.current[p.id] = el)}
                      autoPlay
                      playsInline
                      muted={p.id === userId}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs">
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Recording Controls (Improved Style) */}
            <div className="flex items-center gap-2 mr-auto">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  // Thay đổi style để đồng bộ với các nút khác, màu đỏ chỉ dành cho icon
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-full transition-all shadow-lg"
                  title="Start Recording"
                >
                  <Circle className="w-4 h-4 fill-red-500 text-red-500" /> {/* Icon đỏ */}
                  <span className="text-sm font-medium">Record</span>
                </button>
              ) : null}

              {recordedBlob && (
                <a
                  href={URL.createObjectURL(recordedBlob)}
                  download={`recording-${Date.now()}.webm`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-full transition-all shadow-lg"
                  title="Download Recording"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Download</span>
                </a>
              )}
            </div>
            
            {/* Main Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full transition-all shadow-lg ${
                  isMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all shadow-lg ${
                  isVideoOff
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>

              <button
                onClick={leaveRoom}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all shadow-lg"
                title="Leave call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all shadow-lg"
                title="Change view"
              >
                {viewMode === "grid" ? <Maximize2 className="w-6 h-6" /> : <Grid3x3 className="w-6 h-6" />}
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="relative p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all shadow-lg"
                title="Participants"
              >
                <Users className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {participants.length}
                </span>
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all shadow-lg"
                title="Chat"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => {
              const initial = msg.user.charAt(0).toUpperCase();
              return (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    msg.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar (Chỉ hiển thị cho tin nhắn không phải của mình) */}
                  {!msg.isOwn && (
                    <img 
                      src={participantAvatars[msg.userId] || "/assets/avatar.jpg"} 
                      alt={msg.user}
                      className="w-8 h-8 flex-shrink-0 rounded-full object-cover border border-white/20"
                    />
                  )}

                  <div
                    className={`flex flex-col max-w-[80%] ${
                      msg.isOwn ? "items-end" : "items-start"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium mb-1 ${
                        msg.isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.user}
                    </p>

                    <div
                      className={`px-3 py-2 rounded-xl ${ // Dùng rounded-xl thay vì rounded-lg để đẹp hơn
                        msg.isOwn
                          ? "bg-blue-600 rounded-br-none" // Góc dưới bên phải nhọn hơn
                          : "bg-gray-700 rounded-tl-none" // Góc trên bên trái nhọn hơn
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs text-gray-300 mt-1 text-right">
                        {msg.time}
                      </p>
                    </div>
                  </div>
                  
                  {/* Avatar (Chỉ hiển thị cho tin nhắn của mình) */}
                  {msg.isOwn && (
                    <img 
                      src={storedUser?.avatar || "/assets/avatar.jpg"} 
                      alt="You"
                      className="w-8 h-8 flex-shrink-0 rounded-full object-cover border border-white/20"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">
              Participants ({participants.length})
            </h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <img 
                  src={participantAvatars[p.id] || "/assets/avatar.jpg"} 
                  alt={p.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {p.name} {p.id === userId && "(You)"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;