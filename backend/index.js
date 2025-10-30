import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 
import goalRoutes from "./routes/goalRoutes.js";
import adminUserRoutes from "./routes/adminUserRoute.js";
import classRoutes from "./routes/classRoute.js";
import writingRoutes from "./routes/writingRoutes.js";
import listeningRoutes from "./routes/listeningRoute.js";



dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/goals", goalRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/classes", classRoutes);
app.use("/api/writing", writingRoutes);
app.use("/api/listening", listeningRoutes);

app.get("/", (req, res) => {
  res.send("Server is ready");
});

const port = process.env.PORT || 3002;
app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
