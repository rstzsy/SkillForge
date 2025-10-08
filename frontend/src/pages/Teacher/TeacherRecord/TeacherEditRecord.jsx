import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import "./TeacherRecord.css";

const TeacherEditRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { records = [], classesList = [] } = location.state || {};

  const [recordData, setRecordData] = useState({
    id: "",
    classId: "",
    className: "",
    date: "",
    file: "",
  });

  useEffect(() => {
    const record = records.find((r) => r.id === id);
    if (record) {
      setRecordData(record);
    }
  }, [id, records]);

  const handleInputChange = (e) => {
    setRecordData({ ...recordData, [e.target.name]: e.target.value });
  };

  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    const classInfo = classesList.find((c) => c.id === selectedId);
    setRecordData({
      ...recordData,
      classId: selectedId,
      className: classInfo ? classInfo.name : "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Edited Record Data:", recordData);
    alert("Record saved! Check console for details.");
    navigate("/teacher/manage_record");
  };

  return (
    <HeaderTeacher>
      <div className="record-container-teacherrecord">
        <h2>Edit Record - {id}</h2>
        <form className="add-form-teacherrecord" onSubmit={handleSubmit}>
          <label>ID:</label>
          <input type="text" name="id" value={recordData.id} readOnly />

          <label>Class ID:</label>
          <select name="classId" value={recordData.classId} onChange={handleClassChange} required>
            <option value="">-- Select Class --</option>
            {classesList.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.id}
              </option>
            ))}
          </select>

          <label>Class Name:</label>
          <input type="text" name="className" value={recordData.className} readOnly />

          <label>Date:</label>
          <input type="date" name="date" value={recordData.date} onChange={handleInputChange} required />

          <label>Drive Link:</label>
          <input type="url" name="file" value={recordData.file} onChange={handleInputChange} required />

          <div className="add-form-buttons-teacherrecord">
            <button type="submit" className="btn-save-teacherrecord">Save</button>
            <button type="button" className="btn-cancel-teacherrecord" onClick={() => navigate("/teacher/manage_record")}>Cancel</button>
          </div>
        </form>
      </div>
    </HeaderTeacher>
  );
};

export default TeacherEditRecord;
