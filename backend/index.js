import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { doc, deleteDoc, getDocs, collection, addDoc } from "firebase/firestore"; 
import { db } from "./config.js"; 
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.post("/create", async (req, res) => {
  const data = req.body;
  try {
    await addDoc(collection(db, "speaking_bookings"), data);
    console.log("Data added to Firestore:", data);
    res.send({ msg: "speaking_bookings added" });
  } catch (err) {
    console.error("Error adding document:", err);
    res.status(500).send({ error: "Failed to add booking" });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "speaking_bookings"));
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Bookings fetched:", bookings);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.delete("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteDoc(doc(db, "speaking_bookings", id));
    res.json({ msg: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

//user
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is ready");
});

const port = process.env.PORT || 3002;
app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
