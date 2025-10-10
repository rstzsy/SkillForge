import React, { useState } from "react";
import "./BookOnline.css";

const BookOnline = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  const [bookings, setBookings] = useState([]);

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = () => {
    const { name, email, date, time } = formData;
    if (!name || !email || !date || !time) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const newBooking = { ...formData };
    
    // print console
    console.log("Dữ liệu đặt lịch:", newBooking);

    setBookings([...bookings, newBooking]);
    alert(`Đặt lịch thành công cho ${name} vào ${date} lúc ${time}`);
    setFormData({ name: "", email: "", date: "", time: "" });
  };

  return (
    <div className="booking-page-container-bookonl">
      {/* left side */}
      <div className="booking-left-bookonl">
        <div className="decor-image-bookonl"></div>
      </div>

      {/* right side */}
      <div className="booking-right-bookonl">
        <h1 className="booking-title-bookonl">Schedule an Online Speaking Class</h1>

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
                    onClick={() =>
                      setFormData({ ...formData, time: time })
                    }
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
