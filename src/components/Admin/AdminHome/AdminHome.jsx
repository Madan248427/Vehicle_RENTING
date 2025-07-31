"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import {
  Car,
  Calendar,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  MapPin,
  Plus,
  ArrowRight,
  Loader2,
  Bell,
  Activity,
  BarChart3,
} from "lucide-react"
import Sidebar from "../Sidebar/sidebar-dashboard"
import styles from "./admin-home.module.css"

export default function AdminHome() {
    const handleAddVehicle = () => {
    window.location.href = "/admin/addvehicle"
  }
 
    const   handleBooking = () => {
    window.location.href = "/admin/vehicle"
  }
      const   handlelogs = () => {
    window.location.href = "/admin/edit-profile/security"
  }

  const { isLoaded, isSignedIn, user } = useUser()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    vehicles: [],
    bookings: [],
    ratings: [],
    complaints: [],
    stats: {
      totalVehicles: 0,
      availableVehicles: 0,
      totalBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalComplaints: 0,
      activeUsers: 0,
    },
  })

  useEffect(() => {
    async function fetchDashboardData() {
      if (!isLoaded || !isSignedIn) return

      try {
        setLoading(true)
        // Fetch all data in parallel
        const [vehiclesSnapshot, bookingsSnapshot, ratingsSnapshot, complaintsSnapshot] = await Promise.all([
          getDocs(collection(db, "vehicles")),
          getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "ratings"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "complaints"), orderBy("createdAt", "desc"))),
        ])

        const vehicles = vehiclesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const bookings = bookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const ratings = ratingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const complaints = complaintsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Calculate statistics
        const stats = {
          totalVehicles: vehicles.length,
          availableVehicles: vehicles.filter((v) => v.isAvailable).length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b) => ["pending", "processing"].includes(b.bookingStatus?.toLowerCase()))
            .length,
          totalRevenue: bookings.reduce((sum, b) => sum + (Number.parseFloat(b.totalPrice) || 0), 0),
          averageRating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0,
          totalComplaints: complaints.length,
          activeUsers: [...new Set(bookings.map((b) => b.userId))].length,
        }

        setDashboardData({
          vehicles: vehicles.slice(0, 5), // Recent 5
          bookings: bookings.slice(0, 5), // Recent 5
          ratings: ratings.slice(0, 5), // Recent 5
          complaints: complaints.slice(0, 3), // Recent 3
          stats,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isLoaded, isSignedIn, user])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "N/A"
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} size={12} className={`${styles.star} ${index < rating ? styles.filled : ""}`} />
    ))
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
        return styles.cancelled
      case "completed":
        return styles.completed
      default:
        return styles.pending
    }
  }

  if (!isLoaded) {
    return (
      <>
        <Sidebar />
        <div className={styles.adminHomeContainer}>
          <div className={styles.adminLoading}>
            <Loader2 size={32} className={styles.loadingSpinner} />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </>
    )
  }

  if (!isSignedIn) {
    return (
      <>
        <Sidebar />
        <div className={styles.adminHomeContainer}>
          <div className={styles.adminError}>
            <Users className={styles.errorIcon} />
            <h2>Authentication Required</h2>
            <p>You must be signed in to access the admin dashboard.</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className={styles.adminHomeContainer}>
          <div className={styles.adminLoading}>
            <Loader2 size={32} className={styles.loadingSpinner} />
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      <div className={styles.adminHomeContainer}>
        {/* Welcome Header */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1>Welcome back, {user?.username || "Admin"}!</h1>
            <p>Here's what's happening with your vehicle rental business today.</p>
          </div>
          <div className={styles.welcomeActions}>
            <button className={`${styles.quickActionBtn} ${styles.primary}`}>
              <Plus size={20} />
              Quick Add
            </button>

          </div>
        </div>

        {/* Statistics Grid */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.primary}`}>
            <div className={styles.statIcon}>
              <Car size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{dashboardData.stats.totalVehicles}</div>
              <div className={styles.statLabel}>Total Vehicles</div>
              <div className={styles.statDetail}>{dashboardData.stats.availableVehicles} available</div>
            </div>
            <div className={`${styles.statTrend} ${styles.positive}`}>
              <TrendingUp size={16} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.secondary}`}>
            <div className={styles.statIcon}>
              <Calendar size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{dashboardData.stats.totalBookings}</div>
              <div className={styles.statLabel}>Total Bookings</div>
              <div className={styles.statDetail}>{dashboardData.stats.pendingBookings} pending</div>
            </div>
            <div className={`${styles.statTrend} ${styles.positive}`}>
              <TrendingUp size={16} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.success}`}>
            <div className={styles.statIcon}>
              RS
              {/* <DollarSign size={24} /> */}
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>RS {dashboardData.stats.totalRevenue.toFixed(0)}</div>
              <div className={styles.statLabel}>Total Revenue</div>
              <div className={styles.statDetail}>All time earnings</div>
            </div>
            <div className={`${styles.statTrend} ${styles.positive}`}>
              <TrendingUp size={16} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.warning}`}>
            <div className={styles.statIcon}>
              <Star size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{dashboardData.stats.averageRating.toFixed(1)}</div>
              <div className={styles.statLabel}>Average Rating</div>
              <div className={styles.statDetail}>Customer satisfaction</div>
            </div>
            <div className={`${styles.statTrend} ${styles.positive}`}>
              <TrendingUp size={16} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.info}`}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{dashboardData.stats.activeUsers}</div>
              <div className={styles.statLabel}>Active Users</div>
              <div className={styles.statDetail}>Registered customers</div>
            </div>
            <div className={`${styles.statTrend} ${styles.positive}`}>
              <TrendingUp size={16} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.danger}`}>
            <div className={styles.statIcon}>
              <AlertCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{dashboardData.stats.totalComplaints}</div>
              <div className={styles.statLabel}>Complaints</div>
              <div className={styles.statDetail}>Need attention</div>
            </div>
            <div className={`${styles.statTrend} ${styles.negative}`}>
              <AlertCircle size={16} />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Recent Bookings */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h3>Recent Bookings</h3>
              <button className={styles.viewAllBtn}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.cardContent}>
              {dashboardData.bookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <Calendar className={styles.emptyIcon} />
                  <p>No recent bookings</p>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {dashboardData.bookings.map((booking) => (
                    <div key={booking.id} className={styles.listItem}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemTitle}>{booking.id || "Unknown Vehicle"}</div>
                        <div className={styles.itemSubtitle}>
                          {booking.userName || booking.userEmail || "Unknown Customer"}
                        </div>
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemPrice}>
                          RS{Number.parseFloat(booking.totalPrice || 0).toFixed(2)}
                        </span>
                        <span className={`${styles.itemStatus} ${getStatusClass(booking.bookingStatus)}`}>
                          {booking.bookingStatus || "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Ratings */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h3>Recent Reviews</h3>
              <button className={styles.viewAllBtn}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.cardContent}>
              {dashboardData.ratings.length === 0 ? (
                <div className={styles.emptyState}>
                  <Star className={styles.emptyIcon} />
                  <p>No recent reviews</p>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {dashboardData.ratings.map((rating) => (
                    <div key={rating.id} className={styles.listItem}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemTitle}>{rating.vehicleId || "Unknown Vehicle"}</div>
                        <div className={styles.itemSubtitle}>{rating.userName || "Anonymous"}</div>
                      </div>
                      <div className={styles.itemDetails}>
                        <div className={styles.ratingStars}>{renderStars(rating.rating || 0)}</div>
                        <span className={styles.itemTime}>{formatDate(rating.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fleet Overview */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h3>Fleet Overview</h3>
              <button className={styles.viewAllBtn}>
                Manage Fleet <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.cardContent}>
              {dashboardData.vehicles.length === 0 ? (
                <div className={styles.emptyState}>
                  <Car className={styles.emptyIcon} />
                  <p>No vehicles in fleet</p>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {dashboardData.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className={styles.listItem}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemTitle}>{vehicle.name || "Unknown Vehicle"}</div>
                        <div className={styles.itemSubtitle}>{vehicle.category || "N/A"}</div>
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemPrice}>RS{vehicle.price || "0"}/day</span>
                        <span
                          className={`${styles.itemStatus} ${vehicle.isAvailable ? styles.available : styles.rented}`}
                        >
                          {vehicle.isAvailable ? "Available" : "Rented"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h3>Recent Complaints</h3>
              <button className={styles.viewAllBtn}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.cardContent}>
              {dashboardData.complaints.length === 0 ? (
                <div className={styles.emptyState}>
                  <AlertCircle className={styles.emptyIcon} />
                  <p>No recent complaints</p>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {dashboardData.complaints.map((complaint) => (
                    <div key={complaint.id} className={styles.listItem}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemTitle}>{complaint.subject || "No Subject"}</div>
                        <div className={styles.itemSubtitle}>{complaint.userName || "Anonymous"}</div>
                      </div>
                      <div className={styles.itemDetails}>
                        <span
                          className={`${styles.itemPriority} ${styles[`priority${complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1) || "Medium"}`]}`}
                        >
                          {complaint.priority || "Medium"}
                        </span>
                        <span className={styles.itemTime}>{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActionsSection}>
          <h3>Quick Actions</h3>
          <div className={styles.quickActionsGrid}>
            <button className={styles.actionCard} onClick={handleAddVehicle}>
              <Car size={24} />
              <span>Add Vehicle</span>
            </button>
        
            <button className={styles.actionCard}onClick={handleBooking}>
              <Calendar size={24} />
              <span>New Booking</span>
            </button>

            <button className={styles.actionCard}>
              <BarChart3 size={24} />
              <span>View Reports</span>
            </button>
            <button className={styles.actionCard} onClick={handlelogs}>
              <Activity size={24} />
              <span>System Logs</span>
            </button>

          </div>
        </div>
      </div>
    </>
  )
}
