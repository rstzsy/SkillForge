import express from "express";
import {
  createBooking,
  getAllBookings,       
  getBookingsByUserId,   
  updateBookingStatus,   
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await getBookingsByUserId(req.params.userId);
    res.json(bookings);
  } catch (error) {
    console.error("Error getting user bookings:", error);
    res.status(500).json({ message: "Failed to get bookings" });
  }
});

router.get("/", async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error("Error getting bookings:", error);
    res.status(500).json({ message: "Failed to get bookings" });
  }
});

router.post("/", async (req, res) => {
  try {
    const booking = await createBooking(req.body); 
    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const booking = await updateBookingStatus(req.params.id, status);
    res.json(booking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Failed to update booking status" });
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