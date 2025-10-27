import React, { useState, useEffect } from "react";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";

import "./AdminManageBooking.css";

const AdminManageBooking = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/bookings");
        const data = await res.json();
        console.log("📦 API returned:", data);

        if (Array.isArray(data)) {
          setBookings(data);
        } else if (Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
          console.warn("API did not return an array:", data);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
      }
    };

    fetchBookings();
  }, []);



  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3002/api/bookings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings(bookings.filter((b) => b.id !== id));
        alert("Booking deleted successfully!");
      } else {
        alert("Failed to delete booking.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };


  return (
    <div className="main-content-bookingadmin">
        <AdminHeader />
      <h2 className="page-title-bookingadmin">📘 Manage Speaking Bookings</h2>
      <p className="page-subtitle-bookingadmin">
        View and manage users’ online speaking class reservations.
      </p>

      {bookings.length === 0 ? (
        <p className="empty-bookingadmin">No bookings found.</p>
      ) : (
        <div className="table-wrapper-bookingadmin">
          <table className="booking-table-bookingadmin">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booked At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => (
                <tr key={idx}>
                  <td>{b.name}</td>
                  <td>{b.email}</td>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>{new Date(b.bookedAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-delete-bookingadmin"
                      onClick={() => handleDelete(b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminManageBooking;
