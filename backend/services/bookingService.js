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
    status: booking.status,
    bookedAt: booking.bookedAt,
  };

  const docRef = await db.collection(COLLECTION_NAME).add(bookingData);
  return { id: docRef.id, ...bookingData };
};

export const getAllBookings = async () => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteBooking = async (id) => {
  await db.collection(COLLECTION_NAME).doc(id).delete();
};
