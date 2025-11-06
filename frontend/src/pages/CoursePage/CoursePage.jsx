import React, { useState, useEffect } from "react";
import "./CoursePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faLink } from "@fortawesome/free-solid-svg-icons";

const CoursePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id;

        if (!userId) {
          console.error("UserID not found in localStorage");
          return;
        }

        const res = await fetch(
          `http://localhost:3002/api/admin/classes/user/${userId}`
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

    fetchClasses();
  }, []);

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
              {classes.length > 0 ? (
                classes.map((cls) => (
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
                        onClick={() => handleView(cls)}
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No classes found.
                  </td>
                </tr>
              )}
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
              <strong>Teacher:</strong> {selectedClass.teacher}
            </p>

            <p>
              <strong>Schedule:</strong> {selectedClass.schedule}
            </p>

            <p>
              <strong>Students Enrolled:</strong> {selectedClass.studentCount}
            </p>

            {selectedClass.description && (
              <p className="desc">{selectedClass.description}</p>
            )}

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
