import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./AdminEditClass.css";

const AdminAddClass = () => {
  const navigate = useNavigate();

  // Danh sách sinh viên và giảng viên demo
  const allStudents = [
    { id: "ST001", name: "Alice" },
    { id: "ST002", name: "Bob" },
    { id: "ST003", name: "Charlie" },
    { id: "ST004", name: "David" },
  ];

  const allTeachers = [
    { id: "T001", name: "Mr. John" },
    { id: "T002", name: "Ms. Sarah" },
    { id: "T003", name: "Mr. David" },
  ];

  const [classData, setClassData] = useState({
    id: "",
    name: "",
    subject: "",
    schedule: "",
    driveLink: "",
    zoomLink: "",
    teacherId: "",
    teacherName: "",
    students: [],
  });

  // Thay đổi input lớp
  const handleChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
  };

  // Chọn giảng viên
  const handleSelectTeacher = (teacherId) => {
    const teacher = allTeachers.find((t) => t.id === teacherId);
    setClassData({
      ...classData,
      teacherId: teacher.id,
      teacherName: teacher.name,
    });
  };

  // Chỉnh sửa student name
  const handleStudentNameChange = (index, newName) => {
    const updatedStudents = [...classData.students];
    updatedStudents[index].name = newName;
    setClassData({ ...classData, students: updatedStudents });
  };

  // Chọn mã sinh viên từ danh sách
  const handleSelectStudentId = (index, newId) => {
    const student = allStudents.find((s) => s.id === newId);
    const updatedStudents = [...classData.students];
    updatedStudents[index] = {
      id: student.id,
      name: student.name,
    };
    setClassData({ ...classData, students: updatedStudents });
  };

  // Thêm student mới
  const handleAddStudent = () => {
    setClassData({
      ...classData,
      students: [...classData.students, { id: "", name: "" }],
    });
  };

  // Xóa student
  const handleRemoveStudent = (index) => {
    const updatedStudents = classData.students.filter((_, i) => i !== index);
    setClassData({ ...classData, students: updatedStudents });
  };

  // Lưu dữ liệu
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New class info:", classData);
    alert("Class added successfully!");
    navigate("/admin/manage_class");
  };

  return (
    <>
      <AdminHeader />

      <div className="admineditclass-container">
        <h2 className="admineditclass-title">Add New Class</h2>

        <form onSubmit={handleSubmit} className="admineditclass-form">
          <label>
            Class ID:
            <input
              type="text"
              name="id"
              value={classData.id}
              onChange={handleChange}
            />
          </label>

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
            Zoom Link:
            <input
              type="text"
              name="zoomLink"
              value={classData.zoomLink}
              onChange={handleChange}
            />
          </label>

          {/* Chọn giảng viên */}
          <label>
            Teacher:
            <select
              value={classData.teacherId}
              onChange={(e) => handleSelectTeacher(e.target.value)}
            >
              <option value="">-- Select Teacher --</option>
              {allTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.name}
                </option>
              ))}
            </select>
          </label>

          <input
            type="text"
            value={classData.teacherName}
            disabled
            className="teacher-name-display"
          />

          {/* Danh sách sinh viên */}
          <div className="student-list-admineditclass">
            <h3>Student List</h3>
            {classData.students.map((student, index) => (
              <div key={index} className="student-item-admineditclass">
                <select
                  value={student.id}
                  onChange={(e) => handleSelectStudentId(index, e.target.value)}
                >
                  <option value="">-- Select Student ID --</option>
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={student.name}
                  onChange={(e) => handleStudentNameChange(index, e.target.value)}
                  placeholder="Student Name"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStudent(index)}
                  className="btn-remove-student-admineditclass"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddStudent}
              className="btn-add-student-admineditclass"
            >
              Add Student
            </button>
          </div>

          <div className="admineditclass-buttons">
            <button type="submit" className="btn-save-admineditclass">
              Save
            </button>
            <button
              type="button"
              className="btn-cancel-admineditclass"
              onClick={() => navigate("/admin/manage_class")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminAddClass;
