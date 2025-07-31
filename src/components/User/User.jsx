"use client"

import { useUser, useClerk } from "@clerk/clerk-react"
import Sidebar from "./Sidebar/sidebar" 

export default function User() {
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <>
    <Sidebar></Sidebar>
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title"> 
          <h1>User Dashboard</h1>
          <p className="dashboard-subtitle">Welcome, {user?.firstName || "User"}!</p>
        </div>
        <button className="logout-button" onClick={() => signOut({ redirectUrl: "/sign-in" })}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <h3>Profile</h3>
            <p>Manage your profile information</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>My Tasks</h3>
            <p>View and manage your tasks</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📈</div>
            <h3>Progress</h3>
            <p>Track your progress and achievements</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Messages</h3>
            <p>Check your messages and notifications</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
