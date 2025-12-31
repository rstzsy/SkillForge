import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faLink } from "@fortawesome/free-solid-svg-icons";
import "./TeacherClass.css";

const TeacherClass = () => {
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Lấy danh sách lớp theo teacherId
  useEffect(() => {
    const fetchClasses = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.id) return;

      try {
        const response = await fetch(
          `https://skillforge-99ct.onrender.com/api/admin/classes/teacher/${storedUser.id}`
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch classes");

        // Format classes: thêm fakeId và formattedSchedule
        const formatted = data.map((cls, index) => {
          // Fake ID
          const fakeId = `S${String(index + 1).padStart(4, "0")}`;

          // Format schedule
          let formattedSchedule = "";
          if (cls.schedule) {
            const date = new Date(cls.schedule);
            const options = {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            };
            formattedSchedule = date.toLocaleString("en-US", options);
          }

          return {
            ...cls,
            fakeId,
            formattedSchedule,
            studentCount: cls.students?.length || 0,
          };
        });

        setClasses(formatted);
      } catch (err) {
        console.error(err);
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

  const filteredClasses = classes.filter(
    (c) =>
      c.fakeId.toLowerCase().includes(filter.toLowerCase()) ||
      c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <HeaderTeacher>
      <div className="class-container-teacherclass">
        <h2 className="page-title-teacherclass">Manage Classes</h2>

        {/* Filter */}
        <div className="filter-section-teacherclass">
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input-teacherclass"
          />
        </div>

        {/* Table */}
        <div className="table-wrapper-teacherclass">
          <table className="class-table-teacherclass">
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
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.fakeId}</td>
                    <td>{cls.name}</td>
                    <td>{cls.subject}</td>
                    <td>{cls.studentCount}</td>
                    <td>{cls.formattedSchedule}</td>
                    <td>
                      <div className="action-buttons-teacherclass">
                        <button
                          className="btn-view-teacherclass"
                          onClick={() => handleView(cls)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data-teacherclass">
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal View Detail */}
        {showModal && selectedClass && (
          <div className="modal-overlay-teacherclass" onClick={closeModal}>
            <div
              className="modal-content-teacherclass"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Class Detail</h3>
              <p>
                <strong>ID:</strong> {selectedClass.fakeId}
              </p>
              <p>
                <strong>Name:</strong> {selectedClass.name}
              </p>
              <p>
                <strong>Subject:</strong> {selectedClass.subject}
              </p>
              <p>
                <strong>Schedule:</strong>{" "}
                {selectedClass.schedule
                  ? new Date(selectedClass.schedule).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <div className="modal-student-list">
                <strong>Students:</strong>
                <ul>
                  {selectedClass.students.map((s) => (
                    <li key={s.id}>
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
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
                <a
                  href={selectedClass.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faLink} /> Join Zoom
                </a>
              </p>
              <button className="btn-close-modal" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </HeaderTeacher>
  );
};

export default TeacherClass;
