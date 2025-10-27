import { Booking } from "../models/BookingModel.js";
import { db } from "../config/firebase.js";

const COLLECTION_NAME = "speaking_bookings";

export const createBooking = async (data) => {
  console.log("📥 Booking data received:", data);

  const booking = new Booking(data);

  const bookingData = {
    ...data,
    name: booking.name,
    email: booking.email,
    date: booking.date,
    time: booking.time,
    status: booking.status || "Scheduled",
    bookedAt: booking.bookedAt || new Date().toISOString(),
    userId: data.userId || booking.userId || null,
  };

  const docRef = await db.collection(COLLECTION_NAME).add(bookingData);
  return { id: docRef.id, ...bookingData };
};

export const getBookings = async () => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteBooking = async (id) => {
  await db.collection(COLLECTION_NAME).doc(id).delete();
};

export const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .get();

    const bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: err.message });
  }
};
