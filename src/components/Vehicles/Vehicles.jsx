"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { Car, Star } from "lucide-react"
import { Link } from "react-router-dom"
import "./vehicles.css" // Corrected import path

export default function Vehicles({ handleVehicleClick }) {
  const [vehicles, setVehicles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const cloudinaryBase = "https://res.cloudinary.com/duortzwqq/image/upload"

  // Helper function to construct Cloudinary URLs
  const getCloudinaryImageUrl = (publicId, options = {}) => {
    if (!publicId) return "/placeholder.svg?height=200&width=300&text=No+Image"
    const { width = 300, height = 200, quality = "auto", format = "auto", crop = "fill", gravity = "center" } = options
    return `${cloudinaryBase}/w_${width},h_${height},c_${crop},g_${gravity},q_${quality},f_${format}/${publicId}`
  }

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles"))
        const vehicleList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setVehicles(vehicleList)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      }
    }
    fetchVehicles()
  }, [])

  // Categories and their counts are dynamically calculated based on the fetched vehicles
  const categories = [
    { id: "all", label: "All Vehicles", count: vehicles.length },
    {
      id: "luxury",
      label: "Luxury",
      count: vehicles.filter((v) => v.category?.toLowerCase() === "luxury").length,
    },
    {
      id: "sports",
      label: "Sports",
      count: vehicles.filter((v) => v.category?.toLowerCase() === "sports").length,
    },
    {
      id: "suv",
      label: "SUV",
      count: vehicles.filter((v) => v.category?.toLowerCase() === "suv").length,
    },
    {
      id: "truck",
      label: "Truck",
      count: vehicles.filter((v) => v.category?.toLowerCase() === "truck").length,
    },
    {
      id: "electric",
      label: "Electric",
      count: vehicles.filter((v) => v.category?.toLowerCase() === "electric").length,
    },
  ]

  const priceRanges = [
    { id: "all", label: "All Prices" },
    { id: "low", label: "Under $150" },
    { id: "medium", label: "$150 - $250" },
    { id: "high", label: "Above $250" },
  ]

  // Filtering logic based on selected category and price range
  const filteredVehicles = vehicles.filter((vehicle) => {
    const categoryMatch = selectedCategory === "all" || vehicle.category?.toLowerCase() === selectedCategory
    const priceMatch =
      priceFilter === "all" ||
      (priceFilter === "low" && vehicle.price < 150) ||
      (priceFilter === "medium" && vehicle.price >= 150 && vehicle.price < 250) ||
      (priceFilter === "high" && vehicle.price >= 250)
    return categoryMatch && priceMatch
  })

  return (
    <div className="vehicles-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Our Premium Fleet</h1>
          <p className="page-description">
            Discover our premium vehicle collection. Each car is carefully selected and maintained to the highest
            standards.
          </p>
        </div>
        <div className="vehicles-layout">
          {/* Sidebar Filters */}
          <div className="filters-sidebar">
            <h3 className="filters-title">Filters</h3>
            <div className="filter-group">
              <label className="filter-label">Category</label>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`filter-option ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.label}</span>
                  <span className="filter-count">{cat.count}</span>
                </div>
              ))}
            </div>
            <div className="filter-group">
              <label className="filter-label">Price</label>
              {priceRanges.map((price) => (
                <div
                  key={price.id}
                  className={`filter-option ${priceFilter === price.id ? "active" : ""}`}
                  onClick={() => setPriceFilter(price.id)}
                >
                  <span>{price.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Vehicle List */}
          <div className="vehicles-content">
            <div className="vehicles-header">
              <div className="results-count">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
              </div>
            </div>
            {filteredVehicles.length > 0 ? (
              <div className="vehicles-grid">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="vehicle-card" onClick={() => handleVehicleClick(vehicle.id)}>
                    <div className="vehicle-image">
                      <img
                        src={getCloudinaryImageUrl(vehicle.imageId) || "/placeholder.svg"} // Using helper function
                        alt={vehicle.name}
                        className="vehicle-img"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=300&text=No+Image"
                        }}
                      />
                      <div className="vehicle-badge">{vehicle.category}</div>
                      <div className="vehicle-rating">
                        <Star size={12} fill="currentColor" />
                        <span>{vehicle.rating || "4.5"}</span>
                        <span>({vehicle.reviews || "20"})</span>
                      </div>
                    </div>
                    <div className="vehicle-info">
                      <h3 className="vehicle-name">{vehicle.name}</h3>
                      {/* Removed description paragraph */}
                      <div className="vehicle-features">
                        {vehicle.features?.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="feature-item">
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="vehicle-footer">
                        <div className="vehicle-price">
                          <span className="price-amount">${vehicle.price}</span>
                          <span className="price-period">/day</span>
                        </div>
                        {/* ✅ Wrapped with Link */}
                        <Link to={`/vechical_details/${vehicle.id}`}>
                          <button className="btn btn-primary" onClick={(e) => e.stopPropagation()}>
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <Car size={64} />
                <h3>No vehicles found</h3>
                <p>Try changing filters to see more vehicles.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
