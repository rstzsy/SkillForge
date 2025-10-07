import { useState } from "react";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./TeacherClass.css";

const TeacherClass = () => {
  const [classes, setClasses] = useState([
    { id: "S101", name: "Speaking 101", subject: "Speak", studentCount: 25, schedule: "Mon 8:00-10:00" },
    { id: "R101", name: "Reading 101", subject: "Read", studentCount: 30, schedule: "Tue 10:00-12:00" },
    { id: "L102", name: "Listening 102", subject: "Listen", studentCount: 28, schedule: "Wed 14:00-16:00" },
  ]);

  const [filter, setFilter] = useState("");

  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this class?")) {
      setClasses(classes.filter((c) => c.id !== id));
    }
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
                        <button className="btn-view-teacherclass">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="btn-edit-teacherclass">
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
      </div>
    </HeaderTeacher>
  );
};

export default TeacherClass;
