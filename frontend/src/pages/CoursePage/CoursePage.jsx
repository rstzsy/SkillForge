import React, { useState, useEffect } from "react";
import "./CoursePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faLink, faTrash, faClock, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const CoursePage = () => {
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("classes");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClasses();
    fetchBookings();
  }, []);

  const fetchClasses = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;

      if (!userId) {
        console.error("UserID not found in localStorage");
        return;
      }

      const res = await fetch(
        `https://skillforge-99ct.onrender.com/api/admin/classes/user/${userId}`
      );
      const data = await res.json();

      if (data.classes) {
        const classesWithFakeId = data.classes.map((cls, index) => ({
          ...cls,
          fakeId: `S${String(index + 1).padStart(3, "0")}`,
        }));
        setClasses(classesWithFakeId);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;

      if (!userId) return;

      const res = await fetch(
        `https://skillforge-99ct.onrender.com/api/bookings/user/${userId}`
      );
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleView = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(
        `https://skillforge-99ct.onrender.com/api/bookings/${bookingId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        alert("Booking cancelled successfully!");
        fetchBookings();
        closeModal();
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
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
          padding: "5px 12px",
          borderRadius: "15px",
          backgroundColor: config.color + "20",
          color: config.color,
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        <FontAwesomeIcon icon={config.icon} style={{ fontSize: "12px" }} />
        {config.text}
      </span>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesSearch =
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="course-page">
      {/* Banner */}
      <section
        className="Course-banner"
        style={{ backgroundImage: "url('assets/background.png')" }}
      >
        <h2 className="Course-title">My Learning</h2>
      </section>

      {/* Content */}
      <div className="course-list-container">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "classes" ? "active" : ""}`}
            onClick={() => setActiveTab("classes")}
          >
            <span>📚 My Classes</span>
            <span className="tab-count">{classes.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span>📅 My Bookings</span>
            <span className="tab-count">{bookings.length}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {activeTab === "bookings" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          )}
        </div>

        {/* Classes Table */}
        {activeTab === "classes" && (
          <>
            <h2 className="course-list-title">Your Classes</h2>
            <div className="course-table-wrapper">
              <table className="course-table">
                <thead>
                  <tr>
                    <th>Class ID</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Students</th>
                    <th>Schedule</th>
                    <th>Teacher</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => (
                      <tr key={cls.id}>
                        <td>{cls.fakeId}</td>
                        <td>{cls.name}</td>
                        <td>{cls.subject}</td>
                        <td>{cls.studentCount}</td>
                        <td>{cls.schedule}</td>
                        <td>{cls.teacher}</td>
                        <td>
                          <button
                            className="btn-view-course"
                            onClick={() => handleView(cls, "class")}
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                        No classes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Bookings Table */}
        {activeTab === "bookings" && (
          <>
            <h2 className="course-list-title">Your Bookings</h2>
            <div className="course-table-wrapper">
              <table className="course-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Booked At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, idx) => (
                      <tr key={booking.id || idx}>
                        <td>B{String(idx + 1).padStart(3, "0")}</td>
                        <td>{formatDate(booking.date)}</td>
                        <td>{booking.time}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>{new Date(booking.bookedAt).toLocaleString("en-GB")}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              className="btn-view-course"
                              onClick={() => handleView(booking, "booking")}
                            >
                              <FontAwesomeIcon icon={faEye} /> View
                            </button>
                            {booking.status === "Pending" && (
                              <button
                                className="btn-cancel-booking"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedItem && (
        <div className="modal-overlay-course" onClick={closeModal}>
          <div
            className="modal-content-course"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === "class" ? (
              <>
                <h3>{selectedItem.name}</h3>
                <p>
                  <strong>Subject:</strong> {selectedItem.subject}
                </p>
                <p>
                  <strong>Teacher:</strong> {selectedItem.teacher}
                </p>
                <p>
                  <strong>Schedule:</strong> {selectedItem.schedule}
                </p>
                <p>
                  <strong>Students Enrolled:</strong> {selectedItem.studentCount}
                </p>
                {selectedItem.description && (
                  <p className="desc">{selectedItem.description}</p>
                )}
                <p>
                  <strong>Drive Link: </strong>
                  <a
                    href={selectedItem.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#fe5d01" }}
                  >
                    <FontAwesomeIcon icon={faLink} /> Open Drive
                  </a>
                </p>
                <p>
                  <strong>Zoom Link: </strong>
                  <a
                    href={selectedItem.zoomLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#fe5d01" }}
                  >
                    <FontAwesomeIcon icon={faLink} /> Join Zoom
                  </a>
                </p>
              </>
            ) : (
              <>
                <h3>Booking Details</h3>
                <p>
                  <strong>Name:</strong> {selectedItem.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedItem.email}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedItem.date)}
                </p>
                <p>
                  <strong>Time:</strong> {selectedItem.time}
                </p>
                <p>
                  <strong>Status:</strong> {getStatusBadge(selectedItem.status)}
                </p>
                <p>
                  <strong>Booked At:</strong>{" "}
                  {new Date(selectedItem.bookedAt).toLocaleString("en-GB")}
                </p>
                {selectedItem.status === "Pending" && (
                  <button
                    className="btn-cancel-booking-modal"
                    onClick={() => handleCancelBooking(selectedItem.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Cancel This Booking
                  </button>
                )}
              </>
            )}
            <button className="btn-close-course" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;