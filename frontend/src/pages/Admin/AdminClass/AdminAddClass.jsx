import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./AdminEditClass.css";

const AdminAddClass = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [classData, setClassData] = useState({
    name: "",
    subject: "",
    schedule: "",
    driveLink: "",
    zoomLink: "", // Đây là room link WebRTC
    teacherId: "",
    students: [], // {id, name}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherRes = await fetch(
          "http://localhost:3002/api/admin/classes/teachers"
        );
        const teacherData = await teacherRes.json();
        setTeachers(teacherData);

        const studentRes = await fetch(
          "http://localhost:3002/api/admin/classes/students"
        );
        const studentData = await studentRes.json();
        setStudents(studentData);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách giáo viên hoặc học sinh");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) =>
    setClassData({ ...classData, [e.target.name]: e.target.value });

  const handleSelectTeacher = (teacherId) =>
    setClassData({ ...classData, teacherId });

  const handleSelectStudent = (index, studentId) => {
    const student = students.find((s) => s.id === studentId);
    const updated = [...classData.students];
    updated[index] = { id: student.id, name: student.userName };
    setClassData({ ...classData, students: updated });
  };

  const handleAddStudent = () =>
    setClassData({
      ...classData,
      students: [...classData.students, { id: "", name: "" }],
    });

  // --- Tạo WebRTC room: chỉ cần tạo roomId, navigate sang VideoCall ---
  const handleCreateRoom = () => {
    if (!classData.name) {
      alert("Vui lòng nhập tên lớp trước khi tạo room");
      return;
    }

    const roomId = `class-${classData.name.replace(/\s+/g, "-")}-${Date.now()}`;
    const roomLink = `/video_call/${roomId}`; // local route WebRTC

    setClassData((prev) => ({ ...prev, zoomLink: roomLink }));

    alert("Room WebRTC đã được tạo! Click Save để lưu lớp hoặc chia sẻ link.");
  };

  const handleRemoveStudent = (index) => {
    const updated = classData.students.filter((_, i) => i !== index);
    setClassData({ ...classData, students: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...classData,
        schedule: new Date(classData.schedule).toISOString(),
      };

      const res = await fetch("http://localhost:3002/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Thêm lớp thất bại");
      }

      alert("Class added successfully!");
      navigate("/admin/manage_class");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <AdminHeader />
      <div className="admineditclass-container">
        <h2 className="admineditclass-title">Add New Class</h2>
        <form onSubmit={handleSubmit} className="admineditclass-form">
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={classData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Subject:
            <input
              type="text"
              name="subject"
              value={classData.subject}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Schedule:
            <input
              type="datetime-local"
              name="schedule"
              value={classData.schedule}
              onChange={handleChange}
              required
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
            Zoom/WebRTC Link:
            <input type="text" name="zoomLink" value={classData.zoomLink} readOnly />
            <button
              type="button"
              onClick={handleCreateRoom}
              className="btn-save-admineditclass"
            >
              Create Room
            </button>
          </label>

          <label>
            Teacher:
            <select
              value={classData.teacherId}
              onChange={(e) => handleSelectTeacher(e.target.value)}
              required
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.userName}
                </option>
              ))}
            </select>
          </label>

          <div className="student-list-admineditclass">
            <h3>Student List</h3>
            {classData.students.map((student, index) => (
              <div key={index} className="student-item-admineditclass">
                <select
                  value={student.id}
                  onChange={(e) => handleSelectStudent(index, e.target.value)}
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.userName}
                    </option>
                  ))}
                </select>
                <input type="text" value={student.name} disabled placeholder="Student Name" />
                <button
                  type="button"
                  onClick={() => handleRemoveStudent(index)}
                  className="btn-remove-student-admineditclass"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddStudent} className="btn-add-student-admineditclass">
              Add Student
            </button>
          </div>

          <div className="admineditclass-buttons">
            <button type="submit" className="btn-save-admineditclass">
              Save
            </button>
            <button type="button" className="btn-cancel-admineditclass" onClick={() => navigate("/admin/manage_class")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminAddClass;
