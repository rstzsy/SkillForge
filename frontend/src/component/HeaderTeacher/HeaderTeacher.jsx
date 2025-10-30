import { useState, useEffect } from "react";
import {
  faRightFromBracket,
  faHouse,
  faBook,
  faUsers,
  faChartBar,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./HeaderTeacher.css";

const HeaderTeacher = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("Teacher"); // default
  const [avatar, setAvatar] = useState("/assets/avatar.jpg"); // default avatar

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      if (storedUser.userName) setUserName(storedUser.userName);
      if (storedUser.avatar) setAvatar(storedUser.avatar);
    }
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: faHouse, link: "/teacher/dashboard" },
    { name: "Classes", icon: faBook, link: "/teacher/manage_class" },
    { name: "Students", icon: faUsers, link: "/teacher/manage_student" },
    { name: "Records", icon: faVideo, link: "/teacher/manage_record" },
  ];

  return (
    <div className="teacher-header-container">
      {/* HEADER */}
      <header className="teacher-header">
        <div className="teacher-logo-wrap">
          <img src="/logo.jpeg" alt="logo" className="teacher-logo-img" />
          <h1 className="teacher-logo-text">Teacher Portal</h1>
        </div>

        <div className="teacher-header-right">
          {/* Thông tin user */}
          <div className="teacher-user">
            <img
              src={avatar || "/assets/avatar.jpg"}
              alt={userName}
              className="avatar"
            />
            <span className="username">{userName}</span>
          </div>

          {/* Logout */}
          <button className="teacher-logout">
            <FontAwesomeIcon icon={faRightFromBracket} className="icon" />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`teacher-sidebar ${isOpen ? "open" : "collapsed"}`}>
        <nav className="teacher-menu">
          {menuItems.map((item, i) => (
            <a key={i} href={item.link} className="teacher-menu-item">
              <FontAwesomeIcon icon={item.icon} className="icon" />
              {isOpen && <span className="menu-text">{item.name}</span>}
            </a>
          ))}
        </nav>

        <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "<" : ">"}
        </button>
      </aside>

      {/* MAIN */}
      <main className={`teacher-main ${isOpen ? "ml-open" : "ml-collapsed"}`}>
        {children}
      </main>
    </div>
  );
};

export default HeaderTeacher;
