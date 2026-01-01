import React, { useState, useEffect } from "react";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faTrash, 
  faCheck, 
  faTimes,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faCalendarAlt,
  faUser,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import "./AdminManageBooking.css";

const AdminManageBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filterStatus, searchTerm]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/bookings");
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

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filterStatus !== "all") {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `https://skillforge-99ct.onrender.com/api/bookings/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setBookings(bookings.filter((b) => b.id !== id));
        alert("Booking deleted successfully!");
        if (showModal) closeModal();
      } else {
        alert("Failed to delete booking.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(
        `https://skillforge-99ct.onrender.com/api/bookings/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        setBookings(
          bookings.map((b) =>
            b.id === id ? { ...b, status: newStatus } : b
          )
        );
        alert(`Booking ${newStatus.toLowerCase()} successfully!`);
        if (showModal) closeModal();
      } else {
        alert("Failed to update booking status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: "#f59e0b", icon: faClock, text: "Pending" },
      Scheduled: { color: "#3b82f6", icon: faCheckCircle, text: "Scheduled" },
      Completed: { color: "#10b981", icon: faCheckCircle, text: "Completed" },
      Cancelled: { color: "#ef4444", icon: faTimesCircle, text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "6px 14px",
          borderRadius: "20px",
          backgroundColor: config.color + "20",
          color: config.color,
          fontSize: "13px",
          fontWeight: "700",
        }}
      >
        <FontAwesomeIcon icon={config.icon} style={{ fontSize: "12px" }} />
        {config.text}
      </span>
    );
  };

  const getStatusCount = (status) => {
    return bookings.filter((b) => b.status === status).length;
  };

  return (
    <div className="main-content-bookingadmin">
      <AdminHeader />
      
      <div className="header-section-bookingadmin">
        <div>
          <h2 className="page-title-bookingadmin">📘 Manage Speaking Bookings</h2>
          <p className="page-subtitle-bookingadmin">
            View and manage users' online speaking class reservations.
          </p>
        </div>
        <div className="total-badge-bookingadmin">
          <span>Total Bookings</span>
          <strong>{bookings.length}</strong>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="status-cards-bookingadmin">
        <div className="status-card-bookingadmin pending-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{getStatusCount("Pending")}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="status-card-bookingadmin scheduled-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{getStatusCount("Scheduled")}</h3>
            <p>Scheduled</p>
          </div>
        </div>
        
        <div className="status-card-bookingadmin completed-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{getStatusCount("Completed")}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="status-card-bookingadmin cancelled-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <div className="card-content">
            <h3>{getStatusCount("Cancelled")}</h3>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section-bookingadmin">
        <div className="search-box-bookingadmin">
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter-bookingadmin"
        >
          <option value="all">All Status ({bookings.length})</option>
          <option value="Pending">Pending ({getStatusCount("Pending")})</option>
          <option value="Scheduled">Scheduled ({getStatusCount("Scheduled")})</option>
          <option value="Completed">Completed ({getStatusCount("Completed")})</option>
          <option value="Cancelled">Cancelled ({getStatusCount("Cancelled")})</option>
        </select>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="empty-bookingadmin">
          <div className="empty-icon">📭</div>
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="table-wrapper-bookingadmin">
          <table className="booking-table-bookingadmin">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Booked At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b, idx) => (
                <tr key={b.id || idx}>
                  <td data-label="ID">
                    <span className="booking-id">B{String(idx + 1).padStart(3, "0")}</span>
                  </td>
                  <td data-label="Full Name">{b.name}</td>
                  <td data-label="Email">{b.email}</td>
                  <td data-label="Date">{formatDate(b.date)}</td>
                  <td data-label="Time">{b.time}</td>
                  <td data-label="Status">{getStatusBadge(b.status)}</td>
                  <td data-label="Booked At">{new Date(b.bookedAt).toLocaleString("en-GB")}</td>
                  <td data-label="Actions">
                    <div className="action-buttons-bookingadmin">
                      <button
                        className="btn-action view"
                        onClick={() => handleView(b)}
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      {b.status === "Pending" && (
                        <>
                          <button
                            className="btn-action approve"
                            onClick={() => handleUpdateStatus(b.id, "Scheduled")}
                            title="Approve"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button
                            className="btn-action reject"
                            onClick={() => handleUpdateStatus(b.id, "Cancelled")}
                            title="Reject"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </>
                      )}

                      {b.status === "Scheduled" && (
                        <button
                          className="btn-action complete"
                          onClick={() => handleUpdateStatus(b.id, "Completed")}
                          title="Mark as Completed"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </button>
                      )}

                      <button
                        className="btn-action delete"
                        onClick={() => handleDelete(b.id)}
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay-bookingadmin" onClick={closeModal}>
          <div
            className="modal-content-bookingadmin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-bookingadmin">
              <h3>📋 Booking Details</h3>
              <button className="btn-close-icon" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body-bookingadmin">
              <div className="detail-row">
                <div className="detail-icon">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Full Name</span>
                  <strong>{selectedBooking.name}</strong>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Email</span>
                  <strong>{selectedBooking.email}</strong>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Date</span>
                  <strong>{formatDate(selectedBooking.date)}</strong>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Time</span>
                  <strong>{selectedBooking.time}</strong>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-content full-width">
                  <span className="detail-label">Status</span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-content full-width">
                  <span className="detail-label">Booked At</span>
                  <strong>{new Date(selectedBooking.bookedAt).toLocaleString("en-GB")}</strong>
                </div>
              </div>
            </div>

            <div className="modal-actions-bookingadmin">
              {selectedBooking.status === "Pending" && (
                <>
                  <button
                    className="btn-modal approve"
                    onClick={() =>
                      handleUpdateStatus(selectedBooking.id, "Scheduled")
                    }
                  >
                    <FontAwesomeIcon icon={faCheck} /> Approve
                  </button>
                  <button
                    className="btn-modal reject"
                    onClick={() =>
                      handleUpdateStatus(selectedBooking.id, "Cancelled")
                    }
                  >
                    <FontAwesomeIcon icon={faTimes} /> Reject
                  </button>
                </>
              )}

              {selectedBooking.status === "Scheduled" && (
                <button
                  className="btn-modal complete"
                  onClick={() =>
                    handleUpdateStatus(selectedBooking.id, "Completed")
                  }
                >
                  <FontAwesomeIcon icon={faCheckCircle} /> Mark as Completed
                </button>
              )}

              <button
                className="btn-modal delete"
                onClick={() => handleDelete(selectedBooking.id)}
              >
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageBooking;