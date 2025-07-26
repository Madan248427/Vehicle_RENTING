"use client"
import { Phone, Mail, Clock, Facebook, Twitter, Youtube, Instagram, MapPin } from "lucide-react"
import { Link } from "react-router-dom" // Import Link for navigation
import "../../styles/footer.css" // Import the new CSS file

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Link to="/" className="footer-logo">
              <span className="logo-accent">rent</span>aly
            </Link>
            <p className="footer-description">
              Your trusted partner for premium car rentals. Experience comfort, reliability, and exceptional service on
              every journey. We're committed to making your travel dreams come true.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Youtube">
                <Youtube size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="footer-link">
                  Our Fleet
                </Link>
              </li>
              <li>
                <Link to="/services" className="footer-link">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Our Services</h4>
            <ul className="footer-links">
              <li>
                <Link to="/services/car-rental" className="footer-link">
                  Car Rental
                </Link>
              </li>
              <li>
                <Link to="/services/long-term" className="footer-link">
                  Long Term Rental
                </Link>
              </li>
              <li>
                <Link to="/services/airport-transfer" className="footer-link">
                  Airport Transfer
                </Link>
              </li>
              <li>
                <Link to="/services/chauffeur" className="footer-link">
                  Chauffeur Service
                </Link>
              </li>
              <li>
                <Link to="/services/corporate" className="footer-link">
                  Corporate Rental
                </Link>
              </li>
              <li>
                <Link to="/services/wedding" className="footer-link">
                  Wedding Cars
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Contact Info</h4>
            <div className="contact-info">
              <div className="contact-item">
                <Phone className="contact-icon" size={16} />
                <span>+208 333 9296</span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" size={16} />
                <span>contact@Motovia.com</span>
              </div>
              <div className="contact-item">
                <Clock className="contact-icon" size={16} />
                <span>Mon - Fri 08.00 - 18.00</span>
              </div>
              <div className="contact-item">
                <MapPin className="contact-icon" size={16} />
                <span>123 Main Street, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; 2024 Motovia. All rights reserved. |{" "}
            <Link to="/privacy-policy" className="footer-link">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link to="/terms-of-service" className="footer-link">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
