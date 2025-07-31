"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import "./complain.css"

export default function VehicleComplaintForm() {
  const { user, isLoaded } = useUser()

  const [vehicles, setVehicles] = useState([])
  const [userBookings, setUserBookings] = useState([])
  const [formData, setFormData] = useState({
    vehicleId: "",
    bookingId: "",
    category: "",
    phone: "",
    subject: "",
    description: "",
    priority: "medium",
    status: "not-solved",
    rentalStartDate: "",
    rentalEndDate: "",
    issueDate: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if vehicle selection should be enabled
  const isVehicleSelectionEnabled = () => {
    return formData.category === "vehicle-condition" || formData.category === "accident"
  }

  // Fetch user's bookings and related vehicles
  useEffect(() => {
    const fetchUserBookingsAndVehicles = async () => {
      if (!isLoaded || !user) return

      try {
        // First, fetch user's bookings
        const bookingsQuery = query(collection(db, "bookings"), where("userId", "==", user.id))
        const bookingsSnapshot = await getDocs(bookingsQuery)
        const userBookingsList = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setUserBookings(userBookingsList)

        // Get unique vehicle IDs from user's bookings
        const vehicleIds = [...new Set(userBookingsList.map((booking) => booking.vehicleId))]

        if (vehicleIds.length > 0) {
          // Fetch all vehicles
          const vehiclesSnapshot = await getDocs(collection(db, "vehicles"))
          const allVehicles = vehiclesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          // Filter vehicles to only include those the user has booked
          const userVehicles = allVehicles.filter((vehicle) => vehicleIds.includes(vehicle.id))

          setVehicles(userVehicles)
        }
      } catch (error) {
        console.error("Error fetching user bookings and vehicles:", error)
      }
    }

    fetchUserBookingsAndVehicles()
  }, [isLoaded, user])

  const handleChange = (e) => {
    const { name, value } = e.target

    // If category changes and it's not vehicle-condition or accident, clear vehicle selection
    if (name === "category" && value !== "vehicle-condition" && value !== "accident") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        vehicleId: "",
        bookingId: "",
        rentalStartDate: "",
        rentalEndDate: "",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // If vehicle is selected, auto-populate booking info
    if (name === "vehicleId" && value) {
      const selectedBooking = userBookings.find((booking) => booking.vehicleId === value)
      if (selectedBooking) {
        setFormData((prev) => ({
          ...prev,
          bookingId: selectedBooking.id,
          rentalStartDate: selectedBooking.startDate || "",
          rentalEndDate: selectedBooking.endDate || "",
        }))
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Only require vehicle selection for vehicle condition and accident complaints
    if (isVehicleSelectionEnabled() && !formData.vehicleId) {
      newErrors.vehicleId = "Please select a vehicle for this type of complaint"
    }

    if (!formData.category) {
      newErrors.category = "Please select a complaint category"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length === 0 && user) {
      setIsSubmitting(true)
      try {
        // Get selected vehicle and booking details
        const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId)
        const selectedBooking = userBookings.find((b) => b.id === formData.bookingId)

        // Prepare data for Firebase
        const complaintData = {
          ...formData,
          vehicleName: selectedVehicle?.name || "N/A",
          vehicleCategory: selectedVehicle?.category || "N/A",
          bookingReference: selectedBooking?.id || "",
          userId: user.id,
          userName: user.username || user.firstName + " " + user.lastName,
          userEmail: user.primaryEmailAddress?.emailAddress,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Add to Firebase
        const docRef = await addDoc(collection(db, "complaints"), complaintData)

        console.log("Complaint submitted with ID: ", docRef.id)
        alert("Complaint submitted successfully! Reference ID: " + docRef.id)

        // Reset form
        setFormData({
          vehicleId: "",
          bookingId: "",
          category: "",
          phone: "",
          subject: "",
          description: "",
          priority: "medium",
          status: "not-solved",
          rentalStartDate: "",
          rentalEndDate: "",
          issueDate: "",
        })
      } catch (error) {
        console.error("Error adding complaint: ", error)
        alert("Error submitting complaint. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setErrors(newErrors)
    }
  }

  if (!isLoaded) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <div className="error">Please log in to submit a complaint.</div>
  }

  return (
    <div className="complaint-form-container">
      <div className="complaint-form-card">
        <div className="form-header">
          <div className="danger-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" />
            </svg>
          </div>
          <h2>Vehicle Rental Complaint</h2>
          <p>Report issues with your rental experience</p>
          <div className="user-info">
            <span>Logged in as: {user.fullName || user.firstName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Complaint Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? "error" : ""}
              >
                <option value="">Select category</option>
                <option value="app">Mobile App Issues</option>
                <option value="billing">Billing & Payment</option>
                <option value="technical">Technical Support</option>
                <option value="vehicle-condition">Vehicle Condition</option>
                <option value="customer-service">Customer Service</option>
                <option value="pickup-delivery">Pickup/Delivery</option>
                <option value="accident">Accident/Damage</option>
                <option value="maintenance">Maintenance Issues</option>
                <option value="booking">Booking Problems</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="vehicleId">
                Select Vehicle from Your Bookings
                {isVehicleSelectionEnabled() && <span style={{ color: "#dc2626" }}> *</span>}
                {!isVehicleSelectionEnabled() && (
                  <span style={{ color: "#6b7280", fontWeight: "normal", fontSize: "12px" }}>
                    {" "}
                    (Available for Vehicle Condition & Accident/Damage complaints)
                  </span>
                )}
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className={errors.vehicleId ? "error" : ""}
                disabled={!isVehicleSelectionEnabled()}
                style={{
                  backgroundColor: !isVehicleSelectionEnabled() ? "#f3f4f6" : "inherit",
                  cursor: !isVehicleSelectionEnabled() ? "not-allowed" : "pointer",
                  opacity: !isVehicleSelectionEnabled() ? 0.6 : 1,
                }}
              >
                <option value="">
                  {!isVehicleSelectionEnabled()
                    ? "Select 'Vehicle Condition' or 'Accident/Damage' category first"
                    : vehicles.length === 0
                      ? "No bookings found"
                      : "Choose from your booked vehicles"}
                </option>
                {isVehicleSelectionEnabled() &&
                  vehicles.map((vehicle) => {
                    const booking = userBookings.find((b) => b.vehicleId === vehicle.id)
                    return (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.category} (Booked: {booking?.startDate || "N/A"})
                      </option>
                    )
                  })}
              </select>
              {errors.vehicleId && <span className="error-message">{errors.vehicleId}</span>}
            </div>
          </div>

          {formData.bookingId && isVehicleSelectionEnabled() && (
            <div className="form-group">
              <label>Booking Reference</label>
              <input
                type="text"
                value={formData.bookingId}
                disabled
                style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
              required
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "error" : ""}
                placeholder="Enter your phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="issueDate">Issue Date *</label>
              <input
              required
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className={errors.issueDate ? "error" : ""}
              />
              {errors.issueDate && <span className="error-message">{errors.issueDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rentalStartDate">
                Rental Start Date
                {isVehicleSelectionEnabled() && formData.rentalStartDate && (
                  <span style={{ color: "#10b981", fontSize: "12px" }}> (Auto-filled from booking)</span>
                )}
              </label>
              <input
              
                type="date"
                id="rentalStartDate"
                name="rentalStartDate"
                value={formData.rentalStartDate}
                onChange={handleChange}
                style={{
                  backgroundColor: isVehicleSelectionEnabled() && formData.rentalStartDate ? "#f3f4f6" : "inherit",
                  opacity: !isVehicleSelectionEnabled() ? 0.7 : 1,
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rentalEndDate">
                Rental End Date
                {isVehicleSelectionEnabled() && formData.rentalEndDate && (
                  <span style={{ color: "#10b981", fontSize: "12px" }}> (Auto-filled from booking)</span>
                )}
              </label>
              <input
              
                type="date"
                id="rentalEndDate"
                name="rentalEndDate"
                value={formData.rentalEndDate}
                onChange={handleChange}
                style={{
                  backgroundColor: isVehicleSelectionEnabled() && formData.rentalEndDate ? "#f3f4f6" : "inherit",
                  opacity: !isVehicleSelectionEnabled() ? 0.7 : 1,
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? "error" : ""}
              placeholder="Brief description of the issue"
            />
            {errors.subject && <span className="error-message">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
            required
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? "error" : ""}
              placeholder="Please provide detailed information about your complaint..."
              rows="5"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority Level</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={formData.priority === "low"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Low
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={formData.priority === "medium"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Medium
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={formData.priority === "high"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  High
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="priority"
                    value="urgent"
                    checked={formData.priority === "urgent"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Urgent
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Current Status</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="status"
                    value="not-solved"
                    checked={formData.status === "not-solved"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Not Solved
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="status"
                    value="in-progress"
                    checked={formData.status === "in-progress"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  In Progress
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="status"
                    value="solved"
                    checked={formData.status === "solved"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Solved
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
