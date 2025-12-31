import { useState, useEffect } from "react";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./TeacherStudent.css";

const TeacherStudent = () => {
  const [students, setStudents] = useState([]);
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.id) return;

      try {
        const res = await fetch(
          `https://skillforge-99ct.onrender.com/api/admin/users/teacher/students/${storedUser.id}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch students");
        setStudents(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    s => (s.className || "").toLowerCase().includes(filterClass.toLowerCase())
  );

  return (
    <HeaderTeacher>
      <div className="student-container-teacherstudent">
        <h2 className="page-title-teacherstudent">Manage Students</h2>

        <div className="filter-section-teacherstudent">
          <label htmlFor="classId">Class Name:</label>
          <input
            type="text"
            id="classId"
            placeholder="Enter Class Name..."
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="filter-input-teacherstudent"
          />
        </div>

        <div className="table-wrapper-teacherstudent">
          <table className="student-table-teacherstudent">
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stu, index) => (
                  <tr key={`${stu.id}-${stu.classId}`}> {/* key for class */}
                    <td>{`S${(index + 1).toString().padStart(4, "0")}`}</td>
                    <td>
                      <img
                        src={stu.avatar || "/assets/avatar.jpg"}
                        alt={stu.name}
                        className="student-avatar-teacherstudent"
                      />
                    </td>
                    <td>{stu.name}</td>
                    <td>{stu.email}</td>
                    <td>{stu.className}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data-teacherstudent">
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
