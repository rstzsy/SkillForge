import React, { useState, useEffect, useRef } from 'react'
import './Header.css'
import { FiSearch, FiUser, FiMenu, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const coupons = [
  { couponValue: 20, minOrderValue: 50, code: 'SAVE20' },
  { couponValue: 10, minOrderValue: 30, code: 'DISCOUNT10' },
  { couponValue: 10, minOrderValue: 30, code: 'DISCOUNT10' },
  { couponValue: 10, minOrderValue: 30, code: 'DISCOUNT10' },
  { couponValue: 10, minOrderValue: 30, code: 'DISCOUNT10' },
  { couponValue: 10, minOrderValue: 30, code: 'DISCOUNT10' },
  { couponValue: 10, minOrderValue: 30, code: 'DISCOUNT10' },

]

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollRef = useRef(null)

  const closeMenu = () => setMenuOpen(false)

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

    const speed = 80 // px/giây
    const duration = wrapper.scrollWidth / speed
    wrapper.style.animationDuration = `${duration}s`
  }, [coupons])

  return (
    <>
      {/* Coupon Banner */}
      <div className="top-strip">
        <div className="container-fluid">
          <p ref={scrollRef} className="mb-0 mt-0 scrolling-text">
            {coupons.length > 0
              ? coupons.map((coupon, idx) => (
                  <span className="coupon-item" key={idx}>
                    {coupon.couponValue}% OFF NOW FOR ORDER FROM $
                    {coupon.minOrderValue} - Code: {coupon.code}
                  </span>
                ))
              : 'Loading coupons...'}
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
          <Link to="/collections" className="nav-link">About</Link>

          <div className="nav-dropdown">
            <button className="nav-link dropdown-btn">Skills</button>
            <div className="dropdown-menu">
              <Link to="/skills/speaking">Speaking</Link>
              <Link to="/skills/reading">Reading</Link>
              <Link to="/shop/listening">Listening</Link>
              <Link to="/shop/writing">Writing</Link>
            </div>
          </div>

          <div className="nav-dropdown">
            <button className="nav-link dropdown-btn">Pages</button>
            <div className="dropdown-menu">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        <div className="header-icons">
          <FiSearch className="icon" />
          <Link to="/account" className='icon'><FiUser className="icon" /></Link>
          <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </div>
        </div>

        {menuOpen && (
          <div className={`responsive-menu ${menuOpen ? 'open' : ''}`}>
            <div className="menu-content">
              <ul>
                <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                <li><Link to="/collections" onClick={closeMenu}>Skills</Link></li>
                <li><Link to="/" onClick={closeMenu}>Speaking</Link></li>
                <li><Link to="/" onClick={closeMenu}>Reading</Link></li>
                <li><Link to="/" onClick={closeMenu}>Writing</Link></li>
                <li><Link to="/about" onClick={closeMenu}>About Us</Link></li>
                <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
              </ul>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
