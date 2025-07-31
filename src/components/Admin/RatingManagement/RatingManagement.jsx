"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { Star, User, Calendar, MessageSquare, Loader2, AlertCircle, Eye, X } from "lucide-react"
import Sidebar from "../Sidebar/sidebar-dashboard"
import styles from "./RatingManagement.module.css"

export default function RatingManagement() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    async function fetchRatings() {
      if (!isLoaded || !isSignedIn) return

      try {
        setLoading(true)
        setError(null)
        // Fetch ratings ordered by creation date
        const q = query(collection(db, "ratings"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)

        const ratingsData = await Promise.all(
          snapshot.docs.map(async (ratingDoc) => {
            const ratingData = { id: ratingDoc.id, ...ratingDoc.data() }

            // Fetch vehicle name if not already present
            if (ratingData.vehicleId && !ratingData.vehicleName) {
              try {
                const vehicleRef = doc(db, "vehicles", ratingData.vehicleId)
                const vehicleSnap = await getDoc(vehicleRef)
                if (vehicleSnap.exists()) {
                  ratingData.vehicleName = vehicleSnap.data().name || "Unknown Vehicle"
                }
              } catch (error) {
                console.error("Error fetching vehicle name:", error)
                ratingData.vehicleName = "Unknown Vehicle"
              }
            }

            return ratingData
          }),
        )

        setRatings(ratingsData)
      } catch (error) {
        console.error("Error fetching ratings:", error)
        setError("Failed to load ratings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} size={16} className={`${styles.star} ${index < rating ? styles.filled : ""}`} />
    ))
  }

  const calculateStats = () => {
    const total = ratings.length
    const averageRating = total > 0 ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1) : 0
    const fiveStars = ratings.filter((r) => r.rating === 5).length
    const recentRatings = ratings.filter((r) => {
      const ratingDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return ratingDate >= weekAgo
    }).length

    return { total, averageRating, fiveStars, recentRatings }
  }

  const handleViewDetails = (rating) => {
    setSelectedRating(rating)
    setShowDetailModal(true)
  }

  if (!isLoaded) {
    return (
      <>
        <Sidebar />
        <div className={styles.ratingContainer}>
          <div className={styles.ratingLoading}>
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
        <div className={styles.ratingContainer}>
          <div className={styles.ratingError}>
            <User className={styles.errorIcon} />
            <h2>Authentication Required</h2>
            <p>You must be signed in to view ratings.</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className={styles.ratingContainer}>
          <div className={styles.ratingLoading}>
            <Loader2 size={32} className={styles.loadingSpinner} />
            <span>Loading ratings...</span>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className={styles.ratingContainer}>
          <div className={styles.ratingError}>
            <AlertCircle className={styles.errorIcon} />
            <h2>Error Loading Ratings</h2>
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
      <div className={styles.ratingContainer}>
        <div className={styles.ratingHeader}>
          <div className={styles.headerContent}>
            <h1>Rating Management</h1>
            <p>Monitor and manage customer feedback</p>
          </div>
        </div>

        <div className={styles.ratingStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Total Ratings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.averageRating}</div>
            <div className={styles.statLabel}>Average Rating</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.fiveStars}</div>
            <div className={styles.statLabel}>5-Star Reviews</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.recentRatings}</div>
            <div className={styles.statLabel}>This Week</div>
          </div>
        </div>

        {ratings.length === 0 ? (
          <div className={styles.noRatings}>
            <Star className={styles.noRatingsIcon} />
            <h2>No Ratings Yet</h2>
            <p>Customer ratings will appear here once they start reviewing vehicles.</p>
          </div>
        ) : (
          <div className={styles.ratingsList}>
            {ratings.map((rating) => (
              <div key={rating.id} className={styles.ratingCard}>
                <div className={styles.ratingMain}>
                  <div className={styles.ratingInfo}>
                    <div className={styles.vehicleName}>{rating.vehicleName || "Unknown Vehicle"}</div>
                    <div className={styles.ratingStars}>
                      {renderStars(rating.rating || 0)}
                      <span className={styles.ratingValue}>({rating.rating || 0})</span>
                    </div>
                  </div>
                  <div className={styles.userInfo}>
                    <User size={16} />
                    <span>{rating.userName || "Anonymous"}</span>
                  </div>
                  <div className={styles.ratingDate}>
                    <Calendar size={16} />
                    <span>{formatDate(rating.createdAt)}</span>
                  </div>
                </div>
                <div className={styles.ratingComment}>
                  <MessageSquare size={16} />
                  <span>{rating.comment || "No comment provided"}</span>
                </div>
                <div className={styles.ratingActions}>
                  <button className={`${styles.actionBtn} ${styles.view}`} onClick={() => handleViewDetails(rating)}>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Detail Modal */}
        {showDetailModal && selectedRating && (
          <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Rating Details</h3>
                <button className={styles.modalClose} onClick={() => setShowDetailModal(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.ratingOverview}>
                  <div className={styles.ratingStarsLarge}>
                    {renderStars(selectedRating.rating || 0)}
                    <span className={styles.ratingNumber}>({selectedRating.rating || 0}/5)</span>
                  </div>
                  <div className={styles.vehicleInfoLarge}>
                    <h4>{selectedRating.vehicleName || "Unknown Vehicle"}</h4>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Customer Information</h4>
                  <div className={styles.customerProfile}>
                    {selectedRating.userImage && (
                      <div className={styles.userAvatar}>
                        <img
                          src={selectedRating.userImage || "/placeholder.svg"}
                          alt={selectedRating.userName || "User"}
                          onError={(e) => {
                            e.target.style.display = "none"
                            e.target.nextSibling.style.display = "flex"
                          }}
                        />
                        <div className={styles.avatarFallback} style={{ display: "none" }}>
                          {(selectedRating.userName || "U").charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    <div className={styles.customerDetails}>
                      <div className={styles.detailItem}>
                        <label>Name:</label>
                        <span>{selectedRating.userName || "Anonymous"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Email:</label>
                        <span>{selectedRating.userEmail || "N/A"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Rating Date:</label>
                        <span>{formatDate(selectedRating.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Review Comment</h4>
                  <div className={styles.commentText}>{selectedRating.comment || "No comment provided"}</div>
                </div>

                {selectedRating.vehicleId && (
                  <div className={styles.detailSection}>
                    <h4>Vehicle Information</h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Vehicle ID:</label>
                        <span>{selectedRating.vehicleId}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Vehicle Name:</label>
                        <span>{selectedRating.vehicleName || "Unknown Vehicle"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button className={`${styles.modalBtn} ${styles.secondary}`} onClick={() => setShowDetailModal(false)}>
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
