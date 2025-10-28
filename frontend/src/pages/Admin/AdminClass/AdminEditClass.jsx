import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import "./AdminEditClass.css";

const AdminEditClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // chuyen utc sang format local
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000; // offset local
    return new Date(date - tzOffset).toISOString().slice(0, 16);
  };

  // chuyen nguoc lai truoc khi up len firestore
  const formatInputToUTC = (localDateString) => {
    const localDate = new Date(localDateString);
    const tzOffset = localDate.getTimezoneOffset() * 60000;
    return new Date(localDate.getTime() + tzOffset).toISOString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // get class by id
        const classRes = await fetch(`http://localhost:3002/api/admin/classes/${id}`);
        if (!classRes.ok) throw new Error("Failed to fetch class data");
        const cls = await classRes.json();

        // teacher list
        const teacherRes = await fetch("http://localhost:3002/api/admin/classes/teachers");
        const teachers = await teacherRes.json();
        setAllTeachers(teachers);

        // student list
        const studentRes = await fetch("http://localhost:3002/api/admin/classes/students");
        const students = await studentRes.json();
        setAllStudents(students);

        // teacher name
        const teacher = teachers.find(t => t.id === cls.teacherId);
        setClassData({
          ...cls,
          teacherName: teacher ? teacher.userName : "",
        });
      } 
      catch (err) {
        console.error(err);
        setError(err.message);
      } 
      finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading class data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!classData) return <p>Class not found</p>;

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "schedule") {
      setClassData({ ...classData, schedule: value }); 
    } else {
      setClassData({ ...classData, [name]: value });
    }
  };

  const handleSelectTeacher = (teacherId) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    setClassData({
      ...classData,
      teacherId: teacherId,
      teacherName: teacher ? teacher.userName : "",
    });
  };

  const handleSelectStudentId = (index, studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    const updatedStudents = [...classData.students];
    updatedStudents[index] = { id: student.id, name: student.userName };
    setClassData({ ...classData, students: updatedStudents });
  };

  const handleAddStudent = () => {
    setClassData({
      ...classData,
      students: [...classData.students, { id: "", name: "" }],
    });
  };

  const handleRemoveStudent = (index) => {
    const updatedStudents = classData.students.filter((_, i) => i !== index);
    setClassData({ ...classData, students: updatedStudents });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...classData,
        schedule: formatInputToUTC(classData.schedule), 
      };

      await fetch(`http://localhost:3002/api/admin/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      alert("Class updated successfully!");
      navigate("/admin/manage_class");
    } 
    catch (err) {
      console.error(err);
      alert("Failed to update class");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="admineditclass-container">
        <h2 className="admineditclass-title">Edit Class</h2>

        <form onSubmit={handleSubmit} className="admineditclass-form">
          <label>
            Name:
            <input type="text" name="name" value={classData.name} onChange={handleChange} />
          </label>

          <label>
            Subject:
            <input type="text" name="subject" value={classData.subject} onChange={handleChange} />
          </label>

          <label>
            Schedule:
            <input
              type="datetime-local"
              name="schedule"
              value={formatDateForInput(classData.schedule)}
              onChange={handleChange}
            />
          </label>

          <label>
            Drive Link:
            <input type="text" name="driveLink" value={classData.driveLink} onChange={handleChange} />
          </label>

          <label>
            Zoom Link:
            <input type="text" name="zoomLink" value={classData.zoomLink} onChange={handleChange} />
          </label>

          <label>
            Teacher:
            <select value={classData.teacherId} onChange={(e) => handleSelectTeacher(e.target.value)}>
              <option value="">-- Select Teacher --</option>
              {allTeachers.map(t => (
                <option key={t.id} value={t.id}>{t.userName}</option>
              ))}
            </select>
          </label>
          <input type="text" value={classData.teacherName} disabled className="teacher-name-display" />

          <div className="student-list-admineditclass">
            <h3>Student List</h3>
            {classData.students.map((student, index) => (
              <div key={index} className="student-item-admineditclass">
                <select
                  value={student.id}
                  onChange={(e) => handleSelectStudentId(index, e.target.value)}
                >
                  <option value="">-- Select Student ID --</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.id} - {s.userName}</option>
                  ))}
                </select>
                <input type="text" value={student.name} disabled placeholder="Student Name" />
                <button type="button" onClick={() => handleRemoveStudent(index)} className="btn-remove-student-admineditclass">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddStudent} className="btn-add-student-admineditclass">
              Add Student
            </button>
          </div>

          <div className="admineditclass-buttons">
            <button type="submit" className="btn-save-admineditclass">Save</button>
            <button type="button" className="btn-cancel-admineditclass" onClick={() => navigate("/admin/manage_class")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminEditClass;
