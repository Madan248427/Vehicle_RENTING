"use client"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, CheckCircle, Settings, Fuel, Users, Gauge } from "lucide-react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase"
import BookingForm from "../Booking/BookingForm"
import "./vehicle-details.module.css"

const cloudinaryBase = "https://res.cloudinary.com/duortzwqq/image/upload"

export default function VehicleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [imageLoading, setImageLoading] = useState({})
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true)

  // State for ratings - only for displaying existing ratings
  const [currentVehicleRatings, setCurrentVehicleRatings] = useState([])

  // Function to fetch a single vehicle's data
  const fetchVehicle = async (vehicleId) => {
    console.log(`[VehicleDetails] Fetching vehicle with ID: ${vehicleId}`)
    setIsLoadingVehicle(true)
    try {
      const vehicleRef = doc(db, "vehicles", vehicleId)
      const vehicleSnap = await getDoc(vehicleRef, { source: "server" })
      if (vehicleSnap.exists()) {
        const foundVehicle = { id: vehicleSnap.id, ...vehicleSnap.data() }
        console.log("[VehicleDetails] Raw vehicle data from Firebase:", foundVehicle)
        const processedVehicle = {
          ...foundVehicle,
          is_available: foundVehicle.isAvailable !== undefined ? foundVehicle.isAvailable : foundVehicle.is_available,
          gallery: foundVehicle.imageId ? [foundVehicle.imageId] : foundVehicle.gallery || [],
          longDescription: foundVehicle.longDescription || foundVehicle.description || "No description available",
          specifications: {
            engine: foundVehicle.specifications?.engine || "Not specified",
            power: foundVehicle.specifications?.power || "Not specified",
            seating: foundVehicle.specifications?.seating || "Not specified",
            drivetrain: foundVehicle.specifications?.drivetrain || "Not specified",
            fuelType: foundVehicle.fuelType || foundVehicle.specifications?.fuelType || "Not specified",
            mileage: foundVehicle.mileage || foundVehicle.specifications?.mileage || "Not specified",
          },
          amenities: foundVehicle.amenities || foundVehicle.features || [],
        }
        setVehicle(processedVehicle)
        console.log("[VehicleDetails] Processed vehicle state set:", processedVehicle)
        console.log(
          `[VehicleDetails] Button status should be: ${processedVehicle.is_available ? "Book Now" : "Booked"}`,
        )
      } else {
        console.log(`[VehicleDetails] Vehicle with ID ${vehicleId} not found.`)
        setVehicle(null)
      }
    } catch (err) {
      console.error("[VehicleDetails] Failed to fetch vehicle:", err)
      setVehicle(null)
    } finally {
      setIsLoadingVehicle(false)
      console.log("[VehicleDetails] Finished fetching vehicle.")
    }
  }

  // Function to fetch ratings for the current vehicle
  const fetchVehicleRatings = async (idToFetch) => {
    if (!idToFetch) return
    try {
      const ratingsCollectionRef = collection(db, "ratings")
      const q = query(ratingsCollectionRef, where("vehicleId", "==", idToFetch))
      const querySnapshot = await getDocs(q)
      const fetchedRatings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
      }))
      fetchedRatings.sort((a, b) => b.createdAt - a.createdAt)
      setCurrentVehicleRatings(fetchedRatings)

      // Calculate average rating and update vehicle state
      if (fetchedRatings.length > 0) {
        const totalRating = fetchedRatings.reduce((sum, r) => sum + r.rating, 0)
        const avg = (totalRating / fetchedRatings.length).toFixed(1)
        setVehicle((prev) => ({
          ...prev,
          rating: avg,
          reviews: fetchedRatings.length,
        }))
      } else {
        setVehicle((prev) => ({
          ...prev,
          rating: "N/A",
          reviews: 0,
        }))
      }
    } catch (err) {
      console.error("Error fetching vehicle ratings:", err)
    }
  }

  useEffect(() => {
    if (id) {
      fetchVehicle(id)
      fetchVehicleRatings(id) // Fetch ratings when component loads
    }
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

  const handleCloseBookingForm = (bookedSuccessfully) => {
    console.log(`[VehicleDetails] handleCloseBookingForm called. Booked successfully: ${bookedSuccessfully}`)
    setShowBookingForm(false)
    if (bookedSuccessfully) {
      console.log("[VehicleDetails] Booking successful, re-fetching vehicle data...")
      fetchVehicle(id)
    }
  }

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

  if (isLoadingVehicle) {
    return (
      <div className="vehicle-details-page">
        <div className="container">
          <div className="loading-message">
            <h2>Loading vehicle details...</h2>
          </div>
        </div>
      </div>
    )
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
                <span className="rating-count">({vehicle.reviews || "0"} reviews)</span>
              </div>
              <div className="vehicle-category-badge">{vehicle.category}</div>
            </div>
          </div>
          <div className="vehicle-price-section">
            <div className="price-display">
              <span className="price-amount">RS{vehicle.price}</span>
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
                        <Gauge className="spec-icon" size={24} />
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
                        <span className="rating-large">{vehicle.rating || "N/A"}</span>
                        <span className="rating-text">out of 5</span>
                      </div>
                      <div className="reviews-count">{vehicle.reviews || 0} total reviews</div>
                    </div>
                  </div>

                  {/* Reviews List Only - No Submission Form */}
                  <div className="reviews-list">
                    {currentVehicleRatings.length > 0 ? (
                      currentVehicleRatings.map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info-with-avatar">
                              <img
                                src={review.userImageUrl || "/default-avatar.png"}
                                alt="User Avatar"
                                className="reviewer-avatar"
                                onError={(e) => {
                                  e.target.src = "/default-avatar.png"
                                }}
                              />
                              <div className="reviewer-text-info">
                                <div className="reviewer-email">{review.userEmail}</div>
                                <div className="review-date">
                                  {review.createdAt ? review.createdAt.toLocaleDateString() : "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="review-rating">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={16} className={`star-icon ${i < review.rating ? "filled" : ""}`} />
                              ))}
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
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

      {/* Booking Form Modal */}
      {showBookingForm && <BookingForm vehicle={vehicle} onClose={handleCloseBookingForm} />}
    </div>
  )
}
