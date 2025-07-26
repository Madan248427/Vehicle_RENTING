"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, CheckCircle, Settings, Fuel, Users, Gauge } from "lucide-react" // Added Gauge icon for mileage
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase" // Keeping your original path
import BookingForm from "../Booking/BookingForm"
import "./vehicle-details.css"

const cloudinaryBase = "https://res.cloudinary.com/duortzwqq/image/upload"

export default function VehicleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [imageLoading, setImageLoading] = useState({})

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const snapshot = await getDocs(collection(db, "vehicles"))
        const allVehicles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const foundVehicle = allVehicles.find((v) => v.id === id)

        if (foundVehicle) {
          const processedVehicle = {
            ...foundVehicle,
            is_available: foundVehicle.isAvailable !== undefined ? foundVehicle.isAvailable : foundVehicle.is_available,
            gallery: foundVehicle.imageId ? [foundVehicle.imageId] : foundVehicle.gallery || [],
            longDescription: foundVehicle.longDescription || foundVehicle.description || "No description available",
            // Ensure all specifications are grouped under 'specifications' for consistent display
            specifications: {
              engine: foundVehicle.specifications?.engine || "Not specified",
              power: foundVehicle.specifications?.power || "Not specified",
              seating: foundVehicle.specifications?.seating || "Not specified",
              drivetrain: foundVehicle.specifications?.drivetrain || "Not specified",
              fuelType: foundVehicle.fuelType || "Not specified", // Now pulled from top-level and included here
              mileage: foundVehicle.mileage || "Not specified", // Now pulled from top-level and included here
            },
            amenities: foundVehicle.amenities || foundVehicle.features || [],
            reviewsData: foundVehicle.reviewsData || [],
          }
          setVehicle(processedVehicle)
        }
      } catch (err) {
        console.error("Failed to fetch vehicle", err)
      }
    }
    fetchVehicle()
  }, [id])

  useEffect(() => {
    if (showBookingForm) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }
    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [showBookingForm])

  const getCloudinaryUrl = (publicId, options = {}) => {
    if (!publicId) return "/placeholder.svg?height=400&width=600&text=No+Image"
    const { width = 800, height = 600, quality = "auto", format = "auto", crop = "fill", gravity = "center" } = options
    return `${cloudinaryBase}/w_${width},h_${height},c_${crop},g_${gravity},q_${quality},f_${format}/${publicId}`
  }

  const getThumbnailUrl = (publicId) => {
    return getCloudinaryUrl(publicId, {
      width: 200,
      height: 150,
      quality: "auto",
      format: "auto",
    })
  }

  const getMainImageUrl = (publicId) => {
    return getCloudinaryUrl(publicId, {
      width: 1200,
      height: 800,
      quality: "auto",
      format: "auto",
    })
  }

  const handleImageLoad = (index) => {
    setImageLoading((prev) => ({
      ...prev,
      [index]: false,
    }))
  }

  const handleImageLoadStart = (index) => {
    setImageLoading((prev) => ({
      ...prev,
      [index]: true,
    }))
  }

  if (!vehicle) {
    return (
      <div className="vehicle-details-page">
        <div className="container">
          <div className="error-message">
            <h2>Vehicle not found</h2>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Vehicles
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="vehicle-details-page">
      <div className="container">
        {/* Back Button */}
        <div className="back-navigation">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
            Back to Vehicles
          </button>
        </div>

        {/* Vehicle Header */}
        <div className="vehicle-header">
          <div className="vehicle-title-section">
            <h1 className="vehicle-title">{vehicle.name}</h1>
            <div className="vehicle-meta">
              <div className="vehicle-rating-large">
                <Star size={20} fill="currentColor" />
                <span className="rating-value">{vehicle.rating || "4.5"}</span>
                <span className="rating-count">({vehicle.reviews || "20"} reviews)</span>
              </div>
              <div className="vehicle-category-badge">{vehicle.category}</div>
            </div>
          </div>
          <div className="vehicle-price-section">
            <div className="price-display">
              <span className="price-amount">${vehicle.price}</span>
              <span className="price-period">/day</span>
            </div>
            <button
              className={`btn btn-large ${vehicle.is_available ? "btn-primary" : "btn-disabled"}`}
              disabled={!vehicle.is_available}
              onClick={() => vehicle.is_available && setShowBookingForm(true)}
            >
              {vehicle.is_available ? "Book Now" : "Booked"}
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <div className="image-container">
              {imageLoading[selectedImageIndex] && (
                <div className="image-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}
              <img
                src={getMainImageUrl(vehicle.gallery?.[selectedImageIndex]) || "/placeholder.svg"}
                alt={vehicle.name}
                onLoadStart={() => handleImageLoadStart(selectedImageIndex)}
                onLoad={() => handleImageLoad(selectedImageIndex)}
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=600&width=800&text=Image+Not+Found"
                  handleImageLoad(selectedImageIndex)
                }}
                style={{
                  opacity: imageLoading[selectedImageIndex] ? 0.5 : 1,
                  transition: "opacity 0.3s ease",
                }}
              />
            </div>
          </div>
          {vehicle.gallery && vehicle.gallery.length > 1 && (
            <div className="thumbnail-gallery">
              {vehicle.gallery.map((imageId, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="thumbnail-container">
                    {imageLoading[`thumb-${index}`] && (
                      <div className="thumbnail-loading">
                        <div className="loading-spinner-small"></div>
                      </div>
                    )}
                    <img
                      src={getThumbnailUrl(imageId) || "/placeholder.svg"}
                      alt={`${vehicle.name} ${index + 1}`}
                      onLoadStart={() => handleImageLoadStart(`thumb-${index}`)}
                      onLoad={() => handleImageLoad(`thumb-${index}`)}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=150&width=200&text=No+Image"
                        handleImageLoad(`thumb-${index}`)
                      }}
                      style={{
                        opacity: imageLoading[`thumb-${index}`] ? 0.5 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlight Banner */}
        <div className="highlight-banner">
          <h2>Why Rent This Vehicle?</h2>
          <p>
            Whether you're planning a road trip, attending a luxury event, or simply exploring the city in style, this
            vehicle delivers unmatched performance and comfort.
          </p>
        </div>

        {/* Content Tabs */}
        <div className="content-tabs">
          <div className="tab-navigation">
            {["overview", "specifications", "amenities", "reviews"].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="tab-panel">
                <div className="overview-content">
                  <div className="description-section">
                    <h3>Description</h3>
                    <p className="long-description">{vehicle.longDescription}</p>
                  </div>
                  <div className="features-section">
                    <h3>Key Features</h3>
                    <div className="features-grid">
                      {vehicle.features?.map((feature, index) => (
                        <div key={index} className="feature-item-large">
                          <CheckCircle size={16} className="feature-check" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="quick-specs">
                    <h3>Quick Specifications</h3>
                    <div className="quick-specs-grid">
                      <div className="spec-item">
                        <Settings className="spec-icon" size={24} />
                        <div className="spec-info">
                          <div className="spec-label">Engine</div>
                          <div className="spec-value">{vehicle.specifications?.engine || "N/A"}</div>
                        </div>
                      </div>
                      <div className="spec-item">
                        <Fuel className="spec-icon" size={24} />
                        <div className="spec-info">
                          <div className="spec-label">Fuel Type</div>
                          <div className="spec-value">{vehicle.specifications?.fuelType || "N/A"}</div>
                        </div>
                      </div>
                      <div className="spec-item">
                        <Users className="spec-icon" size={24} />
                        <div className="spec-info">
                          <div className="spec-label">Seats</div>
                          <div className="spec-value">{vehicle.specifications?.seating || "N/A"}</div>
                        </div>
                      </div>
                      <div className="spec-item">
                        <Gauge className="spec-icon" size={24} /> {/* New icon for Mileage */}
                        <div className="spec-info">
                          <div className="spec-label">Mileage</div>
                          <div className="spec-value">{vehicle.specifications?.mileage || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "specifications" && (
              <div className="tab-panel">
                <div className="specifications-content">
                  <h3>Technical Specifications</h3>
                  <div className="specs-table">
                    {vehicle.specifications &&
                      Object.entries(vehicle.specifications).map(([key, value]) => (
                        <div key={key} className="spec-row">
                          <div className="spec-key">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div className="spec-value">{value}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "amenities" && (
              <div className="tab-panel">
                <div className="amenities-content">
                  <h3>Included Amenities</h3>
                  <div className="amenities-grid">
                    {vehicle.amenities?.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <CheckCircle size={16} className="amenity-check" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="tab-panel">
                <div className="reviews-content">
                  <div className="reviews-header">
                    <h3>Customer Reviews</h3>
                    <div className="reviews-summary">
                      <div className="rating-summary">
                        <Star size={24} fill="currentColor" />
                        <span className="rating-large">{vehicle.rating}</span>
                        <span className="rating-text">out of 5</span>
                      </div>
                      <div className="reviews-count">{vehicle.reviews || 0} total reviews</div>
                    </div>
                  </div>
                  <div className="reviews-list">
                    {vehicle.reviewsData?.length > 0 ? (
                      vehicle.reviewsData.map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-name">{review.name}</div>
                              <div className="review-date">{new Date(review.date).toLocaleDateString()}</div>
                            </div>
                            <div className="review-rating">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" />
                              ))}
                            </div>
                          </div>
                          <div className="review-comment">{review.comment}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-reviews">
                        <p>No reviews yet. Be the first to review this vehicle!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Section */}
        <div className="booking-section">
          <div className="booking-card">
            <h3>Ready to Book?</h3>
            <p>Experience this amazing vehicle for yourself. Book now and start your adventure!</p>
            <div className="booking-actions">
              <button
                className={`btn btn-large ${vehicle.is_available ? "btn-primary" : "btn-disabled"}`}
                disabled={!vehicle.is_available}
                onClick={() => vehicle.is_available && setShowBookingForm(true)}
              >
                {vehicle.is_available ? "Book This Vehicle" : "Currently Booked"}
              </button>
              <button className="btn btn-outline">Add to Favorites</button>
            </div>
          </div>
        </div>
      </div>
      {/* Booking Form Modal (conditionally rendered) */}
      {showBookingForm && <BookingForm vehicle={vehicle} onClose={() => setShowBookingForm(false)} />}
    </div>
  )
}
