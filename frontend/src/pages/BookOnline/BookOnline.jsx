import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../component/Toast/ToastContainer";
import "./BookOnline.css";

const BookOnline = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    userId: "",
  });

  const [allBookings, setAllBookings] = useState([]);

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const loadAllBookings = async () => {
    try {
      const resAllBookings = await fetch("https://skillforge-99ct.onrender.com/api/bookings");
      const allBookingsData = await resAllBookings.json();
      setAllBookings(allBookingsData);
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("🔍 Stored user:", storedUser);

    if (storedUser) {
      setFormData((prev) => ({
        ...prev,
        name: storedUser.userName,
        email: storedUser.email,
        userId: storedUser.id,
      }));

      loadAllBookings();
    }
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isTimeSlotBooked = (date, time) => {
    return allBookings.some(
      (booking) => booking.date === date && booking.time === time
    );
  };

  const isPastTime = (date, time) => {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    return bookingDateTime < now;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = async () => {
    const { name, email, date, time, userId } = formData;
    if (!name || !email || !date || !time) {
      toast("Please fill in all required fields!");
      return;
    }

    if (isPastTime(date, time)) {
      toast("Cannot book for past date/time. Please select a future time slot.");
      return;
    }

    if (isTimeSlotBooked(date, time)) {
      toast(`The time slot ${time} on ${formatDate(date)} is already booked. Please select another time.`);
      return;
    }

    const newBooking = {
      name,
      email,
      userId,
      date,
      time,
      status: "Pending",
      bookedAt: new Date().toISOString(),
    };

    console.log("📤 Booking sent to backend:", newBooking);

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (res.ok) {
        toast(`Successfully booked for ${name} on ${formatDate(date)} at ${time}`);
        
        // Chuyển ngay sang trang My Course
        setTimeout(() => {
          navigate("/coursepage");
        }, 1500);
      } else {
        const err = await res.json();
        console.error("Backend error:", err);
        toast("Error saving booking data to the server.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast("Unable to connect to the server.");
    }
  };

  return (
    <div className="booking-page-container-bookonl">
      <div className="booking-left-bookonl">
        <div className="decor-image-bookonl"></div>
      </div>

      <div className="booking-right-bookonl">
        <h1 className="booking-title-bookonl">
          Schedule an Online Speaking Class
        </h1>

        <div className="booking-form-bookonl">
          <label>Username:</label>
          <input
            type="text"
            name="name"
            className="input-bookonl"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your username"
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            className="input-bookonl"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <label>Select Date:</label>
          <input
            type="date"
            name="date"
            className="input-bookonl"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
          />

          {formData.date && (
            <>
              <label>Select Time:</label>
              <div className="time-grid-bookonl">
                {timeSlots.map((time) => {
                  const isBooked = isTimeSlotBooked(formData.date, time);
                  const isPast = isPastTime(formData.date, time);
                  const isDisabled = isBooked || isPast;

                  return (
                    <div
                      key={time}
                      className={`time-slot-bookonl ${
                        formData.time === time ? "selected-bookonl" : ""
                      } ${isDisabled ? "disabled-bookonl" : ""}`}
                      onClick={() => {
                        if (!isDisabled) {
                          setFormData({ ...formData, time });
                        } else if (isPast) {
                          alert("This time has already passed!");
                        } else if (isBooked) {
                          alert(`Time slot ${time} is already booked!`);
                        }
                      }}
                      style={{
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.5 : 1,
                      }}
                    >
                      {time}
                      {isPast && (
                        <span style={{ fontSize: "0.8em", color: "#999" }}>
                          {" "}
                          (Past)
                        </span>
                      )}
                      {!isPast && isBooked && (
                        <span style={{ fontSize: "0.8em" }}> (Booked)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <button className="book-btn-bookonl" onClick={handleBooking}>
            Booking Online
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookOnline;