import React from 'react'
import './Footer.css'
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Logo + Description */}
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <img src="/assets/logo2.png" alt="SkillForge Logo" className="footer-logo-img" />
            <span className="footer-logo-text">SkillForge</span>
          </div>
          <p className="footer-desc">
            Donec elementum aliquet dui, ut feugiat est vulputate quis.
            Etiam egestas nulla nec odio posuere, ut porta tortor pretium.
          </p>
          <div className="footer-socials">
            <a href="#"><FiTwitter /></a>
            <a href="#"><FiFacebook /></a>
            <a href="#"><FiInstagram /></a>
          </div>
        </div>

        {/* About */}
        <div className="footer-col">
          <h4>About</h4>
          <ul>
            <li><a href="#">History</a></li>
            <li><a href="#">Our Team</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Services Offered</a></li>
            <li><a href="#">Product Catalog</a></li>
          </ul>
        </div>

        {/* Information */}
        <div className="footer-col">
          <h4>Information</h4>
          <ul>
            <li><a href="#">Store Location</a></li>
            <li><a href="#">Order Tracking</a></li>
            <li><a href="#">Affiliate</a></li>
            <li><a href="#">Sizing Guide</a></li>
            <li><a href="#">Accessibility</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Your Account</a></li>
            <li><a href="#">Press Release</a></li>
            <li><a href="#">Return Centre</a></li>
            <li><a href="#">App Download</a></li>
            <li><a href="#">Advertisements</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SkillForge. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
