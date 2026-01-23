import { Booking } from "../models/bookingModel.js"
import { db } from "../config/firebase.js";

const COLLECTION_NAME = "speaking_bookings";

export const createBooking = async (data) => {
  const booking = new Booking(data);

  const bookingData = {
    name: booking.name,
    email: booking.email,
    date: booking.date,
    time: booking.time,
    status: booking.status || "Scheduled",
    bookedAt: booking.bookedAt || new Date().toISOString(),
    userId: booking.userId || null,
  };

  const docRef = await db.collection(COLLECTION_NAME).add(bookingData);
  return { id: docRef.id, ...bookingData };
};

export const getAllBookings = async () => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getBookingsByUserId = async (userId) => {
  const snapshot = await db.collection(COLLECTION_NAME)
    .where("userId", "==", userId)
    .get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateBookingStatus = async (id, status) => {
  const docRef = db.collection(COLLECTION_NAME).doc(id);
  await docRef.update({ status });
  
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
};

export const deleteBooking = async (id) => {
  await db.collection(COLLECTION_NAME).doc(id).delete();
};