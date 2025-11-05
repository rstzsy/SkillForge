import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 
import goalRoutes from "./routes/goalRoutes.js";
import adminUserRoutes from "./routes/adminUserRoute.js";
import classRoutes from "./routes/classRoute.js";
import writingRoutes from "./routes/writingRoutes.js";
import listeningRoutes from "./routes/listeningRoute.js";
import readingRoutes from "./routes/readingRoute.js";
import aiWritingRoutes from "./routes/aiWritingRoutes.js";
import speakingRoutes from "./routes/speakingRoutes.js";
import userListeningRoutes from "./routes/userListeningRoute.js";
import userListeningSubmissionRoutes from "./routes/listeningSubmissionRoute.js";
import userReadingRoutes from "./routes/userReadingRoute.js";
import userReadingSubmissionRoutes from "./routes/readingSubmissionRoute.js";
import wishlistRoute from "./routes/wishlistRoute.js";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// ✅ Fix đường dẫn khi dùng ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Public thư mục uploads để có thể truy cập file trực tiếp
const audioPath = path.join(process.cwd(), "uploads", "audio");
app.use("/uploads/audio", express.static(audioPath));
console.log("🗂️ Serving uploads from:", audioPath);

app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/goals", goalRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/classes", classRoutes);
app.use("/api/writing", writingRoutes);
app.use("/api/listening", listeningRoutes);
app.use("/api/reading", readingRoutes);
app.use("/api/ai-writing", aiWritingRoutes);
app.use("/api/speaking", speakingRoutes);
app.use("/api/user/listening", userListeningRoutes);
app.use("/api/user/listen/submit", userListeningSubmissionRoutes);
app.use("/api/user/reading", userReadingRoutes);
app.use("/api/user/read/submit", userReadingSubmissionRoutes);
app.use("/api/user/wishlist", wishlistRoute);


app.get("/", (req, res) => {
  res.send("Server is ready");
});

const port = process.env.PORT || 3002;
app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
