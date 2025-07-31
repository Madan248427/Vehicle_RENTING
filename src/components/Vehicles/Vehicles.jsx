"use client"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { Car, Star } from "lucide-react"
import { Link } from "react-router-dom"
import styles from "../vehicles/Vehicle.module.css";


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
    { id: "low", label: "Under RS150" },
    { id: "medium", label: "RS150 - RS250" },
    { id: "high", label: "Above RS250" },
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
    <div className={styles.vehiclesPage}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Our Premium Fleet</h1>
          <p className={styles.pageDescription}>
            Discover our premium vehicle collection. Each car is carefully selected and maintained to the highest
            standards.
          </p>
        </div>

        <div className={styles.vehiclesLayout}>
          {/* Sidebar Filters */}
          <div className={styles.filtersSidebar}>
            <h3 className={styles.filtersTitle}>Filters</h3>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category</label>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`${styles.filterOption} ${selectedCategory === cat.id ? styles.active : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.label}</span>
                  <span className={styles.filterCount}>{cat.count}</span>
                </div>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Price</label>
              {priceRanges.map((price) => (
                <div
                  key={price.id}
                  className={`${styles.filterOption} ${priceFilter === price.id ? styles.active : ""}`}
                  onClick={() => setPriceFilter(price.id)}
                >
                  <span>{price.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle List */}
          <div className={styles.vehiclesContent}>
            <div className={styles.vehiclesHeader}>
              <div className={styles.resultsCount}>
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
              </div>
            </div>

            {filteredVehicles.length > 0 ? (
              <div className={styles.vehiclesGrid}>
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className={styles.vehicleCard} onClick={() => handleVehicleClick(vehicle.id)}>
                    <div className={styles.vehicleImage}>
                      <img
                        src={getCloudinaryImageUrl(vehicle.imageId) || "/placeholder.svg"}
                        alt={vehicle.name}
                        className={styles.vehicleImg}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=300&text=No+Image"
                        }}
                      />
                      <div className={styles.vehicleBadge}>{vehicle.category}</div>
                      <div className={styles.vehicleRating}>
                        <Star size={12} fill="currentColor" />
                        <span>{vehicle.rating || "4.5"}</span>
                        <span>({vehicle.reviews || "20"})</span>
                      </div>
                    </div>

                    <div className={styles.vehicleInfo}>
                      <h3 className={styles.vehicleName}>{vehicle.name}</h3>

                      <div className={styles.vehicleFeatures}>
                        {vehicle.features?.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className={styles.featureItem}>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className={styles.vehicleFooter}>
                        <div className={styles.vehiclePrice}>
                          <span className={styles.priceAmount}>RS{vehicle.price}</span>
                          <span className={styles.pricePeriod}>/day</span>
                        </div>

                        <Link to={`/vechical_details/${vehicle.id}`}>
                          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={(e) => e.stopPropagation()}>
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
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
