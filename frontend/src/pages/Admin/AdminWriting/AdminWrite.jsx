import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase/config"; // ✅ đường dẫn tới file firebase.js
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import "../AdminListen/AdminListen.css";

const AdminWrite = () => {
  const [writings, setWritings] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // ✅ Lấy dữ liệu từ Firestore khi load trang
  useEffect(() => {
    const fetchWritings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "writing_practices"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWritings(items);
        console.log("🔥 Loaded writings:", items);
      } catch (error) {
        console.error("❌ Error fetching writings:", error);
      }
    };

    fetchWritings();
  }, []);

  // Bộ lọc
  const filteredWritings = writings.filter((item) => {
    return (
      item.title?.toLowerCase().includes(search.toLowerCase()) &&
      (filterSection ? item.section === filterSection : true) &&
      (filterType ? item.type === filterType : true)
    );
  });

  // ✅ Xóa thật trong Firestore
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this writing task?")) {
      try {
        await deleteDoc(doc(db, "writing_practices", id));
        setWritings(writings.filter((item) => item.id !== id));
        alert("✅ Deleted successfully!");
      } catch (error) {
        console.error("❌ Error deleting writing:", error);
        alert("Failed to delete writing task.");
      }
    }
  };


  // Xử lý upload file Excel → Gọi API backend import
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3002/api/writing/import-excel", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      alert(result.message);

      // ✅ Reload Firestore sau khi import xong
      const querySnapshot = await getDocs(collection(db, "writing_practices"));
      setWritings(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("❌ Import failed:", error);
      alert("Failed to import Excel file");
    }
  };

  return (
    <div className="lesson-container-listenadmin">
      <AdminHeader />
      <h1 className="lesson-title-listenadmin">Manage Writing Practices</h1>

      {/* Bộ lọc + Upload */}
      <div className="lesson-filter-listenadmin">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lesson-search-listenadmin"
        />

        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Sections</option>
          <option value="Task 1">Task 1</option>
          <option value="Task 2">Task 2</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="lesson-select-listenadmin"
        >
          <option value="">Types</option>
          <option value="Academic">Academic</option>
          <option value="Essay">Essay</option>
        </select>

        {/* Upload button */}
        <label className="lesson-upload-label-listenadmin">
          <FontAwesomeIcon icon={faUpload} /> Upload File
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Danh sách Writing */}
      <div className="lesson-grid-listenadmin">
        {filteredWritings.map((item) => (
          <div key={item.id} className="lesson-card-listenadmin">
            <img
              src={"/assets/listpic.jpg"}
              alt={item.title}
              className="lesson-image-listenadmin"
            />
            <span className="lesson-section-badge-listenadmin">
              {item.section}
            </span>
            <h2 className="lesson-card-title-listenadmin">{item.title}</h2>
            <p className="lesson-type-listenadmin">{item.type}</p>
            <p className="lesson-attempts-listenadmin">
              {item.attempts || 0} attempts
            </p>
            <div className="lesson-control-listenadmin">
              <button
                className="lesson-btn-edit-listenadmin"
                onClick={() => navigate(`/admin/practice_writing/edit/${item.id}`)}
              >
                <FontAwesomeIcon icon={faPen} size="sm" />
              </button>
              <button
                className="lesson-btn-delete-listenadmin"
                onClick={() => handleDelete(item.id)}
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm */}
      <button
        className="lesson-btn-add-listadmin"
        onClick={() => navigate("/admin/practice_writing/add")}
      >
        Add Writing Task
      </button>
    </div>
  );
};

export default AdminWrite;
