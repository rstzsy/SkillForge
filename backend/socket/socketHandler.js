import {
  joinRoomService,
  sendMessageService,
  toggleAudioService,
  toggleVideoService,
  leaveRoomService
} from "../services/socketService.js";

export default (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Client kết nối:", socket.id);

    socket.on("join-room", async (data) => {
      try {
        const { roomId, userId, userName } = data;
        socket.join(roomId);

        await joinRoomService({ roomId, userId, socketId: socket.id });

        socket.to(roomId).emit("user-joined", {
          userId,
          userName,
          socketId: socket.id,
          timestamp: new Date().toISOString()
        });

        console.log(`👤 ${userName} tham gia phòng ${roomId}`);
      } catch (err) {
        console.error("Lỗi khi tham gia phòng:", err);
        socket.emit("error", { message: "Không thể tham gia phòng" });
      }
    });

    socket.on("send-message", async (data) => {
      try {
        const messagePayload = await sendMessageService(data);
        io.to(data.roomId).emit("new-message", messagePayload);
        console.log(`💬 ${data.userName}: ${data.message}`);
      } catch (err) {
        console.error("Lỗi khi gửi tin nhắn:", err);
      }
    });

    socket.on("toggle-audio", async (data) => {
      try {
        await toggleAudioService(data);
        socket.to(data.roomId).emit("user-audio-toggle", {
          userId: data.userId,
          audioEnabled: data.audioEnabled,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Lỗi khi toggle audio:", err);
      }
    });

    socket.on("toggle-video", async (data) => {
      try {
        await toggleVideoService(data);
        socket.to(data.roomId).emit("user-video-toggle", {
          userId: data.userId,
          videoEnabled: data.videoEnabled,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Lỗi khi toggle video:", err);
      }
    });

    socket.on("leave-room", async (data) => {
      try {
        await leaveRoomService(data);
        socket.leave(data.roomId);
        socket.to(data.roomId).emit("user-left", {
          userId: data.userId,
          userName: data.userName,
          timestamp: new Date().toISOString()
        });
        console.log(`👋 ${data.userName} rời phòng ${data.roomId}`);
      } catch (err) {
        console.error("Lỗi khi rời phòng:", err);
      }
    });

    // WebRTC Signaling
    socket.on("offer", (data) => {
      socket.to(data.roomId).emit("offer", {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("answer", (data) => {
      socket.to(data.roomId).emit("answer", {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.roomId).emit("ice-candidate", {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("start-screen-share", (data) => {
      socket.to(data.roomId).emit("user-screen-share-started", {
        userId: data.userId,
        userName: data.userName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("stop-screen-share", (data) => {
      socket.to(data.roomId).emit("user-screen-share-stopped", {
        userId: data.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Client ngắt kết nối:", socket.id);
    });
  });
};
