import React, { useState, useEffect } from "react";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";

import "./AdminManageBooking.css";

const AdminManageBooking = () => {
  const [bookings, setBookings] = useState([]);

  // Lấy dữ liệu booking từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("userBookings");
    if (stored) {
      setBookings(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
    if (confirmDelete) {
      const updated = bookings.filter((_, i) => i !== index);
      setBookings(updated);
      localStorage.setItem("userBookings", JSON.stringify(updated));
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
                      onClick={() => handleDelete(idx)}
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
