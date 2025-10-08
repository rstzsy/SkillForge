import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPen,
  faTrash,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import "./TeacherClass.css";

const TeacherClass = () => {
  const [classes, setClasses] = useState([
    {
      id: "S101",
      name: "Speaking 101",
      subject: "Speaking",
      studentCount: 25,
      schedule: "Mon 8:00-10:00",
      students: [
        { id: "ST01", name: "Nguyen Van A" },
        { id: "ST02", name: "Le Thi B" },
      ],
      driveLink: "https://drive.google.com/speaking101",
      zoomLink: "https://zoom.us/j/123456789",
    },
    {
      id: "R101",
      name: "Reading 101",
      subject: "Reading",
      studentCount: 30,
      schedule: "Tue 10:00-12:00",
      students: [
        { id: "ST03", name: "Tran Van C" },
        { id: "ST04", name: "Pham Thi D" },
      ],
      driveLink: "https://drive.google.com/reading101",
      zoomLink: "https://zoom.us/j/987654321",
    },
  ]);

  const [filter, setFilter] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this class?")) {
      setClasses(classes.filter((c) => c.id !== id));
    }
  };

  const handleView = (cls) => {
    setSelectedClass(cls);
    setShowModal(true);
  };
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/teacher/manage_class/edit/${id}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.id.toLowerCase().includes(filter.toLowerCase()) ||
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
                    <td>{cls.id}</td>
                    <td>{cls.name}</td>
                    <td>{cls.subject}</td>
                    <td>{cls.studentCount}</td>
                    <td>{cls.schedule}</td>
                    <td>
                      <div className="action-buttons-teacherclass">
                        <button
                          className="btn-view-teacherclass"
                          onClick={() => handleView(cls)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="btn-edit-teacherclass"
                          onClick={() => handleEdit(cls.id)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>

                        <button
                          className="btn-delete-teacherclass"
                          onClick={() => handleDelete(cls.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
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
                <strong>ID:</strong> {selectedClass.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedClass.name}
              </p>
              <p>
                <strong>Subject:</strong> {selectedClass.subject}
              </p>
              <p>
                <strong>Schedule:</strong> {selectedClass.schedule}
              </p>

              <div className="modal-student-list">
                <strong>Students:</strong>
                <ul>
                  {selectedClass.students.map((s) => (
                    <li key={s.id}>
                      {s.id} - {s.name}
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
