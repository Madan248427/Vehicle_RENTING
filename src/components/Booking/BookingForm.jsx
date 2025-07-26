"use client"

import { useState } from "react"
import { X, Car, User, MapPin, CreditCard, Upload, Loader2 } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useParams } from "react-router-dom"
import "./booking-form.css"

export default function BookingForm({ vehicle, onClose }) {
  const { id: vehicleId } = useParams() // Get vehicle ID from URL

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
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "your_upload_preset") // Replace with your Cloudinary upload preset
    formData.append("cloud_name", "your_cloud_name") // Replace with your Cloudinary cloud name

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
      return data.secure_url // Returns the Cloudinary URL
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      throw error
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadProgress("")

    try {
      let licenseImageUrl = null

      // Upload image to Cloudinary if driver is not needed and image exists
      if (!bookingData.needDriver && bookingData.licenseImage) {
        licenseImageUrl = await uploadToCloudinary(bookingData.licenseImage)
        setUploadProgress("Image uploaded successfully!")
      }

      // Prepare data for Firebase
      const bookingDataForFirebase = {
        // Vehicle details from URL and props
        vehicleId: vehicleId, // From URL params
        vehicleName: vehicle.name,
        vehiclePrice: vehicle.price,
        vehicleCategory: vehicle.category,

        // Rental details
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        needDriver: bookingData.needDriver,
        numberOfDays: calculateDays(),
        totalPrice: vehicle.price * calculateDays(),

        // Personal information
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,

        // License information (only if self-drive)
        ...(!bookingData.needDriver && {
          licenseNumber: bookingData.licenseNumber,
          licenseImageUrl: licenseImageUrl, // Cloudinary URL
        }),

        // Location details
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        address: bookingData.address,
        city: bookingData.city,
        zipCode: bookingData.zipCode,

        // Metadata
        bookingStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      setUploadProgress("Saving booking details...")

      // Save to Firebase Firestore
      const docRef = await addDoc(collection(db, "bookings"), bookingDataForFirebase)

      console.log("Booking saved with ID: ", docRef.id)
      setUploadProgress("Booking submitted successfully!")

      // Show success message
      alert(`Booking submitted successfully! Booking ID: ${docRef.id}`)

      // Close modal after short delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Error submitting booking:", error)
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
  }

  const handleCheckboxChange = (e) => {
    setBookingData((prevData) => ({
      ...prevData,
      needDriver: e.target.checked,
      // Clear license data if driver is needed
      ...(e.target.checked && {
        licenseNumber: "",
        licenseImage: null,
      }),
    }))
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
          onClose()
        }
      }}
    >
      <div className="booking-modal">
        <div className="booking-modal-header">
          <div className="header-content">
            <h2>Book {vehicle.name}</h2>
            <p className="vehicle-id">Vehicle ID: {vehicleId}</p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="loading-overlay">
            <div className="loading-content">
              <Loader2 className="loading-spinner" size={32} />
              <p>{uploadProgress || "Processing your booking..."}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="booking-form">
          <div className="form-section">
            <h3>
              <Car size={20} />
              Rental Details
            </h3>

            <div className="form-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="needDriver"
                  checked={bookingData.needDriver}
                  onChange={handleCheckboxChange}
                  className="checkbox-input"
                  disabled={isSubmitting}
                />
                <span className="checkbox-checkmark"></span>I need a driver
              </label>
              <p className="checkbox-description">
                {bookingData.needDriver
                  ? "Our professional driver will handle the driving for you."
                  : "You'll drive the vehicle yourself. A valid driver's license is required."}
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={bookingData.endDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <User size={20} />
              Personal Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={bookingData.firstName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={bookingData.lastName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Driver's License fields - only show when driver is NOT needed */}
            {needsLicense && (
              <>
                <div className="form-group">
                  <label htmlFor="licenseNumber">Driver's License Number</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={bookingData.licenseNumber}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="licenseImage">Driver's License Image</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="licenseImage"
                      name="licenseImage"
                      accept="image/*"
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                      className="file-input-hidden"
                    />
                    <label htmlFor="licenseImage" className="file-upload-button">
                      <Upload size={18} />
                      <span>{bookingData.licenseImage ? bookingData.licenseImage.name : "Choose License Image"}</span>
                    </label>
                  </div>
                  <p className="file-upload-hint">Please upload a clear photo of your driver's license</p>
                </div>
              </>
            )}
          </div>

          <div className="form-section">
            <h3>
              <MapPin size={20} />
              Location Details
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickupLocation">Pickup Location</label>
                <input
                  type="text"
                  id="pickupLocation"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup address"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dropoffLocation">Drop-off Location</label>
                <input
                  type="text"
                  id="dropoffLocation"
                  name="dropoffLocation"
                  value={bookingData.dropoffLocation}
                  onChange={handleInputChange}
                  placeholder="Enter drop-off address"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={bookingData.address}
                  onChange={handleInputChange}
                  placeholder="Your street address"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={bookingData.city}
                  onChange={handleInputChange}
                  placeholder="Your city"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={bookingData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Your ZIP code"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="form-group">{/* Empty div for grid alignment */}</div>
            </div>
          </div>

          <div className="booking-summary">
            <div className="summary-header">
              <CreditCard size={20} />
              <span>Booking Summary</span>
            </div>
            <div className="summary-row">
              <span>Vehicle:</span>
              <span>{vehicle.name}</span>
            </div>
            <div className="summary-row">
              <span>Vehicle ID:</span>
              <span>{vehicleId}</span>
            </div>
            <div className="summary-row">
              <span>Daily Rate:</span>
              <span>${vehicle.price}</span>
            </div>
            <div className="summary-row">
              <span>Number of Days:</span>
              <span>{calculateDays()}</span>
            </div>
            <div className="summary-row">
              <span>Service Type:</span>
              <span>{bookingData.needDriver ? "With Driver" : "Self-Drive"}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>${totalPrice}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="btn-spinner" size={16} />
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
