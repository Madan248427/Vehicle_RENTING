"use client"

import { Link, useLocation } from "react-router-dom"
import { useUser, useClerk } from "@clerk/clerk-react" // Import useClerk
import { Car } from "lucide-react" // Import Car icon
import "./Sidebar.css"

const Sidebar = () => {
  const { user, isLoaded } = useUser()
  const location = useLocation()
  const { signOut } = useClerk() // Get the signOut method from useClerk

  // Function to check if current path matches the nav item
  const isActive = (path) => {
    return location.pathname === path
  }

  // Logout handler
  const handleLogout = () => {
    signOut() // This will log the user out
  }

  return (
    <div className="app-sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      {/* Profile Section */}
      <div className="sidebar-profile-section">
        {isLoaded && user ? (
          <>
            <div className="sidebar-profile-image-container">
              <img
                src={user.imageUrl || user.profileImageUrl || "/default-avatar.png"}
                alt="Profile"
                className="sidebar-profile-image"
                onError={(e) => {
                  e.target.src = "/default-avatar.png"
                }}
              />
              <div className="sidebar-online-indicator"></div>
            </div>
            <div className="sidebar-profile-info">
              <h3 className="sidebar-profile-name">
                {user.username || `${user.firstName} ${user.lastName}` || "User"}
              </h3>
              <p className="sidebar-profile-email">{user.primaryEmailAddress?.emailAddress || "No email"}</p>
            </div>
          </>
        ) : (
          <div className="sidebar-profile-loading">
            <div className="sidebar-profile-skeleton"></div>
            <div className="sidebar-profile-text-skeleton">
              <div className="sidebar-skeleton-line"></div>
              <div className="sidebar-skeleton-line short"></div>
            </div>
          </div>
        )}
      </div>
      <nav className="sidebar-nav">
        <Link to="/user/profile" className={`sidebar-nav-link ${isActive("/user/profile") ? "active" : ""}`}>
          <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          Profile
        </Link>
        {/* New Vehicles Link */}
        <Link to="/user" className={`sidebar-nav-link ${isActive("/user") ? "active" : ""}`}>
          <Car className="sidebar-nav-icon" /> {/* Using Lucide React Car icon */}
          Vehicles
        </Link>
        <Link to="/user/booking" className={`sidebar-nav-link ${isActive("/user/booking") ? "active" : ""}`}>
          <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
          Booking
        </Link>
        <Link to="/user/rating" className={`sidebar-nav-link ${isActive("/user/rating") ? "active" : ""}`}>
          <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          Rating
        </Link>
        <Link to="/user/complain" className={`sidebar-nav-link ${isActive("/user/complain") ? "active" : ""}`}>
          <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" />
          </svg>
          Complain
        </Link>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          Logout
        </button>
      </nav>
    </div>
  )
}

export default Sidebar
