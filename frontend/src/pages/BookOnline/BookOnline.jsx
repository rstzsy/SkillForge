import React, { useState, useEffect } from "react";
import "./BookOnline.css";

const BookOnline = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    userId: "",
  });

  const [bookings, setBookings] = useState([]);

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

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

      fetch(`https://skillforge-99ct.onrender.com/api/bookings/user/${storedUser.id}`) // ✅ đổi userId -> id
        .then((res) => res.json())
        .then((data) => setBookings(data))
        .catch((err) => console.error("Error loading user bookings:", err));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = async () => {
    const { name, email, date, time, userId } = formData;
    if (!name || !email || !date || !time) {
      alert("Please fill in all required fields!");
      return;
    }

    const newBooking = {
      name,
      email,
      userId, // ✅ gửi userId lên backend
      date,
      time,
      status: "Scheduled",
      bookedAt: new Date().toISOString(),
    };

    console.log("📤 Booking sent to backend:", newBooking); // 👈 thêm log kiểm tra

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (res.ok) {
        alert(`Successfully booked for ${name} on ${date} at ${time}`);

        const resBookings = await fetch(
          `https://skillforge-99ct.onrender.com/api/bookings/user/${userId}`
        );
        const updated = await resBookings.json();
        setBookings(updated);

        setFormData((prev) => ({ ...prev, date: "", time: "" }));
      } else {
        const err = await res.json();
        console.error("Backend error:", err);
        alert("Error saving booking data to the server.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Unable to connect to the server.");
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
          />

          {formData.date && (
            <>
              <label>Select Time:</label>
              <div className="time-grid-bookonl">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className={`time-slot-bookonl ${
                      formData.time === time ? "selected-bookonl" : ""
                    }`}
                    onClick={() => setFormData({ ...formData, time })}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </>
          )}

          <button className="book-btn-bookonl" onClick={handleBooking}>
            Booking Online
          </button>
        </div>

        {bookings.length > 0 && (
          <div className="booking-history-bookonl">
            <h2>Booking History</h2>
            <ul>
              {bookings.map((b, idx) => (
                <li key={idx}>
                  {b.name} - {b.email} - {b.date} - {b.time}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookOnline;
