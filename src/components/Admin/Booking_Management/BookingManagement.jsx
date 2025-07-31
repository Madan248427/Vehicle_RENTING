"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { Link } from "react-router-dom" // Add this import
import {
  Calendar,
  Plus,
  User,
  DollarSign,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  X,
  CheckCircle,
  Flag,
  Search,
} from "lucide-react"
import Sidebar from "../Sidebar/sidebar-dashboard.jsx"
import styles from "./BookingManagement.module.css"

export default function BookingManagement() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("time") // time, status, customer, vehicle
  const [filterStatus, setFilterStatus] = useState("all") // all, pending, verified, finished, confirmed, cancelled

  useEffect(() => {
    async function fetchBookings() {
      if (!isLoaded || !isSignedIn) return

      try {
        setLoading(true)
        setError(null)
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const bookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setBookings(bookingsData)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        setError("Failed to load bookings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [isLoaded, isSignedIn, user])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return "N/A"
    }
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "active":
        return styles.confirmed
      case "pending":
      case "processing":
        return styles.pending
      case "cancelled":
      case "canceled":
        return styles.cancelled
      case "completed":
        return styles.completed
      case "verified":
        return styles.verified
      case "finished":
        return styles.finished
      default:
        return styles.pending
    }
  }

  const filteredAndSortedBookings = bookings
    .filter((booking) => {
      const matchesSearch =
        searchTerm === "" ||
        booking.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || booking.bookingStatus?.toLowerCase() === filterStatus

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "time":
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA // Most recent first
        case "status":
          const statusA = (a.bookingStatus || "pending").toLowerCase()
          const statusB = (b.bookingStatus || "pending").toLowerCase()
          return statusA.localeCompare(statusB)
        case "customer":
          const customerA = (a.userName || a.userEmail || "").toLowerCase()
          const customerB = (b.userName || b.userEmail || "").toLowerCase()
          return customerA.localeCompare(customerB)
        case "vehicle":
          const vehicleA = (a.vehicleName || "").toLowerCase()
          const vehicleB = (b.vehicleName || "").toLowerCase()
          return vehicleA.localeCompare(vehicleB)
        default:
          return 0
      }
    })

  const calculateStats = () => {
    const total = bookings.length
    const confirmed = bookings.filter((b) =>
      ["verified", "active", "completed"].includes(b.bookingStatus?.toLowerCase()),
    ).length
    const pending = bookings.filter((b) => ["pending", "processing"].includes(b.bookingStatus?.toLowerCase())).length
    const totalRevenue = bookings.reduce((sum, b) => sum + (Number.parseFloat(b.totalPrice) || 0), 0)

    return { total, confirmed, pending, totalRevenue }
  }

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const handleStatusUpdate = async (bookingId, newStatus, vehicleId = null) => {
    try {
      setUpdating(true)
      // Update booking status
      await updateDoc(doc(db, "bookings", bookingId), {
        bookingStatus: newStatus,
        updatedAt: new Date(),
      })

      // If status is "finished", make vehicle available
      if (newStatus === "finished" && vehicleId) {
        await updateDoc(doc(db, "vehicles", vehicleId), {
          isAvailable: true,
          updatedAt: new Date(),
        })
      }

      // Update local state
      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? { ...booking, bookingStatus: newStatus } : booking)),
      )

      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, bookingStatus: newStatus })
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (!isLoaded) {
    return (
      <>
        <Sidebar />
        <div className={styles.bookingContainer}>
          <div className={styles.bookingLoading}>
            <Loader2 size={32} className={styles.loadingSpinner} />
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
        <div className={styles.bookingContainer}>
          <div className={styles.bookingError}>
            <Calendar className={styles.errorIcon} />
            <h2>Authentication Required</h2>
            <p>You must be signed in to view bookings.</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className={styles.bookingContainer}>
          <div className={styles.bookingLoading}>
            <Loader2 size={32} className={styles.loadingSpinner} />
            <span>Loading bookings...</span>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className={styles.bookingContainer}>
          <div className={styles.bookingError}>
            <AlertCircle className={styles.errorIcon} />
            <h2>Error Loading Bookings</h2>
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
      <div className={styles.bookingContainer}>
        <div className={styles.bookingHeader}>
          <div className={styles.headerContent}>
            <h1>Booking Management</h1>
            <p>Monitor and manage all reservations</p>
          </div>
          {/* Updated Add Booking button with Link */}
          <Link to="/admin/addbooking" className={styles.addBookingBtn}>
            <Plus size={20} />
            Add Booking
          </Link>
        </div>

        <div className={styles.bookingStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Total Bookings</div>
          </div>
          <div className={`${styles.statCard} ${styles.confirmed}`}>
            <div className={styles.statNumber}>{stats.confirmed}</div>
            <div className={styles.statLabel}>Confirmed</div>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className={styles.statNumber}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>RS {stats.totalRevenue.toFixed(0)}</div>
            <div className={styles.statLabel}>Total Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filterControls}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="verified">Verified</option>
              <option value="finished">Finished</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="time">Sort by Time</option>
              <option value="status">Sort by Status</option>
              <option value="customer">Sort by Customer</option>
              <option value="vehicle">Sort by Vehicle</option>
            </select>
          </div>
        </div>

        {filteredAndSortedBookings.length === 0 ? (
          <div className={styles.noBookings}>
            <Calendar className={styles.noBookingsIcon} />
            <h2>No Bookings Found</h2>
            <p>
              {bookings.length === 0
                ? "Customer bookings will appear here once they start making reservations."
                : "No bookings match your current search and filters."}
            </p>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {filteredAndSortedBookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingMain}>
                  <div className={styles.bookingInfo}>
                    <div className={styles.vehicleName}>{booking.vehicleName || "Unknown Vehicle"}</div>
                    <div className={styles.bookingId}>#{booking.id.slice(-8)}</div>
                  </div>
                  <div className={styles.customerInfo}>
                    <User size={14} />
                    <span>{booking.userName || booking.userEmail || "Unknown Customer"}</span>
                  </div>
                  <div className={styles.bookingDuration}>
                    <Clock size={14} />
                    <span>{booking.numberOfDays || 0} days</span>
                  </div>
                  <div className={styles.bookingPrice}>
                    {/* <DollarSign size={14} /> */}
                    RS
                    <span>RS {Number.parseFloat(booking.totalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className={styles.bookingActions}>
                  <button className={`${styles.actionBtn} ${styles.view}`} onClick={() => handleViewDetails(booking)}>
                    <Eye size={16} />
                  </button>
                </div>
                <div className={`${styles.bookingStatus} ${getStatusClass(booking.bookingStatus)}`}>
                  {booking.bookingStatus || "Pending"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Booking Details</h3>
                <button className={styles.modalClose} onClick={() => setShowDetailModal(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.bookingOverview}>
                  <div className={styles.bookingIdLarge}>#{selectedBooking.id.slice(-8)}</div>
                  <div className={styles.vehicleNameLarge}>{selectedBooking.vehicleName || "Unknown Vehicle"}</div>
                  <div className={`${styles.statusBadgeLarge} ${getStatusClass(selectedBooking.bookingStatus)}`}>
                    {selectedBooking.bookingStatus || "Pending"}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Customer Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Name:</label>
                      <span>{selectedBooking.userName || "Unknown Customer"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Email:</label>
                      <span>{selectedBooking.userEmail || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Phone:</label>
                      <span>{selectedBooking.userPhone || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>User ID:</label>
                      <span>{selectedBooking.userId || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Booking Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Start Date:</label>
                      <span>{formatDate(selectedBooking.startDate)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>End Date:</label>
                      <span>{formatDate(selectedBooking.endDate)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Duration:</label>
                      <span>{selectedBooking.numberOfDays || 0} days</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Total Price:</label>
                      <span>${Number.parseFloat(selectedBooking.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Pickup & Drop-off</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Pickup Location:</label>
                      <span>{selectedBooking.pickupLocation || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Drop-off Location:</label>
                      <span>{selectedBooking.dropoffLocation || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Need Driver:</label>
                      <span>{selectedBooking.needDriver ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                {!selectedBooking.needDriver && (selectedBooking.licenseNumber || selectedBooking.licenseImageUrl) && (
                  <div className={styles.detailSection}>
                    <h4>Driver's License</h4>
                    <div className={styles.licenseInfo}>
                      {selectedBooking.licenseNumber && (
                        <div className={styles.detailItem}>
                          <label>License Number:</label>
                          <span>{selectedBooking.licenseNumber}</span>
                        </div>
                      )}
                      {selectedBooking.licenseImageUrl && (
                        <div className={styles.licenseImageContainer}>
                          <label>License Image:</label>
                          <img
                            src={selectedBooking.licenseImageUrl || "/placeholder.svg"}
                            alt="Driver's License"
                            className={styles.licenseImage}
                            onError={(e) => {
                              e.target.style.display = "none"
                              e.target.nextSibling.style.display = "block"
                            }}
                          />
                          <div className={styles.licenseError} style={{ display: "none" }}>
                            License image unavailable
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedBooking.specialRequests && (
                  <div className={styles.detailSection}>
                    <h4>Special Requests</h4>
                    <div className={styles.requestsText}>{selectedBooking.specialRequests}</div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <div className={styles.statusActions}>
                  <button
                    className={`${styles.statusBtn} ${styles.verified}`}
                    onClick={() => handleStatusUpdate(selectedBooking.id, "verified")}
                    disabled={updating || selectedBooking.bookingStatus === "verified"}
                  >
                    <CheckCircle size={16} />
                    {updating ? "Updating..." : "Verified"}
                  </button>
                  <button
                    className={`${styles.statusBtn} ${styles.finished}`}
                    onClick={() => handleStatusUpdate(selectedBooking.id, "finished", selectedBooking.vehicleId)}
                    disabled={updating || selectedBooking.bookingStatus === "finished"}
                  >
                    <Flag size={16} />
                    {updating ? "Updating..." : "Finished"}
                  </button>
                  
                </div>
                <button className={`${styles.modalBtn} ${styles.secondary}`} onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
    //disable button if cancelled and also add button to dishmished 
  )
}
