"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Menu, X } from "lucide-react" // Added Search icon
import "../../styles/Navbar.css"

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/vehicles?q=${encodeURIComponent(query.trim())}`)
      setIsMobileMenuOpen(false) // Close menu after search
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <span className="logo-accent">MotO</span>Via
          </Link>

          {/* Desktop Menu */}
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/vehicles" className={`nav-link ${location.pathname.startsWith("/vehicles") ? "active" : ""}`}>
                Vehicles
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/feedback" className={`nav-link ${location.pathname === "/feedback" ? "active" : ""}`}>
                Issue & Feedback
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                />
                {/* Optional: Add a search button/icon if desired */}
                {/* <button type="submit" className="search-button"><Search size={20} /></button> */}
              </form>
            </li>
          </ul>

          {/* Desktop Auth Buttons */}
          <div className="nav-actions">
            <div className="auth-buttons">
              <Link to="/sign-in" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/sign-up" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={closeMobileMenu}>
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close mobile menu">
            <X />
          </button>
          <ul className="mobile-nav-menu">
            <li className="mobile-nav-item">
              <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/vehicles" className="mobile-nav-link" onClick={closeMobileMenu}>
                Vehicles
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/feedback" className="mobile-nav-link" onClick={closeMobileMenu}>
                Issue & Feedback
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
                About
              </Link>
            </li>
            <li className="mobile-nav-item">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                />
              </form>
            </li>
          </ul>
          <div className="mobile-auth-buttons">
            <Link to="/sign-in" className="btn btn-outline" onClick={closeMobileMenu}>
              Sign In
            </Link>
            <Link to="/sign-up" className="btn btn-primary" onClick={closeMobileMenu}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
