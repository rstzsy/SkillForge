import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { FaUserCircle, FaHome, FaSignOutAlt } from "react-icons/fa";
import { IoPerson, IoLogInOutline } from "react-icons/io5";
import { BiCategoryAlt } from "react-icons/bi";
import { FaRocketchat } from "react-icons/fa6";
import { MdLibraryBooks } from "react-icons/md";
import { RiBook2Fill } from "react-icons/ri";
import { FaBook } from "react-icons/fa";
import "./HeaderAdmin.css";

const HeaderAdmin = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation(); 
    const navigate = useNavigate(); 

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="admin-logo">
                    <img src="/assets/logo2.png" alt="logo" className="admin-logo-image" />
                </div>
                <ul>
                    <li className={location.pathname === "/admin" ? "active" : ""} onClick={() => navigate("/admin")}>
                        <FaHome />
                        <span className="sidebar-text">Dashboard</span>
                    </li>
                    <li className={location.pathname === "/admin/manage_user" ? "active" : ""} onClick={() => navigate("/admin/manage_user")}>
                        <IoPerson />
                        <span className="sidebar-text">Users</span>
                    </li>
                    <li className={location.pathname === "/admin/manage_booking" ? "active" : ""} onClick={() => navigate("/admin/manage_booking")}>
                        <FaBook />
                        <span className="sidebar-text">Manage booking</span>
                    </li> 
                    <li className={location.pathname === "/admin/test_results" ? "active" : ""} onClick={() => navigate("/admin/test_results")}>
                        <BiCategoryAlt />
                        <span className="sidebar-text">Test Results</span>
                    </li>
                    <li className={location.pathname === "/admin/learning_path" ? "active" : ""} onClick={() => navigate("/admin/learning_path")}>
                        <MdLibraryBooks />
                        <span className="sidebar-text">Personal Learning Path</span>
                    </li>
                    <li className={location.pathname === "/admin/practice_listening" ? "active" : ""} onClick={() => navigate("/admin/practice_listening")}>
                        <RiBook2Fill />
                        <span className="sidebar-text">Listening Practice</span>
                    </li>
                    <li className={location.pathname === "/admin/practice_reading" ? "active" : ""} onClick={() => navigate("/admin/practice_reading")}>
                        <FaRocketchat />
                        <span className="sidebar-text">Reading Practice</span>
                    </li>
                    <li className={location.pathname === "/admin/practice_writing" ? "active" : ""} onClick={() => navigate("/admin/practice_writing")}>
                        <RiBook2Fill />
                        <span className="sidebar-text">Writing Practice</span>
                    </li>
                    <li className={location.pathname === "/admin/practice_speaking" ? "active" : ""} onClick={() => navigate("/admin/practice_speaking")}>
                        <FaRocketchat />
                        <span className="sidebar-text">Speaking Practice</span>
                    </li>
                    {/* {/* <li className={location.pathname === "/admin/skill_tests" ? "active" : ""} onClick={() => navigate("/admin/skill_tests")}>
                        <RiBook2Fill />
                        <span className="sidebar-text">Skill-Based Tests</span>
                    </li> */}
                    <li className="logout-item" onClick={() => console.log("Logging out...")}>
                        <FaSignOutAlt />
                        <span className="sidebar-text">Logout</span>
                    </li>
                </ul>
            </aside>

            {/* Header */}
            <div className="main-content">
                <header className="admin-header">
                    <h2 className="admin-title">Administration</h2>
                    <div className="header-right">
                        <div className="admin-searchBar">
                            <input type="text" placeholder="Search anything..." />
                            <button className="admin-searchButton">
                                <IoIosSearch size={20} className="icon-search-admin" />
                            </button>
                        </div>

                        <div className="admin-avatar">
                            <FaUserCircle size={30} onClick={toggleDropdown} className="avatar-icon" />
                            {dropdownOpen && (
                                <div className="dropdown-menu">
                                    <ul>
                                        <li onClick={() => navigate("/account")}><IoPerson className="icon-dropdown-admin" /> Account</li>
                                        <li onClick={() => console.log("Logging out...")}><IoLogInOutline className="icon-dropdown-admin" /> Log Out</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
            </div>
        </div>
    );
};

export default HeaderAdmin;
