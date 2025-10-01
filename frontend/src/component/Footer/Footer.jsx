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
            <img src="/assets/logo2.png" alt="IELTSForge Logo" className="footer-logo-img" />
            <span className="footer-logo-text">SkillForge</span>
          </div>
          <p className="footer-desc">
            SkillForge helps you prepare for the IELTS test comprehensively with a test bank, 
            smart AI scoring and a personalized learning path to achieve your desired band score.
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
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Teachers & Experts</a></li>
            <li><a href="#">Partnerships</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Learning */}
        <div className="footer-col">
          <h4>Learning</h4>
          <ul>
            <li><a href="#">Placement Test</a></li>
            <li><a href="#">IELTS Practice Tests</a></li>
            <li><a href="#">AI Scoring</a></li>
            <li><a href="#">Video Call with Teachers</a></li>
            <li><a href="#">Reports & Statistics</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Feedback</a></li>
            <li><a href="#">Terms & Conditions</a></li>
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
