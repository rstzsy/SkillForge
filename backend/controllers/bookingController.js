import * as bookingService from "../services/bookingService.js";

export const createBooking = async (req, res) => {
  try {
    const data = req.body;
    await bookingService.createBooking(data);
    res.status(201).json({ msg: "Booking added successfully" });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to add booking" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    await bookingService.deleteBooking(id);
    res.json({ msg: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};
