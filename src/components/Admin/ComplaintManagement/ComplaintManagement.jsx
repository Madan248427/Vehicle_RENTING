"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { AlertTriangle, Plus, User, Calendar, Clock, MessageSquare, Car, Phone, Mail, CheckCircle, XCircle, AlertCircle, Loader2, Filter, Search, Eye, Edit3 } from 'lucide-react'
import Sidebar from "../Sidebar/sidebar-dashboard"
import "./ComplaintManagement.css"
import { Link } from 'react-router-dom';

export default function ComplaintManagement() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchComplaints() {
      if (!isLoaded || !isSignedIn) return

      try {
        setLoading(true)
        setError(null)

        const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)

        const complaintsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setComplaints(complaintsData)
      } catch (error) {
        console.error("Error fetching complaints:", error)
        setError("Failed to load complaints. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [isLoaded, isSignedIn, user])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "N/A"
    }
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "solved":
        return "solved"
      case "in-progress":
        return "in-progress"
      case "not-solved":
      default:
        return "not-solved"
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "urgent"
      case "high":
        return "high"
      case "medium":
        return "medium"
      case "low":
      default:
        return "low"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "vehicle-condition":
      case "accident":
        return <Car size={16} />
      case "customer-service":
        return <User size={16} />
      case "technical":
      case "app":
        return <AlertCircle size={16} />
      default:
        return <MessageSquare size={16} />
    }
  }

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      setUpdating(true)
      await updateDoc(doc(db, "complaints", complaintId), {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setComplaints((prev) =>
        prev.map((complaint) => (complaint.id === complaintId ? { ...complaint, status: newStatus } : complaint)),
      )

      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating complaint status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus = filterStatus === "all" || complaint.status === filterStatus
    const matchesPriority = filterPriority === "all" || complaint.priority === filterPriority
    const matchesSearch =
      searchTerm === "" ||
      complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesPriority && matchesSearch
  })

  const calculateStats = () => {
    const total = complaints.length
    const solved = complaints.filter((c) => c.status === "solved").length
    const inProgress = complaints.filter((c) => c.status === "in-progress").length
    const urgent = complaints.filter((c) => c.priority === "urgent").length

    return { total, solved, inProgress, urgent }
  }

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  if (!isLoaded) {
    return (
      <>
        <Sidebar />
        <div className="complaint-container">
          <div className="complaint-loading">
            <Loader2 size={32} className="loading-spinner" />
            <span>Loading user...</span>
          </div>
        </div>
      </>
    )
  }

  if (!isSignedIn) {
    return (
      <>
        <Sidebar />
        <div className="complaint-container">
          <div className="complaint-error">
            <AlertTriangle className="error-icon" />
            <h2>Authentication Required</h2>
            <p>You must be signed in to view complaints.</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="complaint-container">
          <div className="complaint-loading">
            <Loader2 size={32} className="loading-spinner" />
            <span>Loading complaints...</span>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="complaint-container">
          <div className="complaint-error">
            <AlertCircle className="error-icon" />
            <h2>Error Loading Complaints</h2>
            <p>{error}</p>
          </div>
        </div>
      </>
    )
  }

  const stats = calculateStats()

  return (
    <>
      <Sidebar />
      <div className="complaint-container">
        <div className="complaint-header">
          <div className="header-content">
            <h1>Complaint Management</h1>
            <p>Monitor and resolve customer complaints</p>
          </div>
<Link to="/admin/complain/COM">
  <button className="add-complaint-btn">
    <Plus size={20} />
    Add Complaint
  </button>
</Link>
        </div>

        <div className="complaint-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card solved">
            <div className="stat-number">{stats.solved}</div>
            <div className="stat-label">Solved</div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card urgent">
            <div className="stat-number">{stats.urgent}</div>
            <div className="stat-label">Urgent</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="not-solved">Not Solved</option>
              <option value="in-progress">In Progress</option>
              <option value="solved">Solved</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="no-complaints">
            <AlertTriangle className="no-complaints-icon" />
            <h2>No Complaints Found</h2>
            <p>
              {complaints.length === 0
                ? "No complaints have been submitted yet."
                : "No complaints match your current filters."}
            </p>
          </div>
        ) : (
          <div className="complaints-list">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-main">
                  <div className="complaint-info">
                    <div className="complaint-header-row">
                      <div className="category-icon">{getCategoryIcon(complaint.category)}</div>
                      <div className="complaint-subject">{complaint.subject || "No Subject"}</div>
                      <div className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                        {complaint.priority || "Medium"}
                      </div>
                    </div>
                    <div className="complaint-meta">
                      <span className="complaint-category">{complaint.category || "Other"}</span>
                      {complaint.vehicleName && <span className="vehicle-name">• {complaint.vehicleName}</span>}
                    </div>
                  </div>

                  <div className="complaint-date">
                    <Calendar size={14} />
                    <span>{formatDate(complaint.createdAt)}</span>
                  </div>
                  <div className="complaint-contact">
                    {complaint.phone && (
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{complaint.phone}</span>
                      </div>
                    )}
                    {complaint.userEmail && (
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{complaint.userEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="complaint-actions">
                  <div className={`status-badge ${getStatusClass(complaint.status)}`}>
                    {complaint.status === "solved" && <CheckCircle size={14} />}
                    {complaint.status === "in-progress" && <Clock size={14} />}
                    {complaint.status === "not-solved" && <XCircle size={14} />}
                    <span>{complaint.status?.replace("-", " ") || "Not Solved"}</span>
                  </div>
                  <div className="action-buttons">
                    <button className="action-btn view" onClick={() => handleViewDetails(complaint)}>
                      <Eye size={16} />
                    </button>
                    <div className="status-dropdown">
                      <select
                        value={complaint.status || "not-solved"}
                        onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                        disabled={updating}
                      >
                        <option value="not-solved">Not Solved</option>
                        <option value="in-progress">In Progress</option>
                        <option value="solved">Solved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedComplaint && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Complaint Details</h3>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Subject:</label>
                      <span>{selectedComplaint.subject || "No Subject"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Category:</label>
                      <span>{selectedComplaint.category || "Other"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Priority:</label>
                      <span className={`priority-text ${getPriorityClass(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority || "Medium"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-text ${getStatusClass(selectedComplaint.status)}`}>
                        {selectedComplaint.status?.replace("-", " ") || "Not Solved"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedComplaint.userName || "Anonymous"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedComplaint.userEmail || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedComplaint.phone || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Issue Date:</label>
                      <span>{formatDate(selectedComplaint.issueDate)}</span>
                    </div>
                  </div>
                </div>

                {selectedComplaint.vehicleName && (
                  <div className="detail-section">
                    <h4>Vehicle Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Vehicle:</label>
                        <span>{selectedComplaint.vehicleName}</span>
                      </div>
                      <div className="detail-item">
                        <label>Category:</label>
                        <span>{selectedComplaint.vehicleCategory || "N/A"}</span>
                      </div>
                      {selectedComplaint.rentalStartDate && (
                        <div className="detail-item">
                          <label>Rental Period:</label>
                          <span>
                            {formatDate(selectedComplaint.rentalStartDate)} -{" "}
                            {formatDate(selectedComplaint.rentalEndDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Description</h4>
                  <div className="description-text">{selectedComplaint.description || "No description provided"}</div>
                </div>

                <div className="detail-section">
                  <h4>Timestamps</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Created:</label>
                      <span>{formatDate(selectedComplaint.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Updated:</label>
                      <span>{formatDate(selectedComplaint.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <select
                  value={selectedComplaint.status || "not-solved"}
                  onChange={(e) => handleStatusUpdate(selectedComplaint.id, e.target.value)}
                  disabled={updating}
                  className="status-select"
                >
                  <option value="not-solved">Not Solved</option>
                  <option value="in-progress">In Progress</option>
                  <option value="solved">Solved</option>
                </select>
                <button className="modal-btn secondary" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
