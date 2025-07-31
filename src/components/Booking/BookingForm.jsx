"use client"
import { useState, useEffect } from "react"
import { X, Car, User, MapPin, CreditCard, Upload, Loader2 } from "lucide-react"
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useUser } from "@clerk/clerk-react"
import "./booking-form.css"

export default function BookingForm({ vehicle, onClose }) {
  const { isLoaded, isSignedIn, user } = useUser()
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
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  // Driver fee per day
  const DRIVER_FEE_PER_DAY = 25

  useEffect(() => {
    if (isLoaded) {
      setBookingData((prevData) => ({
        ...prevData,
        userId: isSignedIn ? user.id : "unidentified",
        userEmail: isSignedIn ? user.primaryEmailAddress?.emailAddress || "unidentified" : "unidentified",
        firstName: isSignedIn && user.firstName ? user.firstName : prevData.firstName,
        lastName: isSignedIn && user.lastName ? user.lastName : prevData.lastName,
        email:
          isSignedIn && user.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress : prevData.email,
      }))
    }
  }, [isLoaded, isSignedIn, user])

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

  const calculateTotalPrice = () => {
    const days = calculateDays()
    const vehiclePrice = vehicle ? vehicle.price * days : 0
    const driverPrice = bookingData.needDriver ? DRIVER_FEE_PER_DAY * days : 0
    return vehiclePrice + driverPrice
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
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

      const days = calculateDays()
      const vehiclePrice = vehicle.price * days
      const driverPrice = bookingData.needDriver ? DRIVER_FEE_PER_DAY * days : 0
      const totalPrice = vehiclePrice + driverPrice

      const bookingDataForFirebase = {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehiclePrice: vehicle.price,
        vehicleCategory: vehicle.category,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        needDriver: bookingData.needDriver,
        numberOfDays: days,
        vehicleTotalPrice: vehiclePrice,
        driverFeePerDay: bookingData.needDriver ? DRIVER_FEE_PER_DAY : 0,
        driverTotalPrice: driverPrice,
        totalPrice: totalPrice,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        userId: bookingData.userId,
        userEmail: bookingData.userEmail,
        ...(!bookingData.needDriver && {
          licenseNumber: bookingData.licenseNumber,
          licenseImageUrl: licenseImageUrl,
        }),
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        address: bookingData.address,
        city: bookingData.city,
        zipCode: bookingData.zipCode,
        bookingStatus: "Pending",
        bookedDate: bookedDate,
        bookedTime: bookedTime,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      setUploadProgress("Saving booking details...")
      const docRef = await addDoc(collection(db, "bookings"), bookingDataForFirebase)
      console.log("Booking saved with ID: ", docRef.id)

      const vehicleRef = doc(db, "vehicles", vehicle.id)
      await updateDoc(vehicleRef, {
        isAvailable: false,
        updatedAt: serverTimestamp(),
      })
      console.log(`Vehicle ${vehicle.id} marked as unavailable.`)

      setUploadProgress("Booking submitted successfully!")
      alert(`Booking submitted successfully! Booking ID: ${docRef.id}`)

      setTimeout(() => {
        onClose()
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
  }

  const handleCheckboxChange = (e) => {
    setBookingData((prevData) => ({
      ...prevData,
      needDriver: e.target.checked,
      ...(e.target.checked && {
        licenseNumber: "",
        licenseImage: null,
      }),
    }))
  }

  const totalPrice = calculateTotalPrice()
  const needsLicense = !bookingData.needDriver
  const days = calculateDays()
  const vehicleSubtotal = vehicle ? vehicle.price * days : 0
  const driverSubtotal = bookingData.needDriver ? DRIVER_FEE_PER_DAY * days : 0

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
            <p className="vehicle-id">Vehicle ID: {vehicle.id}</p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

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
                <span className="checkbox-checkmark"></span>I need a driver (+$25/day)
              </label>
              <p className="checkbox-description">
                {bookingData.needDriver
                  ? "Our professional driver will handle the driving for you. Additional $25 per day."
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
                  disabled={isSubmitting || (isSignedIn && user.firstName)}
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
                  disabled={isSubmitting || (isSignedIn && user.lastName)}
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
                  disabled={isSubmitting || (isSignedIn && user.primaryEmailAddress?.emailAddress)}
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
              <span>{vehicle.id}</span>
            </div>
            <div className="summary-row">
              <span>Daily Rate:</span>
              <span>${vehicle.price}</span>
            </div>
            <div className="summary-row">
              <span>Number of Days:</span>
              <span>{days}</span>
            </div>
            <div className="summary-row">
              <span>Vehicle Subtotal:</span>
              <span>${vehicleSubtotal}</span>
            </div>
            {bookingData.needDriver && (
              <>
                <div className="summary-row">
                  <span>Driver Fee (${DRIVER_FEE_PER_DAY}/day):</span>
                  <span>${driverSubtotal}</span>
                </div>
              </>
            )}
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
