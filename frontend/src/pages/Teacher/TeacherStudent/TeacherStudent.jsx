import { useState } from "react";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./TeacherStudent.css";

const TeacherStudent = () => {
  const [students, setStudents] = useState([
    {
      id: "S001",
      avatar: "/assets/avatar.jpg",
      name: "Nguyen Van A",
      email: "a@student.com",
      classId: "S101",
    },
    {
      id: "S002",
      avatar: "/assets/avatar.jpg",
      name: "Tran Thi B",
      email: "b@student.com",
      classId: "R101",
    },
    {
      id: "S003",
      avatar: "/assets/avatar.jpg",
      name: "Le Van C",
      email: "c@student.com",
      classId: "L102",
    },
  ]);

  const [filterClass, setFilterClass] = useState("");

  const handleDelete = (id) => {
    if (window.confirm("Remove this student?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const filteredStudents = students.filter((s) =>
    s.classId.toLowerCase().includes(filterClass.toLowerCase())
  );

  return (
    <HeaderTeacher>
      <div className="student-container-teacherstudent">
        <h2 className="page-title-teacherstudent">Manage Students</h2>

        {/* Filter */}
        <div className="filter-section-teacherstudent">
          <label htmlFor="classId">Class ID:</label>
          <input
            type="text"
            id="classId"
            placeholder="Enter Class ID..."
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="filter-input-teacherstudent"
          />
        </div>

        {/* Table */}
        <div className="table-wrapper-teacherstudent">
          <table className="student-table-teacherstudent">
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class ID</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stu) => (
                  <tr key={stu.id}>
                    <td>{stu.id}</td>
                    <td>
                      <img
                        src={stu.avatar}
                        alt={stu.name}
                        className="student-avatar-teacherstudent"
                      />
                    </td>
                    <td>{stu.name}</td>
                    <td>{stu.email}</td>
                    <td>{stu.classId}</td>
                    <td>
                      <button
                        className="btn-delete-teacherstudent"
                        onClick={() => handleDelete(stu.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data-teacherstudent">
                    No students found
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

export default TeacherStudent;
