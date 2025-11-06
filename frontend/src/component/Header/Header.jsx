import React, { useState, useEffect, useRef } from 'react'
import './Header.css'
import { FiUser, FiMenu, FiX, FiHeart } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

const coupons = [
  { couponValue: 20, minOrderValue: 50, code: 'SAVE20' },
  { couponValue: 10, minOrderValue: 30, code: 'DISCOUNT10' },
  { couponValue: 15, minOrderValue: 40, code: 'SALE15' },
]

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const scrollRef = useRef(null)
  const navigate = useNavigate()

  const closeMenu = () => setMenuOpen(false)

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

  useEffect(() => {
    if (!scrollRef.current) return
    const wrapper = scrollRef.current
    const parentWidth = wrapper.parentElement.offsetWidth
    const contentWidth = wrapper.scrollWidth

    if (contentWidth < parentWidth) {
      let html = wrapper.innerHTML
      while (wrapper.scrollWidth < parentWidth * 1.5) {
        wrapper.innerHTML += html
      }
    }

    wrapper.style.setProperty('--scroll-width', `${wrapper.scrollWidth}px`)
    const speed = 80
    const duration = wrapper.scrollWidth / speed
    wrapper.style.animationDuration = `${duration}s`
  }, [coupons])

  return (
    <>
      {/* Coupon Banner */}
      <div className="top-strip">
        <div className="container-fluid">
          <p ref={scrollRef} className="mb-0 mt-0 scrolling-text">
            {coupons.map((coupon, idx) => (
              <span className="coupon-item" key={idx}>
                {coupon.couponValue}% OFF NOW FOR ORDER FROM ${coupon.minOrderValue} - Code: {coupon.code}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <img src="/assets/logo2.png" alt="SkillForge Logo" className="logo-img" />
          <span className="logo-text">SkillForge</span>
        </div>

        <nav className="header-nav">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/bookonline" className="nav-link">Booking</Link>

          <div className="nav-dropdown">
            <button className="nav-link dropdown-btn">Skills</button>
            <div className="dropdown-menu">
              <Link to="/speak">Speaking</Link>
              <Link to="/read">Reading</Link>
              <Link to="/listen">Listening</Link>
              <Link to="/write">Writing</Link>
            </div>
          </div>

          <div className="nav-dropdown">
            <button className="nav-link dropdown-btn">Pages</button>
            <div className="dropdown-menu">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/coursepage">My Course</Link>
              <Link to="/goalsetup">Setup Goal</Link>
              <Link to="/result">Result</Link>
            </div>
          </div>

          <Link to="/progress" className="nav-link">Progress</Link>
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
                <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                <li><Link to="/bookonline" onClick={closeMenu}>Booking</Link></li>
                <li><Link to="/speak" onClick={closeMenu}>Speaking</Link></li>
                <li><Link to="/read" onClick={closeMenu}>Reading</Link></li>
                <li><Link to="/write" onClick={closeMenu}>Writing</Link></li>
                <li><Link to="/listen" onClick={closeMenu}>Listening</Link></li>
                <li><Link to="/about" onClick={closeMenu}>About Us</Link></li>
                <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
                <li><Link to="/progress" onClick={closeMenu}>Progress</Link></li>
                <li><Link to="/coursepage" onClick={closeMenu}>My Course</Link></li>
                <li><Link to="/result" onClick={closeMenu}>Result</Link></li>
              </ul>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
