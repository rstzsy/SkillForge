import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPen,
  faTrash,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminClass.css";

const AdminClass = () => {
  const [classes, setClasses] = useState([
    {
      id: "S101",
      name: "Speaking 101",
      subject: "Speaking",
      studentCount: 25,
      teacher: { id: "T01", name: "Mr. John" },
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
      teacher: { id: "T02", name: "Ms. Mary" },
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
  const navigate = useNavigate();

  // Xử lý xóa lớp học
  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this class?")) {
      setClasses(classes.filter((c) => c.id !== id));
    }
  };

  // Xử lý xem chi tiết
  const handleView = (cls) => {
    setSelectedClass(cls);
    setShowModal(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (id) => {
    navigate(`/admin/manage_class/edit/${id}`);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  // Lọc lớp học
  const filteredClasses = classes.filter(
    (c) =>
      c.id.toLowerCase().includes(filter.toLowerCase()) ||
      c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      {/* Header & Sidebar */}
      <AdminHeader />

      {/* Main content */}
      <div className="class-container-adminclass">
        <h2 className="page-title-adminclass">Manage Classes</h2>

        {/* Filter */}
        <div className="filter-section-adminclass">
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input-adminclass"
          />
        </div>

        {/* Table */}
        <div className="table-wrapper-adminclass">
          <table className="class-table-adminclass">
            <thead>
              <tr>
                <th>Class ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Teacher</th> {/* Thêm cột giáo viên */}
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
                    <td>{cls.teacher ? cls.teacher.name : "N/A"}</td>{" "}
                    {/* Hiển thị tên giáo viên */}
                    <td>{cls.studentCount}</td>
                    <td>{cls.schedule}</td>
                    <td>
                      <div className="action-buttons-adminclass">
                        <button
                          className="btn-view-adminclass"
                          onClick={() => handleView(cls)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="btn-edit-adminclass"
                          onClick={() => handleEdit(cls.id)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          className="btn-delete-adminclass"
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
                  <td colSpan="7" className="no-data-adminclass">
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal View Detail */}
        {showModal && selectedClass && (
          <div className="modal-overlay-adminclass" onClick={closeModal}>
            <div
              className="modal-content-adminclass"
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
                <strong>Teacher:</strong> {selectedClass.teacher.name}
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

        {/* button add */}
        <button
          className="btn-add-class-adminclass"
          onClick={() => navigate("/admin/manage_class/add")}
        >
          Add Class
        </button>
      </div>
    </>
  );
};

export default AdminClass;
