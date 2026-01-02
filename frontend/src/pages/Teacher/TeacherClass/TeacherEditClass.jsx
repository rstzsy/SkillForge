import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import "./TeacherEditClass.css";

const TeacherEditClass = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  // Dữ liệu lớp (có thêm danh sách sinh viên)
  const [classData, setClassData] = useState({
    id: id,
    name: "Speaking 101",
    subject: "Speaking",
    schedule: "2025-10-10T08:00", // datetime-local format
    driveLink: "https://drive.google.com/speaking101",
    zoomLink: "https://zoom.us/j/123456789",
    students: [
      { id: "ST001", name: "Alice" },
      { id: "ST002", name: "Bob" },
      { id: "ST003", name: "Charlie" },
    ],
  });

  // Hàm thay đổi input
  const handleChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
  };

  // Lưu dữ liệu
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated class info:", classData);
    alert("Class updated successfully!");
    navigate("/teacher/manage_class");
  };

  return (
    <HeaderTeacher>
      <div className="editclass-container">
        <h2>Edit Class - {id}</h2>
        <form onSubmit={handleSubmit} className="editclass-form">
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={classData.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Subject:
            <input
              type="text"
              name="subject"
              value={classData.subject}
              onChange={handleChange}
            />
          </label>

          <label>
            Schedule:
            <input
              type="datetime-local"
              name="schedule"
              value={classData.schedule}
              onChange={handleChange}
            />
          </label>

          <label>
            Drive Link:
            <input
              type="text"
              name="driveLink"
              value={classData.driveLink}
              onChange={handleChange}
            />
          </label>

          <label>
            Room Link:
            <input
              type="text"
              name="zoomLink"
              value={classData.zoomLink}
              onChange={handleChange}
            />
          </label>

          {/* Danh sách sinh viên */}
          <div className="student-list-editclass">
            <h3>Student List</h3>
            <ul>
              {classData.students.map((student) => (
                <li key={student.id}>
                  {student.id} - {student.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="editclass-buttons">
            <button type="submit" className="btn-save-editclass">
              Save
            </button>
            <button
              type="button"
              className="btn-cancel-editclass"
              onClick={() => navigate("/teacher/manage_class")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </HeaderTeacher>
  );
};

export default TeacherEditClass;
