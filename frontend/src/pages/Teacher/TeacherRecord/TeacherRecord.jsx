import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import "./TeacherRecord.css";

const TeacherRecord = () => {
  const navigate = useNavigate();

  const classesList = [
    { id: "S101", name: "Speaking 101" },
    { id: "R101", name: "Reading 101" },
    { id: "L102", name: "Listening 102" },
  ];

  const [records, setRecords] = useState([
    {
      id: "R001",
      classId: "S101",
      className: "Speaking 101",
      date: "2025-10-01",
      file: "https://drive.google.com/speaking101",
    },
    {
      id: "R002",
      classId: "R101",
      className: "Reading 101",
      date: "2025-10-03",
      file: "https://drive.google.com/reading101",
    },
  ]);

  const [filter, setFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    id: "",
    classId: "",
    className: "",
    date: "",
    file: "",
  });

  const handleInputChange = (e) => {
    setNewRecord({ ...newRecord, [e.target.name]: e.target.value });
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newRecord.id || !newRecord.classId || !newRecord.className || !newRecord.date || !newRecord.file) {
      alert("Please fill in all required fields!");
      return;
    }
    setRecords([...records, newRecord]);
    setShowAddForm(false);
    setNewRecord({ id: "", classId: "", className: "", date: "", file: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this record?")) {
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.id.toLowerCase().includes(filter.toLowerCase()) ||
      r.classId.toLowerCase().includes(filter.toLowerCase()) ||
      r.className.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <HeaderTeacher>
      <div className="record-container-teacherrecord">
        <div className="record-header-teacherrecord">
          <h2 className="record-title-teacherrecord">Manage Lesson Records</h2>
        </div>

        {/* Filter */}
        <div className="record-filter-teacherrecord">
          <input
            type="text"
            placeholder="Search by ID, Class ID, or Class Name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="record-table-wrapper-teacherrecord">
          <table className="record-table-teacherrecord">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Class ID</th>
                <th>Class Name</th>
                <th>Date</th>
                <th>Drive Link</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.classId}</td>
                    <td>{record.className}</td>
                    <td>{record.date}</td>
                    <td>
                      <a href={record.file} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </td>
                    <td>
                      <div className="record-action-buttons-teacherrecord">
                        <button
                          className="btn-edit-teacherrecord"
                          onClick={() =>
                            navigate(`/teacher/manage_record/edit/${record.id}`, {
                              state: { records, classesList },
                            })
                          }
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          className="btn-delete-teacherrecord"
                          onClick={() => handleDelete(record.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data-teacherrecord">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Record Button */}
        <button className="btn-add-teacherrecord" onClick={() => setShowAddForm(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Record
        </button>

        {/* Add Record Form */}
        {showAddForm && (
          <div className="record-modal-overlay-teacherrecord" onClick={() => setShowAddForm(false)}>
            <div className="record-modal-content-teacherrecord" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Record</h3>
              <form onSubmit={handleAddRecord} className="add-form-teacherrecord">
                <label>ID:</label>
                <input
                  type="text"
                  name="id"
                  value={newRecord.id}
                  onChange={handleInputChange}
                  required
                />

                <label>Class ID:</label>
                <select
                  name="classId"
                  value={newRecord.classId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const classInfo = classesList.find((c) => c.id === selectedId);
                    setNewRecord({
                      ...newRecord,
                      classId: selectedId,
                      className: classInfo ? classInfo.name : "",
                    });
                  }}
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classesList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.id}
                    </option>
                  ))}
                </select>

                <label>Class Name:</label>
                <input type="text" name="className" value={newRecord.className} readOnly />

                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={newRecord.date}
                  onChange={handleInputChange}
                  required
                />

                <label>Drive Link:</label>
                <input
                  type="url"
                  name="file"
                  value={newRecord.file}
                  onChange={handleInputChange}
                  required
                />

                <div className="add-form-buttons-teacherrecord">
                  <button type="submit" className="btn-save-teacherrecord">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-cancel-teacherrecord"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </HeaderTeacher>
  );
};

export default TeacherRecord;
