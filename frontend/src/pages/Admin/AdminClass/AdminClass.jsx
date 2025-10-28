import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faTrash, faLink } from "@fortawesome/free-solid-svg-icons";
import "./AdminClass.css";

const AdminClass = () => {
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/admin/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();

        // fake id
        const classesWithFakeId = data.map((cls, index) => ({
          ...cls,
          fakeId: `S${(index + 1).toString().padStart(4, "0")}`,
          teacherName: cls.teacherName || "N/A",
          students: cls.students || [],
        }));

        setClasses(classesWithFakeId);
      } 
      catch (err) {
        console.error(err);
        setError(err.message);
      } 
      finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this class?")) return;

    try {
      await fetch(`http://localhost:3002/api/admin/classes/${id}`, {
        method: "DELETE",
      });
      setClasses(classes.filter((c) => c.id !== id));
    } 
    catch (err) {
      console.error(err);
      alert("Failed to delete class");
    }
  };

  const handleView = (cls) => {
    setSelectedClass(cls);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.fakeId.toLowerCase().includes(filter.toLowerCase()) ||
      c.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <p>Loading classes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <AdminHeader />

      <div className="class-container-adminclass">
        <h2 className="page-title-adminclass">Manage Classes</h2>

        <div className="filter-section-adminclass">
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input-adminclass"
          />
        </div>

        <div className="table-wrapper-adminclass">
          <table className="class-table-adminclass">
            <thead>
              <tr>
                <th>Class ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Students</th>
                <th>Schedule</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.fakeId}</td>
                    <td>{cls.name}</td>
                    <td>{cls.subject}</td>
                    <td>{cls.teacherName}</td>
                    <td>{cls.students.length}</td>
                    <td>
                      {cls.schedule
                        ? new Date(cls.schedule).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </td>
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
                          onClick={() =>
                            navigate(`/admin/manage_class/edit/${cls.id}`)
                          }
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

        {showModal && selectedClass && (
          <div className="modal-overlay-adminclass" onClick={closeModal}>
            <div
              className="modal-content-adminclass"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Class Detail</h3>
              <p>
                <strong>ID:</strong> {selectedClass.fakeId}
              </p>
              <p>
                <strong>Name:</strong> {selectedClass.name}
              </p>
              <p>
                <strong>Subject:</strong> {selectedClass.subject}
              </p>
              <p>
                <strong>Teacher:</strong> {selectedClass.teacherName}
              </p>
              <p>
                <strong>Schedule:</strong>{" "}
                {selectedClass.schedule
                  ? new Date(selectedClass.schedule).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <div className="modal-student-list">
                <strong>Students:</strong>
                <ul>
                  {selectedClass.students.map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              </div>

              {selectedClass.driveLink && (
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
              )}
              {selectedClass.zoomLink && (
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
              )}

              <button className="btn-close-modal" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}

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
