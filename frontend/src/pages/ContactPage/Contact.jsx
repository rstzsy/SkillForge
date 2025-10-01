import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Contact.css"

// npm install react-toastify
// npm install @emailjs/browser

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_2pnfgri", "template_ek60rdg", form.current, {
        publicKey: "J8T34g0SLLObbCv51",
      })
      .then(
        () => {
          toast.success("Send Successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
          form.current.reset();
        },
        (error) => {
          toast.error("Send Failed: " + error.text, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      );
  };

  return (
    <div className="contact-container">
      {/* left-side */}
      <div className="contact-form">
        <h2>Contact Us</h2>
        <form ref={form} onSubmit={sendEmail}>
          <label>Name</label>
          <input type="text" name="user_name" required />

          <label>Email</label>
          <input type="email" name="user_email" required />

          <label>Message</label>
          <textarea name="message" rows="6" required />

          <button type="submit">Send</button>
        </form>
      </div>

      {/* right-side */}
      <div className="contact-map">
        <iframe
          title="map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502211826599!2d106.7004231756892!3d10.773374389377566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40e6a14b1b%3A0x5e2dbe2f9185a3b!2zQ8O0bmcgVmllbiBUaMOgbmggUXXhuqNu!5e0!3m2!1svi!2s!4v1632999197065!5m2!1svi!2s"
          width="100%"
          height="100%"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default Contact;
