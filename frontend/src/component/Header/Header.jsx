import React, { useState, useEffect, useRef } from 'react'
import './Header.css'
import { FiUser, FiMenu, FiX, FiHeart } from 'react-icons/fi'
import { Link, useNavigate, useLocation } from 'react-router-dom'



const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation() // Thêm useLocation để lấy đường dẫn hiện tại

  const closeMenu = () => setMenuOpen(false)

  // Hàm kiểm tra link có active không
  const isActive = (path) => {
    return location.pathname === path
  }

  // Hàm kiểm tra dropdown Skills có active không
  const isSkillsActive = () => {
    return ['/speak', '/read', '/listen', '/write'].includes(location.pathname)
  }

  // Hàm kiểm tra dropdown Pages có active không
  const isPagesActive = () => {
    return ['/about', '/contact', '/coursepage', '/goalsetup', '/result'].includes(location.pathname)
  }

  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'))
      if (storedUser) {
        setIsLoggedIn(true)
        setUser(storedUser)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    }

    checkLoginStatus()

    window.addEventListener('storage', checkLoginStatus)
    return () => window.removeEventListener('storage', checkLoginStatus)
  }, [])


  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
    setIsUserMenuOpen(false)
    navigate('/login')
  }


  return (
    <>

      {/* Header */}
      <header className="header">
        <Link to="/" className="header-logo" onClick={closeMenu}>
          <img src="/assets/logo2.png" alt="SkillForge Logo" className="logo-img" />
          <span className="logo-text">SkillForge</span>
        </Link>

        <nav className="header-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/bookonline" className={`nav-link ${isActive('/bookonline') ? 'active' : ''}`}>
            Booking
          </Link>

          <div className="nav-dropdown">
            <button className={`nav-link dropdown-btn ${isSkillsActive() ? 'active' : ''}`}>
              Skills
            </button>
            <div className="dropdown-menu">
              <Link to="/speak" className={isActive('/speak') ? 'active' : ''}>Speaking</Link>
              <Link to="/read" className={isActive('/read') ? 'active' : ''}>Reading</Link>
              <Link to="/listen" className={isActive('/listen') ? 'active' : ''}>Listening</Link>
              <Link to="/write" className={isActive('/write') ? 'active' : ''}>Writing</Link>
            </div>
          </div>

          <div className="nav-dropdown">
            <button className={`nav-link dropdown-btn ${isPagesActive() ? 'active' : ''}`}>
              Pages
            </button>
            <div className="dropdown-menu">
              <Link to="/about" className={isActive('/about') ? 'active' : ''}>About Us</Link>
              <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
              <Link to="/coursepage" className={isActive('/coursepage') ? 'active' : ''}>My Course</Link>
              <Link to="/goalsetup" className={isActive('/goalsetup') ? 'active' : ''}>Setup Goal</Link>
              <Link to="/result" className={isActive('/result') ? 'active' : ''}>Result</Link>
            </div>
          </div>

          <Link to="/progress" className={`nav-link ${isActive('/progress') ? 'active' : ''}`}>
            Progress
          </Link>
        </nav>

        <div className="header-icons">
          <Link to="/wishlist" className="icon-wrapper"><FiHeart className="icon" /></Link>

          {/* Avatar menu */}
          <div
            className="icon-wrapper user-menu"
            onMouseEnter={() => setIsUserMenuOpen(true)}
            onMouseLeave={() => setIsUserMenuOpen(false)}
          >
            <FiUser className="icon" />
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <ul>
                  {isLoggedIn ? (
                    <>
                      <li><Link to="/account" onClick={() => setIsUserMenuOpen(false)}>Profile</Link></li>
                      <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/login" onClick={() => setIsUserMenuOpen(false)}>Login</Link></li>
                      <li><Link to="/register" onClick={() => setIsUserMenuOpen(false)}>Register</Link></li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </div>
        </div>

        {menuOpen && (
          <div className={`responsive-menu ${menuOpen ? 'open' : ''}`}>
            <div className="menu-content">
              <ul>
                <li><Link to="/" onClick={closeMenu} className={isActive('/') ? 'active' : ''}>Home</Link></li>
                <li><Link to="/bookonline" onClick={closeMenu} className={isActive('/bookonline') ? 'active' : ''}>Booking</Link></li>
                <li><Link to="/speak" onClick={closeMenu} className={isActive('/speak') ? 'active' : ''}>Speaking</Link></li>
                <li><Link to="/read" onClick={closeMenu} className={isActive('/read') ? 'active' : ''}>Reading</Link></li>
                <li><Link to="/write" onClick={closeMenu} className={isActive('/write') ? 'active' : ''}>Writing</Link></li>
                <li><Link to="/listen" onClick={closeMenu} className={isActive('/listen') ? 'active' : ''}>Listening</Link></li>
                <li><Link to="/about" onClick={closeMenu} className={isActive('/about') ? 'active' : ''}>About Us</Link></li>
                <li><Link to="/contact" onClick={closeMenu} className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
                <li><Link to="/progress" onClick={closeMenu} className={isActive('/progress') ? 'active' : ''}>Progress</Link></li>
                <li><Link to="/coursepage" onClick={closeMenu} className={isActive('/coursepage') ? 'active' : ''}>My Course</Link></li>
                <li><Link to="/result" onClick={closeMenu} className={isActive('/result') ? 'active' : ''}>Result</Link></li>
              </ul>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header