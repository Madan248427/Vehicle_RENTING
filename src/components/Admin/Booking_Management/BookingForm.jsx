"use client"
import { useState, useEffect } from "react"
import { X, Car, User, MapPin, CreditCard, Upload, Loader2, Calendar, Phone, Mail, FileText } from "lucide-react"
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { useUser } from "@clerk/clerk-react"
import "./BookingForm.css" // Regular CSS import
import { useParams } from "react-router-dom"

export default function BookingForm({ vehicle, onClose }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const params = useParams()
  const vehicleIdFromParams = params.vehicleId
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    pickupLocation: "",
    dropoffLocation: "",
    address: "",
    city: "",
    zipCode: "",
    needDriver: false,
    licenseImage: null,
    userId: "",
    userEmail: "",
    vehicleId: vehicle?.id || "",
    specialRequests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isLoaded) {
      setBookingData((prevData) => ({
        ...prevData,
        vehicleId: vehicleIdFromParams || vehicle?.id || "",
        userId: isSignedIn ? user?.id || "guest" : "guest",
        userEmail: isSignedIn ? user?.primaryEmailAddress?.emailAddress || "" : "",
        firstName: isSignedIn && user?.firstName ? user.firstName : "",
        lastName: isSignedIn && user?.lastName ? user.lastName : "",
        email: isSignedIn && user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress : "",
      }))
    }
  }, [isLoaded, isSignedIn, user, vehicle])

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "images")
    formData.append("cloud_name", "duortzwqq")

    try {
      setUploadProgress("Uploading license image...")
      const response = await fetch("https://api.cloudinary.com/v1_1/duortzwqq/image/upload", {
        method: "POST",
        body: formData,
      })

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

  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    if (!bookingData.startDate) newErrors.startDate = "Start date is required"
    if (!bookingData.endDate) newErrors.endDate = "End date is required"
    if (!bookingData.firstName) newErrors.firstName = "First name is required"
    if (!bookingData.lastName) newErrors.lastName = "Last name is required"
    if (!bookingData.email) newErrors.email = "Email is required"
    if (!bookingData.phone) newErrors.phone = "Phone number is required"
    if (!bookingData.pickupLocation) newErrors.pickupLocation = "Pickup location is required"
    if (!bookingData.dropoffLocation) newErrors.dropoffLocation = "Drop-off location is required"
    if (!bookingData.address) newErrors.address = "Address is required"
    if (!bookingData.city) newErrors.city = "City is required"
    if (!bookingData.zipCode) newErrors.zipCode = "ZIP code is required"
    if (!bookingData.vehicleId) newErrors.vehicleId = "Vehicle ID is required"

    // Driver license validation (only if not needing driver)
    if (!bookingData.needDriver) {
      if (!bookingData.licenseNumber) newErrors.licenseNumber = "License number is required"
      if (!bookingData.licenseImage) newErrors.licenseImage = "License image is required"
    }

    // Date validation
    if (bookingData.startDate && bookingData.endDate) {
      const startDate = new Date(bookingData.startDate)
      const endDate = new Date(bookingData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        newErrors.startDate = "Start date cannot be in the past"
      }

      if (endDate <= startDate) {
        newErrors.endDate = "End date must be after start date"
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (bookingData.email && !emailRegex.test(bookingData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (bookingData.phone && !phoneRegex.test(bookingData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setUploadProgress("")

    try {
      let licenseImageUrl = null

      if (!bookingData.needDriver && bookingData.licenseImage) {
        licenseImageUrl = await uploadToCloudinary(bookingData.licenseImage)
        setUploadProgress("Image uploaded successfully!")
      }

      // Get current date and time for the new fields
      const now = new Date()
      const bookedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const bookedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })

      const bookingDataForFirebase = {
        // Vehicle Information
        vehicleId: bookingData.vehicleId,
        vehicleName: vehicle?.name || "Manual Entry",
        vehiclePrice: vehicle?.price || 0,
        vehicleCategory: vehicle?.category || "Unknown",

        // Booking Dates
        startDate: new Date(bookingData.startDate),
        endDate: new Date(bookingData.endDate),
        numberOfDays: calculateDays(),
        totalPrice: (vehicle?.price || 0) * calculateDays(),

        // Personal Information
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        userName: `${bookingData.firstName} ${bookingData.lastName}`,
        email: bookingData.email,
        phone: bookingData.phone,
        userId: bookingData.userId,
        userEmail: bookingData.userEmail,

        // Driver Information
        needDriver: bookingData.needDriver,
        ...(!bookingData.needDriver && {
          licenseNumber: bookingData.licenseNumber,
          licenseImageUrl: licenseImageUrl,
        }),

        // Location Information
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        address: bookingData.address,
        city: bookingData.city,
        zipCode: bookingData.zipCode,

        // Additional Information
        specialRequests: bookingData.specialRequests || "",

        // Status and Timestamps
        bookingStatus: "pending",
        bookedDate: bookedDate,
        bookedTime: bookedTime,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      setUploadProgress("Saving booking details...")
      const docRef = await addDoc(collection(db, "bookings"), bookingDataForFirebase)
      console.log("Booking saved with ID: ", docRef.id)

      // Update vehicle availability
      if (bookingData.vehicleId) {
        const vehicleRef = doc(db, "vehicles", bookingData.vehicleId)
        await updateDoc(vehicleRef, {
          isAvailable: false,
          updatedAt: serverTimestamp(),
        })
        console.log(`Vehicle ${bookingData.vehicleId} marked as unavailable.`)
      }

      setUploadProgress("Booking submitted successfully!")
      alert(`Booking submitted successfully! Booking ID: ${docRef.id}`)

      setTimeout(() => {
        if (onClose) {
          onClose()
        } else {
          window.location.href = "/admin/vehicle"
        }
      }, 1500)
    } catch (error) {
      console.error("Error submitting booking or updating vehicle:", error)
      alert("Error submitting booking. Please try again.")
      setUploadProgress("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setBookingData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked
    setBookingData((prevData) => ({
      ...prevData,
      needDriver: checked,
      ...(checked && {
        licenseNumber: "",
        licenseImage: null,
      }),
    }))

    // Clear license-related errors when driver is needed
    if (checked) {
      setErrors((prev) => ({
        ...prev,
        licenseNumber: "",
        licenseImage: "",
      }))
    }
  }

  const calculateDays = () => {
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate)
      const end = new Date(bookingData.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays || 1
    }
    return 1
  }

  const totalPrice = vehicle ? vehicle.price * calculateDays() : 0
  const needsLicense = !bookingData.needDriver

  return (
    <div
      className="booking-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          if (onClose) onClose()
        }
      }}
    >
      <div className="booking-modal">
        <div className="booking-modal-header">
          <div className="booking-header-content">
            <h2>Book Vehicle</h2>
            {vehicle && <p className="booking-vehicle-id">Vehicle: {vehicle.name}</p>}
            {bookingData.vehicleId && !vehicle && (
              <p className="booking-vehicle-id">Vehicle ID: {bookingData.vehicleId}</p>
            )}
          </div>
          <button
            className="booking-close-btn"
            onClick={onClose || (() => (window.location.href = "/admin/vehicle"))}
            disabled={isSubmitting}
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {isSubmitting && (
          <div className="booking-loading-overlay">
            <div className="booking-loading-content">
              <Loader2 className="booking-loading-spinner" size={32} />
              <p>{uploadProgress || "Processing your booking..."}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="booking-form">
          {/* Vehicle Information Section */}
          <div className="booking-section">
            <h3 className="booking-section-title">
              <Car size={20} />
              Vehicle Information
            </h3>
            <div className="booking-group">
              <label htmlFor="vehicleId" className="booking-label">
                <Car size={16} />
                Vehicle ID *
              </label>
              <input
                type="text"
                id="vehicleId"
                name="vehicleId"
                value={bookingData.vehicleId}
                onChange={handleInputChange}
                disabled={isSubmitting || !!bookingData.vehicleId}
                className={`booking-input ${errors.vehicleId ? "booking-input-error" : ""}`}
                placeholder="Enter vehicle ID"
                required
                readOnly={!!bookingData.vehicleId}
              />
              {errors.vehicleId && <span className="booking-error">{errors.vehicleId}</span>}
              <p className="booking-file-hint">
                {bookingData.vehicleId
                  ? "Vehicle ID has been automatically set"
                  : "Enter the ID of the vehicle you want to book"}
              </p>
            </div>
          </div>

          {/* Rental Details Section */}
          <div className="booking-section">
            <h3 className="booking-section-title">
              <Calendar size={20} />
              Rental Details
            </h3>
            <div className="booking-checkbox-group">
              <label className="booking-checkbox-container">
                <input
                  type="checkbox"
                  name="needDriver"
                  checked={bookingData.needDriver}
                  onChange={handleCheckboxChange}
                  className="booking-checkbox"
                  disabled={isSubmitting}
                />
                <span className="booking-checkmark"></span>I need a driver
              </label>
              <p className="booking-checkbox-description">
                {bookingData.needDriver
                  ? "Our professional driver will handle the driving for you."
                  : "You'll drive the vehicle yourself. A valid driver's license is required."}
              </p>
            </div>
            <div className="booking-row">
              <div className="booking-group">
                <label htmlFor="startDate" className="booking-label">
                  <Calendar size={16} />
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`booking-input ${errors.startDate ? "booking-input-error" : ""}`}
                  required
                />
                {errors.startDate && <span className="booking-error">{errors.startDate}</span>}
              </div>
              <div className="booking-group">
                <label htmlFor="endDate" className="booking-label">
                  <Calendar size={16} />
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={bookingData.endDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`booking-input ${errors.endDate ? "booking-input-error" : ""}`}
                  required
                />
                {errors.endDate && <span className="booking-error">{errors.endDate}</span>}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="booking-section">
            <h3 className="booking-section-title">
              <User size={20} />
              Personal Information
            </h3>
            <div className="booking-row">
              <div className="booking-group">
                <label htmlFor="firstName" className="booking-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={bookingData.firstName}
                  onChange={handleInputChange}
                  disabled={isSubmitting || (isSignedIn && user?.firstName)}
                  className={`booking-input ${errors.firstName ? "booking-input-error" : ""}`}
                  placeholder="Enter your first name"
                  required
                />
                {errors.firstName && <span className="booking-error">{errors.firstName}</span>}
              </div>
              <div className="booking-group">
                <label htmlFor="lastName" className="booking-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={bookingData.lastName}
                  onChange={handleInputChange}
                  disabled={isSubmitting || (isSignedIn && user?.lastName)}
                  className={`booking-input ${errors.lastName ? "booking-input-error" : ""}`}
                  placeholder="Enter your last name"
                  required
                />
                {errors.lastName && <span className="booking-error">{errors.lastName}</span>}
              </div>
            </div>
            <div className="booking-row">
              <div className="booking-group">
                <label htmlFor="email" className="booking-label">
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting || (isSignedIn && user?.primaryEmailAddress?.emailAddress)}
                  className={`booking-input ${errors.email ? "booking-input-error" : ""}`}
                  placeholder="Enter your email address"
                  required
                />
                {errors.email && <span className="booking-error">{errors.email}</span>}
              </div>
              <div className="booking-group">
                <label htmlFor="phone" className="booking-label">
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`booking-input ${errors.phone ? "booking-input-error" : ""}`}
                  placeholder="Enter your phone number"
                  required
                />
                {errors.phone && <span className="booking-error">{errors.phone}</span>}
              </div>
            </div>

            {needsLicense && (
              <>
                <div className="booking-group">
                  <label htmlFor="licenseNumber" className="booking-label">
                    <FileText size={16} />
                    Driver's License Number *
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={bookingData.licenseNumber}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`booking-input ${errors.licenseNumber ? "booking-input-error" : ""}`}
                    placeholder="Enter your license number"
                    required
                  />
                  {errors.licenseNumber && <span className="booking-error">{errors.licenseNumber}</span>}
                </div>
                <div className="booking-group">
                  <label htmlFor="licenseImage" className="booking-label">
                    <Upload size={16} />
                    Driver's License Image *
                  </label>
                  <div className="booking-file-upload-container">
                    <input
                      type="file"
                      id="licenseImage"
                      name="licenseImage"
                      accept="image/*"
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="booking-file-input"
                      required
                    />
                    <label htmlFor="licenseImage" className="booking-file-upload-button">
                      <Upload size={18} />
                      <span>{bookingData.licenseImage ? bookingData.licenseImage.name : "Choose License Image"}</span>
                    </label>
                  </div>
                  {errors.licenseImage && <span className="booking-error">{errors.licenseImage}</span>}
                  <p className="booking-file-hint">Please upload a clear photo of your driver's license</p>
                </div>
              </>
            )}
          </div>

          {/* Location Details Section */}
          <div className="booking-section">
            <h3 className="booking-section-title">
              <MapPin size={20} />
              Location Details
            </h3>
            <div className="booking-row">
              <div className="booking-group">
                <label htmlFor="pickupLocation" className="booking-label">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  id="pickupLocation"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup address"
                  disabled={isSubmitting}
                  className={`booking-input ${errors.pickupLocation ? "booking-input-error" : ""}`}
                  required
                />
                {errors.pickupLocation && <span className="booking-error">{errors.pickupLocation}</span>}
              </div>
              <div className="booking-group">
                <label htmlFor="dropoffLocation" className="booking-label">
                  Drop-off Location *
                </label>
                <input
                  type="text"
                  id="dropoffLocation"
                  name="dropoffLocation"
                  value={bookingData.dropoffLocation}
                  onChange={handleInputChange}
                  placeholder="Enter drop-off address"
                  disabled={isSubmitting}
                  className={`booking-input ${errors.dropoffLocation ? "booking-input-error" : ""}`}
                  required
                />
                {errors.dropoffLocation && <span className="booking-error">{errors.dropoffLocation}</span>}
              </div>
            </div>
            <div className="booking-row">
              <div className="booking-group">
                <label htmlFor="address" className="booking-label">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={bookingData.address}
                  onChange={handleInputChange}
                  placeholder="Your street address"
                  disabled={isSubmitting}
                  className={`booking-input ${errors.address ? "booking-input-error" : ""}`}
                  required
                />
                {errors.address && <span className="booking-error">{errors.address}</span>}
              </div>
              <div className="booking-group">
                <label htmlFor="city" className="booking-label">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={bookingData.city}
                  onChange={handleInputChange}
                  placeholder="Your city"
                  disabled={isSubmitting}
                  className={`booking-input ${errors.city ? "booking-input-error" : ""}`}
                  required
                />
                {errors.city && <span className="booking-error">{errors.city}</span>}
              </div>
            </div>
            <div className="booking-row">
              <div className="booking-group">
                <label htmlFor="zipCode" className="booking-label">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={bookingData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Your ZIP code"
                  disabled={isSubmitting}
                  className={`booking-input ${errors.zipCode ? "booking-input-error" : ""}`}
                  required
                />
                {errors.zipCode && <span className="booking-error">{errors.zipCode}</span>}
              </div>
              <div className="booking-group">
                <label htmlFor="specialRequests" className="booking-label">
                  Special Requests
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requests or notes..."
                  disabled={isSubmitting}
                  className="booking-textarea"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="booking-summary">
            <div className="booking-summary-header">
              <CreditCard size={20} />
              <span>Booking Summary</span>
            </div>
            <div className="booking-summary-content">
              <div className="booking-summary-row">
                <span>Vehicle ID:</span>
                <span>{bookingData.vehicleId || "Not specified"}</span>
              </div>
              {vehicle && (
                <>
                  <div className="booking-summary-row">
                    <span>Vehicle:</span>
                    <span>{vehicle.name}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span>Daily Rate:</span>
                    <span>${vehicle.price}</span>
                  </div>
                </>
              )}
              <div className="booking-summary-row">
                <span>Number of Days:</span>
                <span>{calculateDays()}</span>
              </div>
              <div className="booking-summary-row">
                <span>Service Type:</span>
                <span>{bookingData.needDriver ? "With Driver" : "Self-Drive"}</span>
              </div>
              {vehicle && (
                <div className="booking-summary-row booking-summary-total">
                  <span>Total Amount:</span>
                  <span>${totalPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="booking-actions">
            <button
              type="button"
              className="booking-btn booking-btn-secondary"
              onClick={onClose || (() => (window.location.href = "/dashboard"))}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="booking-btn booking-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="booking-btn-spinner" size={16} />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
