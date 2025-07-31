"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import {
  Loader2,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Car,
  CalendarDays,
  Timer,
  AlertCircle,
  Edit3,
  X,
  Trash2,
  AlertTriangle,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react"
import Sidebar from "../Sidebar/sidebar"
import styles from "./UserBookings.module.css"

export default function UserBookings() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [uploadProgress, setUploadProgress] = useState("")
  const [showCurrentLicense, setShowCurrentLicense] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropoffLocation: "",
    specialRequests: "",
    needDriver: false,
    licenseNumber: "",
    licenseImage: null,
  })

  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    async function fetchBookings() {
      if (!isLoaded || !isSignedIn) return
      try {
        setLoading(true)
        setError(null)
        const q = query(collection(db, "bookings"), where("userEmail", "==", user.primaryEmailAddress?.emailAddress))
        const snapshot = await getDocs(q)
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Debug: Log the fetched data to see what we're getting
        console.log("Fetched bookings:", results)
        results.forEach((booking, index) => {
          console.log(`Booking ${index + 1}:`, {
            id: booking.id,
            needDriver: booking.needDriver,
            needDriverType: typeof booking.needDriver,
            licenseNumber: booking.licenseNumber,
            licenseImageUrl: booking.licenseImageUrl,
            vehicleName: booking.vehicleName,
          })
        })

        // Sort bookings by creation date (newest first)
        results.sort((a, b) => {
          const dateA = new Date(a.bookedDate || a.createdAt || 0)
          const dateB = new Date(b.bookedDate || b.createdAt || 0)
          return dateB - dateA
        })
        setBookings(results)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        setError("Failed to load bookings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [isLoaded, isSignedIn, user])

  // Helper function to check if driver is needed (handles different data types)
  const isDriverNeeded = (booking) => {
    const needDriver = booking.needDriver
    // Handle different possible values: boolean, string, undefined
    if (typeof needDriver === "boolean") {
      return needDriver
    }
    if (typeof needDriver === "string") {
      return needDriver.toLowerCase() === "true"
    }
    return false // Default to false if undefined
  }

  // Helper function to check if license info should be shown
  const shouldShowLicense = (booking) => {
    const driverNeeded = isDriverNeeded(booking)
    const hasLicenseNumber = booking.licenseNumber && booking.licenseNumber.trim() !== ""
    const hasLicenseImage = booking.licenseImageUrl && booking.licenseImageUrl.trim() !== ""

    console.log(`License check for booking ${booking.id}:`, {
      driverNeeded,
      hasLicenseNumber,
      hasLicenseImage,
      licenseNumber: booking.licenseNumber,
      licenseImageUrl: booking.licenseImageUrl,
      shouldShow: !driverNeeded && (hasLicenseNumber || hasLicenseImage),
    })

    return !driverNeeded && (hasLicenseNumber || hasLicenseImage)
  }

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "v") // Replace with your Cloudinary upload preset
    formData.append("cloud_name", "duortzwqq") // Replace with your Cloudinary cloud name

    try {
      setUploadProgress("Uploading license image...")
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, // Replace with your cloud name
        {
          method: "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      throw error
    }
  }

  // Show message toast
  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  // Handle update booking
  const handleUpdateBooking = (booking) => {
    setSelectedBooking(booking)
    setUpdateForm({
      startDate: booking.startDate || "",
      endDate: booking.endDate || "",
      pickupLocation: booking.pickupLocation || "",
      dropoffLocation: booking.dropoffLocation || "",
      specialRequests: booking.specialRequests || booking.notes || "",
      needDriver: isDriverNeeded(booking),
      licenseNumber: booking.licenseNumber || "",
      licenseImage: null,
    })
    setShowUpdateModal(true)
    setShowCurrentLicense(false)
    setUploadProgress("")
  }

  // Handle cancel booking
  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
  }

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  // Submit update
  const submitUpdate = async () => {
    if (!selectedBooking) return

    try {
      setUpdating(true)
      setUploadProgress("Processing update...")

      // Handle license image upload if needed
      let licenseImageUrl = selectedBooking.licenseImageUrl
      if (!updateForm.needDriver && updateForm.licenseImage) {
        licenseImageUrl = await uploadToCloudinary(updateForm.licenseImage)
        setUploadProgress("License image uploaded successfully!")
      }

      // Calculate new number of days if dates changed
      let numberOfDays = selectedBooking.numberOfDays
      if (updateForm.startDate && updateForm.endDate) {
        const start = new Date(updateForm.startDate)
        const end = new Date(updateForm.endDate)
        numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

        // Ensure minimum 1 day
        if (numberOfDays < 1) {
          numberOfDays = 1
        }
      }

      // Calculate new total price when days change
      let totalPrice = selectedBooking.totalPrice
      if (numberOfDays !== selectedBooking.numberOfDays) {
        // Get the base daily rate - prioritize a clean calculation
        let dailyRate = null

        // Option 1: Use stored pricePerDay if it exists and is reasonable
        if (selectedBooking.pricePerDay && selectedBooking.pricePerDay > 0) {
          dailyRate = selectedBooking.pricePerDay
        }
        // Option 2: Calculate from original booking, but round to avoid precision issues
        else if (selectedBooking.totalPrice && selectedBooking.numberOfDays && selectedBooking.numberOfDays > 0) {
          const calculatedRate = selectedBooking.totalPrice / selectedBooking.numberOfDays
          // Round to 2 decimal places to avoid floating point precision issues
          dailyRate = Math.round(calculatedRate * 100) / 100
        }

        if (dailyRate && dailyRate > 0) {
          // Calculate new total and round to 2 decimal places
          totalPrice = Math.round(numberOfDays * dailyRate * 100) / 100
          console.log(`Price calculation: ${numberOfDays} days × $${dailyRate} = $${totalPrice}`)
          setUploadProgress(
            `Price updated: ${numberOfDays} days × $${dailyRate.toFixed(2)} = $${totalPrice.toFixed(2)}`,
          )
        } else {
          console.warn("Could not determine daily rate - price will remain unchanged")
          setUploadProgress("Could not calculate new price - keeping original amount")
        }
      }

      const updateData = {
        ...updateForm,
        numberOfDays,
        totalPrice,
        updatedAt: new Date(),
        lastModified: new Date().toISOString(),
      }

      // Handle license-related fields based on needDriver
      if (updateForm.needDriver) {
        // If driver is needed, remove license fields
        updateData.licenseNumber = ""
        updateData.licenseImageUrl = ""
      } else {
        // If no driver needed, include license fields
        if (updateForm.licenseNumber) {
          updateData.licenseNumber = updateForm.licenseNumber
        }
        if (licenseImageUrl) {
          updateData.licenseImageUrl = licenseImageUrl
        }
      }

      // Remove empty fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === "") {
          delete updateData[key]
        }
      })

      setUploadProgress("Saving changes...")
      await updateDoc(doc(db, "bookings", selectedBooking.id), updateData)

      // Update local state
      setBookings((prev) =>
        prev.map((booking) => (booking.id === selectedBooking.id ? { ...booking, ...updateData } : booking)),
      )

      setShowUpdateModal(false)
      setSelectedBooking(null)
      setUploadProgress("")

      // Show success message with price info if changed
      if (numberOfDays !== selectedBooking.numberOfDays && totalPrice !== selectedBooking.totalPrice) {
        showMessage("success", `Booking updated! Duration: ${numberOfDays} days, New total: $${totalPrice.toFixed(2)}`)
      } else if (numberOfDays !== selectedBooking.numberOfDays) {
        showMessage("success", `Booking updated! Duration changed to ${numberOfDays} days`)
      } else {
        showMessage("success", "Booking updated successfully!")
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      showMessage("error", "Failed to update booking. Please try again.")
      setUploadProgress("")
    } finally {
      setUpdating(false)
    }
  }

  // Submit cancellation
  const submitCancellation = async () => {
    if (!selectedBooking) return

    try {
      setCancelling(true)

      // Update booking status to cancelled
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        bookingStatus: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })

      // Update vehicle availability to true
      if (selectedBooking.vehicleId) {
        const vehicleRef = doc(db, "vehicles", selectedBooking.vehicleId)
        await updateDoc(vehicleRef, {
          isAvailable: true,
          updatedAt: new Date(),
        })
        console.log(`Vehicle ${selectedBooking.vehicleId} marked as available.`)
      }

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, bookingStatus: "cancelled", cancelledAt: new Date() }
            : booking,
        ),
      )

      setShowCancelModal(false)
      setSelectedBooking(null)
      showMessage("success", "Booking cancelled successfully! Vehicle is now available for booking.")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      showMessage("error", "Failed to cancel booking. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "active":
        return styles.statusConfirmed
      case "pending":
      case "processing":
        return styles.statusPending
      case "cancelled":
      case "canceled":
      case "rejected":
        return styles.statusCancelled
      case "completed":
        return styles.statusConfirmed
      default:
        return styles.statusPending
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return "N/A"
    }
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split("T")[0]
    } catch (error) {
      return ""
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    try {
      if (timeString.includes(":")) {
        return timeString
      }
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return timeString
    }
  }

  const calculateStats = () => {
    const total = bookings.length
    const confirmed = bookings.filter((b) =>
      ["confirmed", "active", "verified"].includes(b.bookingStatus?.toLowerCase()),
    ).length
    const pending = bookings.filter((b) => ["pending", "processing"].includes(b.bookingStatus?.toLowerCase())).length
    const totalSpent = bookings.reduce((sum, b) => {
      const price = Number.parseFloat(b.totalPrice) || 0
      return sum + price
    }, 0)
    return { total, confirmed, pending, totalSpent }
  }

  const getBookingStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Confirmed"
      case "pending":
        return "Pending"
      case "cancelled":
      case "canceled":
        return "Cancelled"
      case "active":
        return "Active"
      case "completed":
        return "Completed"
      case "processing":
        return "Processing"
      case "rejected":
        return "Rejected"
      default:
        return status || "Unknown"
    }
  }

  const canModifyBooking = (booking) => {
    const status = booking.bookingStatus?.toLowerCase()
    return status === "pending" || status === "processing"
  }

  const canCancelBooking = (booking) => {
    const status = booking.bookingStatus?.toLowerCase()
    return status !== "cancelled" && status !== "completed"
  }

  // Loading state
  if (!isLoaded) {
    return (
      <>
        <Sidebar />
        <div className={styles.bookingsContainer}>
          <div className={styles.bookingsLoading}>
            <Loader2 size={32} className={styles.loadingSpinner} />
            <span className={styles.loadingText}>Loading user...</span>
          </div>
        </div>
      </>
    )
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <>
        <Sidebar />
        <div className={styles.bookingsContainer}>
          <div className={styles.noBookings}>
            <User className={styles.noBookingsIcon} />
            <h2 className={styles.noBookingsTitle}>Authentication Required</h2>
            <p className={styles.noBookingsText}>You must be signed in to view your bookings.</p>
          </div>
        </div>
      </>
    )
  }

  // Loading bookings state
  if (loading) {
    return (
      <>
        <Sidebar />
        <div className={styles.bookingsContainer}>
          <div className={styles.bookingsLoading}>
            <Loader2 size={32} className={styles.loadingSpinner} />
            <span className={styles.loadingText}>Fetching your bookings...</span>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <Sidebar />
        <div className={styles.bookingsContainer}>
          <div className={styles.noBookings}>
            <AlertCircle className={styles.noBookingsIcon} style={{ color: "#ef4444" }} />
            <h2 className={styles.noBookingsTitle}>Error Loading Bookings</h2>
            <p className={styles.noBookingsText}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  const stats = calculateStats()

  return (
    <>
      <Sidebar />
      <div className={styles.bookingsContainer}>
        {/* Message Toast */}
        {message.text && (
          <div
            className={`${styles.messageToast} ${styles[`message${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]}`}
          >
            {message.text}
          </div>
        )}

        <div className={styles.bookingsHeader}>
          <h1 className={styles.bookingsTitle}>Your Bookings</h1>
          <p className={styles.bookingsSubtitle}>Manage and track all your vehicle reservations</p>
          <div className={styles.bookingsStats}>
            <div className={styles.statCard}>
              <p className={styles.statNumber}>{stats.total}</p>
              <p className={styles.statLabel}>Total Bookings</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statNumber}>{stats.confirmed}</p>
              <p className={styles.statLabel}>Confirmed</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statNumber}>{stats.pending}</p>
              <p className={styles.statLabel}>Pending</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statNumber}>Rs {stats.totalSpent.toFixed(2)}</p>
              <p className={styles.statLabel}>Total Spent</p>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className={styles.noBookings}>
            <Car className={styles.noBookingsIcon} />
            <h2 className={styles.noBookingsTitle}>No Bookings Yet</h2>
            <p className={styles.noBookingsText}>
              You haven't made any vehicle bookings yet. Start exploring our fleet to make your first reservation!
            </p>
          </div>
        ) : (
          <div className={styles.bookingsGrid}>
            {bookings.map((booking, index) => (
              <div key={booking.id} className={styles.bookingCard} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={styles.bookingCardHeader}>
                  <h2 className={styles.vehicleName}>{booking.vehicleName || "Unknown Vehicle"}</h2>
                  <p className={styles.bookingId}>ID: {booking.id}</p>
                  <span className={`${styles.statusBadge} ${getStatusClass(booking.bookingStatus)}`}>
                    {getBookingStatusText(booking.bookingStatus)}
                  </span>
                </div>

                <div className={styles.bookingCardBody}>
                  <div className={styles.bookingDates}>
                    <div className={styles.dateSection}>
                      <p className={styles.dateLabel}>From</p>
                      <p className={styles.dateValue}>{formatDate(booking.startDate)}</p>
                    </div>
                    <div className={styles.dateArrow}>→</div>
                    <div className={styles.dateSection}>
                      <p className={styles.dateLabel}>To</p>
                      <p className={styles.dateValue}>{formatDate(booking.endDate)}</p>
                    </div>
                  </div>

                  <div className={styles.bookingDetails}>
                    <div className={styles.detailItem}>
                      <CalendarDays className={styles.detailIcon} />
                      <span className={styles.detailLabel}>Duration</span>
                      <span className={styles.detailValue}>{booking.numberOfDays || 0} days</span>
                    </div>
                    <div className={styles.detailItem}>
                      <User className={styles.detailIcon} />
                      <span className={styles.detailLabel}>Driver</span>
                      <span className={styles.detailValue}>{isDriverNeeded(booking) ? "Included" : "Self-drive"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Calendar className={styles.detailIcon} />
                      <span className={styles.detailLabel}>Booked</span>
                      <span className={styles.detailValue}>{formatDate(booking.bookedDate)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Timer className={styles.detailIcon} />
                      <span className={styles.detailLabel}>Time</span>
                      <span className={styles.detailValue}>{formatTime(booking.bookedTime)}</span>
                    </div>
                  </div>

                  {/* License Section - Updated condition */}
                  {shouldShowLicense(booking) && (
                    <div className={styles.licenseSection}>
                      <div className={styles.licenseHeader}>
                        <CreditCard className={styles.licenseIcon} />
                        <h4 className={styles.licenseTitle}>Driver's License Information</h4>
                      </div>

                      {booking.licenseNumber && booking.licenseNumber.trim() !== "" && (
                        <div className={styles.licenseNumber}>
                          <strong>License Number:</strong> {booking.licenseNumber}
                        </div>
                      )}

                      {booking.licenseImageUrl && booking.licenseImageUrl.trim() !== "" && (
                        <div className={styles.licenseImageContainer}>
                          <p className={styles.licenseImageLabel}>License Image:</p>
                          <img
                            src={booking.licenseImageUrl || "/placeholder.svg"}
                            alt="Driver's License"
                            className={styles.licenseImage}
                            onClick={() => handleImageClick(booking.licenseImageUrl)}
                            onError={(e) => {
                              console.error("Failed to load license image:", booking.licenseImageUrl)
                              e.target.style.display = "none"
                              // Show fallback text
                              const fallback = document.createElement("p")
                              fallback.textContent = "License image unavailable"
                              fallback.className = styles.licenseImageError
                              e.target.parentNode.appendChild(fallback)
                            }}
                            onLoad={() => {
                              console.log("License image loaded successfully:", booking.licenseImageUrl)
                            }}
                            loading="lazy"
                            title="Click to enlarge"
                          />
                        </div>
                      )}

                      {!booking.licenseNumber && !booking.licenseImageUrl && (
                        <div className={styles.licenseNotAvailable}>
                          <p>License information not available</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.priceSection}>
                    <div className={styles.priceRow}>
                      <p className={styles.priceLabel}>Total Amount</p>
                      <p className={styles.priceValue}>Rs {Number.parseFloat(booking.totalPrice || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className={styles.locationSection}>
                    <div className={styles.locationItem}>
                      <MapPin className={styles.locationIcon} />
                      <div className={styles.locationText}>
                        <p className={styles.locationLabel}>Pickup Location</p>
                        <p className={styles.locationValue}>{booking.pickupLocation || "Not specified"}</p>
                      </div>
                    </div>
                    <div className={styles.locationItem}>
                      <MapPin className={styles.locationIcon} />
                      <div className={styles.locationText}>
                        <p className={styles.locationLabel}>Drop-off Location</p>
                        <p className={styles.locationValue}>{booking.dropoffLocation || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  {(booking.specialRequests || booking.notes) && (
                    <div className={styles.additionalInfo}>
                      <h4 style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 0.5rem 0" }}>
                        Additional Information
                      </h4>
                      <p style={{ fontSize: "0.875rem", color: "#1e293b", margin: 0, lineHeight: 1.4 }}>
                        {booking.specialRequests || booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Booking Actions */}
                  <div className={styles.bookingActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.btnUpdate}`}
                      onClick={() => handleUpdateBooking(booking)}
                      disabled={!canModifyBooking(booking)}
                      title={!canModifyBooking(booking) ? "Only pending bookings can be updated" : "Update booking"}
                    >
                      <Edit3 size={16} />
                      Update
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.btnCancel}`}
                      onClick={() => handleCancelBooking(booking)}
                      disabled={!canCancelBooking(booking)}
                      title={!canCancelBooking(booking) ? "This booking cannot be cancelled" : "Cancel booking"}
                    >
                      <Trash2 size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedBooking && (
          <div className={styles.modalOverlay} onClick={() => !updating && setShowUpdateModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Update Booking</h3>
                <button className={styles.modalClose} onClick={() => setShowUpdateModal(false)} disabled={updating}>
                  <X size={16} />
                </button>
              </div>

              {updating && uploadProgress && (
                <div className={styles.uploadProgress}>
                  <Loader2 className={styles.loadingSpinner} size={16} />
                  <span>{uploadProgress}</span>
                </div>
              )}

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Start Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={formatDateForInput(updateForm.startDate)}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    disabled={updating}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>End Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={formatDateForInput(updateForm.endDate)}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    disabled={updating}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Pickup Location</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={updateForm.pickupLocation}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, pickupLocation: e.target.value }))}
                    placeholder="Enter pickup location"
                    disabled={updating}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Drop-off Location</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={updateForm.dropoffLocation}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, dropoffLocation: e.target.value }))}
                    placeholder="Enter drop-off location"
                    disabled={updating}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={updateForm.needDriver}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          needDriver: e.target.checked,
                          ...(e.target.checked && { licenseNumber: "", licenseImage: null }),
                        }))
                      }
                      disabled={updating}
                    />
                    <span className={styles.checkboxCheckmark}></span>I need a driver
                  </label>
                  <p className={styles.checkboxDescription}>
                    {updateForm.needDriver
                      ? "Our professional driver will handle the driving for you."
                      : "You'll drive the vehicle yourself. A valid driver's license is required."}
                  </p>
                </div>

                {/* License fields - only show if needDriver is false */}
                {!updateForm.needDriver && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Driver's License Number</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={updateForm.licenseNumber}
                        onChange={(e) => setUpdateForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                        placeholder="Enter license number"
                        disabled={updating}
                      />
                    </div>

                    {/* Show current license image if exists */}
                    {selectedBooking.licenseImageUrl && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Current License Image</label>
                        <div className={styles.currentLicenseContainer}>
                          <button
                            type="button"
                            className={styles.viewLicenseBtn}
                            onClick={() => setShowCurrentLicense(!showCurrentLicense)}
                            disabled={updating}
                          >
                            {showCurrentLicense ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showCurrentLicense ? "Hide" : "View"} Current License
                          </button>
                          {showCurrentLicense && (
                            <img
                              src={selectedBooking.licenseImageUrl || "/placeholder.svg"}
                              alt="Current Driver's License"
                              className={styles.currentLicenseImage}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        {selectedBooking.licenseImageUrl ? "Update License Image (Optional)" : "License Image"}
                      </label>
                      <div className={styles.fileUploadContainer}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setUpdateForm((prev) => ({ ...prev, licenseImage: e.target.files[0] }))}
                          disabled={updating}
                          className={styles.fileInputHidden}
                          id="licenseImageUpdate"
                        />
                        <label htmlFor="licenseImageUpdate" className={styles.fileUploadButton}>
                          <Upload size={18} />
                          <span>
                            {updateForm.licenseImage
                              ? updateForm.licenseImage.name
                              : selectedBooking.licenseImageUrl
                                ? "Choose New License Image"
                                : "Choose License Image"}
                          </span>
                        </label>
                      </div>
                      <p className={styles.fileUploadHint}>
                        {selectedBooking.licenseImageUrl
                          ? "Upload a new image only if you want to replace the current one"
                          : "Please upload a clear photo of your driver's license"}
                      </p>
                    </div>
                  </>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Special Requests</label>
                  <textarea
                    className={styles.formInput}
                    value={updateForm.specialRequests}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Any special requests or notes"
                    rows="3"
                    style={{ resize: "vertical", minHeight: "80px" }}
                    disabled={updating}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                  onClick={() => setShowUpdateModal(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                  onClick={submitUpdate}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className={styles.btnSpinner} size={16} />
                      Updating...
                    </>
                  ) : (
                    "Update Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && selectedBooking && (
          <div className={styles.modalOverlay} onClick={() => !cancelling && setShowCancelModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Cancel Booking</h3>
                <button className={styles.modalClose} onClick={() => setShowCancelModal(false)} disabled={cancelling}>
                  <X size={16} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.confirmDialog}>
                  <AlertTriangle className={styles.confirmIcon} />
                  <h4 className={styles.confirmTitle}>Are you sure?</h4>
                  <p className={styles.confirmMessage}>
                    You are about to cancel your booking for <strong>{selectedBooking.vehicleName}</strong>. This will
                    make the vehicle available for other customers. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                  onClick={submitCancellation}
                  disabled={cancelling}
                  style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                >
                  {cancelling ? (
                    <>
                      <Loader2 className={styles.btnSpinner} size={16} />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Enlargement Modal */}
        {showImageModal && selectedImage && (
          <div className={styles.imageModalOverlay} onClick={() => setShowImageModal(false)}>
            <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.imageModalClose} onClick={() => setShowImageModal(false)} title="Close">
                <X size={24} />
              </button>
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Enlarged License"
                className={styles.enlargedImage}
                onError={(e) => {
                  console.error("Failed to load enlarged image:", selectedImage)
                  e.target.style.display = "none"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
