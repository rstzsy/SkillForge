import express from "express";
import {
  createBooking,
  getBookings,
  getBookingsByUser,
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/user/:userId", getBookingsByUser);

router.post("/", async (req, res) => {
  try {
    const booking = await createBooking(req.body); 
    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

router.get("/", async (req, res) => {
  try {
    const bookings = await getBookings();
    res.json(bookings);
  } catch (error) {
    console.error("Error getting bookings:", error);
    res.status(500).json({ message: "Failed to get bookings" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteBooking(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

export default router;
