"use client"

import { useState, useEffect } from "react"
import { Car, Truck, Star, Key, ShieldCheck, Map, Headset } from "lucide-react" 
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase" 
import "./home-page.css"
import { Link } from "react-router-dom"



const cloudinaryBase = "https://res.cloudinary.com/duortzwqq/image/upload"

export default function Home({ handleVehicleClick, setCurrentPage }) {
  const [selectedVehicleType, setSelectedVehicleType] = useState("car")
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "vehicles"))
        const fetchedVehicles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setVehicles(fetchedVehicles)
      } catch (err) {
        console.error("Failed to fetch vehicles:", err)
        setError("Failed to load vehicles. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchVehicles()
  }, [])

  const vehicleTypes = [
    { id: "car", name: "Car", icon: Car, description: "Perfect for city driving and daily commutes" },
    { id: "van", name: "Van", icon: Truck, description: "Great for group travel and family trips" },
    { id: "suv", name: "SUV", icon: Car, description: "Ideal for family adventures and off-road" },
    { id: "truck", name: "Truck", icon: Truck, description: "For heavy-duty needs and work applications" },
  ]

  const services = [
    {
      icon: Key,
      title: "Flexible Rental Options",
      description: "Tailor your rental period from hourly to long-term, with easy extensions and modifications.",
    },
    {
      icon: ShieldCheck,
      title: "Comprehensive Insurance",
      description: "Drive with peace of mind. Our packages include robust insurance coverage for all scenarios.",
    },
    {
      icon: Map,
      title: "Nationwide Coverage",
      description: "Pick up and drop off vehicles at convenient locations across the country.",
    },
    {
      icon: Headset,
      title: "24/7 Customer Support",
      description: "Our dedicated team is always available to assist you, day or night.",
    },
  ]

  const getCloudinaryImageUrl = (publicId, options = {}) => {
    if (!publicId) return "/placeholder.svg?height=200&width=300&text=No+Image"
    const { width = 300, height = 200, quality = "auto", format = "auto", crop = "fill", gravity = "center" } = options
    return `${cloudinaryBase}/w_${width},h_${height},c_${crop},g_${gravity},q_${quality},f_${format}/${publicId}`
  }

  if (loading) {
    return (
      <div className="home-page loading-state">
        <div className="loading-spinner"></div>
        <p>Loading vehicles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-page error-state">
        <p className="error-message">{error}</p>
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">Plan your trip now</div>
              <h1 className="hero-title">
                Explore the world with <span className="hero-title-accent">comfortable car</span>
              </h1>
              <p className="hero-description">
                Discover the freedom of the road with our premium fleet of vehicles. From luxury sedans to rugged SUVs,
                we have the perfect car for every journey. Experience comfort, reliability, and style with Motovia.
              </p>
              <div className="hero-actions">
                <Link to="/vehicles" className={`nav-link ${location.pathname.startsWith("/vehicles") ? "active" : ""}`}></Link>
                <button className="btn btn-primary" >
                  Choose a Car
                </button>
                <Link/>
                <button className="btn btn-secondary">Get the App</button>
              </div>
            </div>
            <div className="hero-image">
              <img
                src="Mercedes_Benz_Car.jpg"
                alt="Mercedes-Benz Car"
                className="hero-car"
              />
            </div>
          </div>
        </div>
        <div className="hero-dots">
          <div className="dots-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="dot"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section className="vehicles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Premium Fleet</h2>
            <p className="section-description">
              Choose from our carefully curated selection of premium vehicles. Each car is meticulously maintained and
              equipped with the latest features to ensure your journey is comfortable, safe, and memorable.
            </p>
          </div>
          <div className="vehicles-grid">
            {vehicles.slice(0, 3).map((vehicle) => (
              <div key={vehicle.id} className="vehicle-card" onClick={() => handleVehicleClick(vehicle.id)}>
                <div className="vehicle-image">
                  <img src={getCloudinaryImageUrl(vehicle.imageId) || "/placeholder.svg"} alt={vehicle.name} />
                  <div className="vehicle-badge">{vehicle.category}</div>
                  <div className="vehicle-rating">
                    <Star size={12} fill="currentColor" />
                    <span>{vehicle.rating || "4.5"}</span>
                    <span>({vehicle.reviews || "20"})</span>
                  </div>
                </div>
                <div className="vehicle-info">
                  <h3 className="vehicle-name">{vehicle.name}</h3>
                  <p className="vehicle-description">{vehicle.description}</p>
                  <div className="vehicle-features">
                    {vehicle.features?.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="feature-item">
                        <div className="feature-dot"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="vehicle-footer">
                    <div className="vehicle-price">Rs {vehicle.price}/day</div>
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
          <div className="text-center">
            <Link to="/vehicles" className={`nav-link ${location.pathname.startsWith("/vehicles") ? "active" : ""}`}>
            <button className="btn btn-outline" onClick={() => setCurrentPage("vehicles")}>
              View All Vehicles
            </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section className="vehicle-types-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Vehicle Type</h2>
            <p className="section-description">
              We offer a diverse range of vehicles to suit every need and preference. Whether you're planning a business
              trip, family vacation, or adventure getaway, we have the perfect vehicle waiting for you.
            </p>
          </div>
          <div className="vehicle-types-grid">
            {vehicleTypes.map((type) => {
              const IconComponent = type.icon
              return (
                <div
                  key={type.id}
                  className={`vehicle-type-card ${selectedVehicleType === type.id ? "active" : ""}`}
                  onClick={() => setSelectedVehicleType(type.id)}
                >
                  <IconComponent className="type-icon" size={48} />
                  <h3 className="type-name">{type.name}</h3>
                  <p className="type-description">{type.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Commitment to Excellence</h2>
            <p className="section-description">
              With over six years of dedicated experience in the vehicle rental industry, we've refined our services to
              ensure every client enjoys a seamless, reliable, and premium experience. Our commitment extends beyond
              just providing vehicles; we deliver comprehensive solutions tailored to your journey.
            </p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => {
              const ServiceIcon = service.icon
              return (
                <div key={index} className="service-card">
                  <ServiceIcon className="service-icon" size={48} />
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
