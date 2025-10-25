import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("Server is ready");
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
