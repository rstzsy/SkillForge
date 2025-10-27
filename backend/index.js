import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 
import goalRoutes from "./routes/goalRoutes.js";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/goals", goalRoutes);


app.get("/", (req, res) => {
  res.send("Server is ready");
});

const port = process.env.PORT || 3002;
app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
