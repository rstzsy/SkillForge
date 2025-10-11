import React, { useState } from "react";
import "./CoursePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faLink } from "@fortawesome/free-solid-svg-icons";

const CoursePage = () => {
  const [classes] = useState([
    {
      id: "S101",
      name: "Speaking 101",
      subject: "Speaking",
      studentCount: 25,
      schedule: "Mon 8:00-10:00",
      description:
        "A beginner course focusing on improving your pronunciation, fluency, and confidence in speaking English.",
      driveLink: "https://drive.google.com/speaking101",
      zoomLink: "https://zoom.us/j/123456789",
    },
    {
      id: "S102",
      name: "Speaking 102",
      subject: "Speaking",
      studentCount: 30,
      schedule: "Tue 10:00-12:00",
      description:
        "Learn strategies for understanding complex texts and improving your IELTS reading skills.",
      driveLink: "https://drive.google.com/reading101",
      zoomLink: "https://zoom.us/j/987654321",
    },
    {
      id: "S103",
      name: "Speaking 103",
      subject: "Speaking",
      studentCount: 20,
      schedule: "Wed 13:00-15:00",
      description:
        "Develop your essay writing and academic expression with practice-based learning.",
      driveLink: "https://drive.google.com/writing101",
      zoomLink: "https://zoom.us/j/111222333",
    },
  ]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleView = (cls) => {
    setSelectedClass(cls);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  return (
    <div className="course-page">
      {/* ===== Banner ===== */}
      <section
        className="Course-banner"
        style={{ backgroundImage: "url('assets/background.png')" }}
      >
        <h2 className="Course-title">Courses</h2>
      </section>

      {/* ===== Course List ===== */}
      <div className="course-list-container">
        <h2 className="course-list-title">Available Classes</h2>
        <div className="course-table-wrapper">
          <table className="course-table">
            <thead>
              <tr>
                <th>Class ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Students</th>
                <th>Schedule</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td>{cls.id}</td>
                  <td>{cls.name}</td>
                  <td>{cls.subject}</td>
                  <td>{cls.studentCount}</td>
                  <td>{cls.schedule}</td>
                  <td>
                    <button
                      className="btn-view-course"
                      onClick={() => handleView(cls)}
                    >
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Modal View Detail ===== */}
      {showModal && selectedClass && (
        <div className="modal-overlay-course" onClick={closeModal}>
          <div
            className="modal-content-course"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedClass.name}</h3>
            <p>
              <strong>Subject:</strong> {selectedClass.subject}
            </p>
            <p>
              <strong>Schedule:</strong> {selectedClass.schedule}
            </p>
            <p>
              <strong>Students Enrolled:</strong> {selectedClass.studentCount}
            </p>
            <p className="desc">{selectedClass.description}</p>

            <p>
              <strong>Drive Link: </strong>
              <a
                href={selectedClass.driveLink}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faLink} /> Open Drive
              </a>
            </p>

            <p>
              <strong>Zoom Link: </strong>
              <a href={selectedClass.zoomLink} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faLink} /> Join Zoom
              </a>
            </p>

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
