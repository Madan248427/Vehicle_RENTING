"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import {
  Car,
  Plus,
  MapPin,

  Users,
  Fuel,
  Loader2,
  AlertCircle,
  Eye,
  X,
  Edit,
  Search,
  Trash2,
  Calendar,
} from "lucide-react"
import Sidebar from "../Sidebar/sidebar-dashboard"
import "./VehicleManagement.css"

export default function VehicleManagement() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [editFormData, setEditFormData] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function fetchVehicles() {
      if (!isLoaded || !isSignedIn) return

      try {
        setLoading(true)
        setError(null)
        const q = query(collection(db, "vehicles"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const vehiclesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setVehicles(vehiclesData)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        setError("Failed to load vehicles. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [isLoaded, isSignedIn, user])

  const filteredAndSortedVehicles = vehicles
    .filter((vehicle) => {
      const matchesSearch =
        searchTerm === "" ||
        vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case "name":
          aValue = (a.name || "").toLowerCase()
          bValue = (b.name || "").toLowerCase()
          break
        case "price":
          aValue = Number.parseFloat(a.price) || 0
          bValue = Number.parseFloat(b.price) || 0
          break
        case "status":
          aValue = a.isAvailable ? "available" : "rented"
          bValue = b.isAvailable ? "available" : "rented"
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

  const calculateStats = () => {
    const total = vehicles.length
    const available = vehicles.filter((v) => v.isAvailable).length
    const rented = vehicles.filter((v) => !v.isAvailable).length
    const totalValue = vehicles.reduce((sum, v) => sum + (Number.parseFloat(v.price) || 0), 0)
    return { total, available, rented, totalValue }
  }

  const handleAddVehicle = () => {
    window.location.href = "/admin/addvehicle"
  }

  const handleEditVehicle = (vehicleId) => {
    window.location.href = `/admin/editvehicle/${vehicleId}`
  }

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowDetailModal(true)
  }

  const handleBookVehicle = (vehicleId) => {
    window.location.href = `/admin/booking/vehicleId/${vehicleId}`
  }

  const handleDeleteVehicle = async (vehicleId, vehicleName) => {
    if (!confirm(`Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "vehicles", vehicleId))
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
      alert("Vehicle deleted successfully!")
      if (selectedVehicle && selectedVehicle.id === vehicleId) {
        setShowDetailModal(false)
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      alert("Failed to delete vehicle. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (vehicle) => {
    setEditFormData({
      name: vehicle.name || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      category: vehicle.category || "",
      price: vehicle.price || "",
      fuelType: vehicle.fuelType || "",
      mileage: vehicle.mileage || "",
      seats: getSeatsValue(vehicle),
      engine: vehicle.specifications?.engine || vehicle.engine || "",
      power: vehicle.specifications?.power || vehicle.power || "",
      drivetrain: vehicle.specifications?.drivetrain || vehicle.drivetrain || "",
      description: vehicle.description || "",
      features: vehicle.features ? vehicle.features.join(", ") : "",
      location: vehicle.location || "",
      isAvailable: vehicle.isAvailable,
    })
    setSelectedVehicle(vehicle)
    setShowEditModal(true)
  }

  const handleUpdateVehicle = async (e) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const updateData = {
        name: editFormData.name,
        brand: editFormData.brand,
        model: editFormData.model,
        category: editFormData.category,
        price: Number.parseFloat(editFormData.price) || 0,
        fuelType: editFormData.fuelType,
        mileage: editFormData.mileage,
        seats: editFormData.seats,
        specifications: {
          engine: editFormData.engine,
          power: editFormData.power,
          drivetrain: editFormData.drivetrain,
          seating: editFormData.seats,
        },
        description: editFormData.description,
        features: editFormData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
        location: editFormData.location,
        isAvailable: editFormData.isAvailable,
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "vehicles", selectedVehicle.id), updateData)
      setVehicles((prev) => prev.map((v) => (v.id === selectedVehicle.id ? { ...v, ...updateData } : v)))
      setShowEditModal(false)
      alert("Vehicle updated successfully!")
    } catch (error) {
      console.error("Error updating vehicle:", error)
      alert("Failed to update vehicle. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const getSeatsValue = (vehicle) => {
    return vehicle.seats || vehicle.seating || vehicle.specifications?.seating || "N/A"
  }

  if (!isLoaded) {
    return (
      <>
        <Sidebar />
        <div className="vehicle-container">
          <div className="vehicle-loading">
            <Loader2 size={32} className="loading-spinner" />
            <span>Loading user...</span>
          </div>
        </div>
      </>
    )
  }

  if (!isSignedIn) {
    return (
      <>
        <Sidebar />
        <div className="vehicle-container">
          <div className="vehicle-error">
            <Car className="error-icon" />
            <h2>Authentication Required</h2>
            <p>You must be signed in to view vehicles.</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="vehicle-container">
          <div className="vehicle-loading">
            <Loader2 size={32} className="loading-spinner" />
            <span>Loading vehicles...</span>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="vehicle-container">
          <div className="vehicle-error">
            <AlertCircle className="error-icon" />
            <h2>Error Loading Vehicles</h2>
            <p>{error}</p>
          </div>
        </div>
      </>
    )
  }

  const stats = calculateStats()

  return (
    <>
      <Sidebar />
      <div className="vehicle-management-page">
        <div className="vehicle-container">
          <div className="vehicle-header">
            <div className="header-content">
              <h1>Vehicle Management</h1>
              <p>Manage your vehicle fleet</p>
            </div>
            <button className="add-vehicle-btn" onClick={handleAddVehicle}>
              <Plus size={20} />
              Add Vehicle
            </button>
          </div>

          <div className="vehicle-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Vehicles</div>
            </div>
            <div className="stat-card available">
              <div className="stat-number">{stats.available}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-card rented">
              <div className="stat-number">{stats.rented}</div>
              <div className="stat-label">Rented</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">RS {stats.totalValue.toFixed(0)}</div>
              <div className="stat-label">Fleet Value</div>
            </div>
          </div>

          <div className="filters-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="status">Sort by Status</option>
              </select>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {filteredAndSortedVehicles.length === 0 ? (
            <div className="no-vehicles">
              <Car className="no-vehicles-icon" />
              <h2>No Vehicles Found</h2>
              <p>
                {vehicles.length === 0
                  ? "Start building your fleet by adding your first vehicle."
                  : "No vehicles match your current search."}
              </p>
            </div>
          ) : (
            <div className="vehicles-list">
              {filteredAndSortedVehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-image">
                    <img
                      src={
                        vehicle.imageId
                          ? `https://res.cloudinary.com/duortzwqq/image/upload/${vehicle.imageId}`
                          : vehicle.imageUrl || "/placeholder.svg?height=60&width=80"
                      }
                      alt={vehicle.name}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=60&width=80"
                      }}
                    />
                  </div>
                  <div className="vehicle-info">
                    <div className="vehicle-name">{vehicle.name || "Unknown Vehicle"}</div>
                    <div className="vehicle-category">{vehicle.category || "N/A"}</div>
                  </div>
                  <div className="vehicle-details">
                    <div className="detail-item">
                      <Users size={14} />
                      <span>{getSeatsValue(vehicle)} seats</span>
                    </div>
                    <div className="detail-item">
                      <Fuel size={14} />
                      <span>{vehicle.fuelType || "N/A"}</span>
                    </div>
                  </div>
                  <div className="vehicle-location">
                    <MapPin size={14} />
                    <span>{vehicle.location || vehicle.brand || "N/A"}</span>
                  </div>
                  <div className="vehicle-price">
                    {/* <DollarSign size={16} /> */}
                    <span><strong>RS </strong> {vehicle.price || "0"}/day</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="action-btn view" onClick={() => handleViewDetails(vehicle)}>
                      <Eye size={16} />
                    </button>
                    <button className="action-btn edit" onClick={() => handleEditClick(vehicle)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteVehicle(vehicle.id, vehicle.name)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="action-btn book"
                      onClick={() => handleBookVehicle(vehicle.id)}
                      disabled={!vehicle.isAvailable}
                      title={vehicle.isAvailable ? "Book this vehicle" : "Vehicle not available"}
                    >
                      <Calendar size={16} />
                    </button>
                  </div>
                  <div className={`vehicle-status ${vehicle.isAvailable ? "available" : "rented"}`}>
                    {vehicle.isAvailable ? "Available" : "Rented"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vehicle Detail Modal */}
          {showDetailModal && selectedVehicle && (
            <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Vehicle Details</h3>
                  <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="vehicle-image-large">
                    <img
                      src={
                        selectedVehicle.imageId
                          ? `https://res.cloudinary.com/duortzwqq/image/upload/${selectedVehicle.imageId}`
                          : selectedVehicle.imageUrl || "/placeholder.svg?height=200&width=300"
                      }
                      alt={selectedVehicle.name}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                  </div>
                  <div className="detail-section">
                    <h4>Basic Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Name:</label>
                        <span>{selectedVehicle.name || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Brand:</label>
                        <span>{selectedVehicle.brand || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Model:</label>
                        <span>{selectedVehicle.model || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Category:</label>
                        <span>{selectedVehicle.category || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Price per Day:</label>
                        <span>${selectedVehicle.price || "0"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span className={`status-text ${selectedVehicle.isAvailable ? "available" : "rented"}`}>
                          {selectedVehicle.isAvailable ? "Available" : "Rented"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4>Specifications</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Seats:</label>
                        <span>{getSeatsValue(selectedVehicle)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Fuel Type:</label>
                        <span>{selectedVehicle.fuelType || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Mileage:</label>
                        <span>{selectedVehicle.mileage || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Engine:</label>
                        <span>{selectedVehicle.specifications?.engine || selectedVehicle.engine || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Power:</label>
                        <span>{selectedVehicle.specifications?.power || selectedVehicle.power || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Drivetrain:</label>
                        <span>{selectedVehicle.specifications?.drivetrain || selectedVehicle.drivetrain || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                    <div className="detail-section">
                      <h4>Features</h4>
                      <div className="features-list">
                        {selectedVehicle.features.map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedVehicle.description && (
                    <div className="detail-section">
                      <h4>Description</h4>
                      <p className="description-text">{selectedVehicle.description}</p>
                    </div>
                  )}
                  {selectedVehicle.videoId && (
                    <div className="detail-section">
                      <h4>Video</h4>
                      <div className="video-container">
                        <video
                          controls
                          className="vehicle-video"
                          src={`https://res.cloudinary.com/duortzwqq/video/upload/${selectedVehicle.videoId}`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    className="modal-btn danger"
                    onClick={() => handleDeleteVehicle(selectedVehicle.id, selectedVehicle.name)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Vehicle"}
                  </button>
                  <button className="modal-btn secondary" onClick={() => setShowDetailModal(false)}>
                    Close
                  </button>
                  <button className="modal-btn primary" onClick={() => handleEditClick(selectedVehicle)}>
                    Edit Vehicle
                  </button>
                  <button
                    className="modal-btn success"
                    onClick={() => handleBookVehicle(selectedVehicle.id)}
                    disabled={!selectedVehicle.isAvailable}
                  >
                    {selectedVehicle.isAvailable ? "Book Vehicle" : "Not Available"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Vehicle Modal */}
          {showEditModal && selectedVehicle && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
              <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Edit Vehicle</h3>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleUpdateVehicle} className="edit-form">
                  <div className="modal-body">
                    <div className="form-section">
                      <h4>Basic Information</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Vehicle Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Brand *</label>
                          <input
                            type="text"
                            name="brand"
                            value={editFormData.brand}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Model</label>
                          <input type="text" name="model" value={editFormData.model} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                          <label>Category *</label>
                          <select name="category" value={editFormData.category} onChange={handleInputChange} required>
                            <option value="">Select Category</option>
                            <option value="sedan">Sedan</option>
                            <option value="suv">SUV</option>
                            <option value="hatchback">Hatchback</option>
                            <option value="luxury">Luxury</option>
                            <option value="sports">Sports</option>
                            <option value="truck">Truck</option>
                            <option value="van">Van</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Price per Day *</label>
                          <input
                            type="number"
                            name="price"
                            value={editFormData.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Location</label>
                          <input
                            type="text"
                            name="location"
                            value={editFormData.location}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-section">
                      <h4>Specifications</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Seats</label>
                          <input
                            type="number"
                            name="seats"
                            value={editFormData.seats}
                            onChange={handleInputChange}
                            min="1"
                            max="50"
                          />
                        </div>
                        <div className="form-group">
                          <label>Fuel Type</label>
                          <select name="fuelType" value={editFormData.fuelType} onChange={handleInputChange}>
                            <option value="">Select Fuel Type</option>
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="cng">CNG</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Mileage</label>
                          <input
                            type="text"
                            name="mileage"
                            value={editFormData.mileage}
                            onChange={handleInputChange}
                            placeholder="e.g., 15 km/l"
                          />
                        </div>
                        <div className="form-group">
                          <label>Engine</label>
                          <input
                            type="text"
                            name="engine"
                            value={editFormData.engine}
                            onChange={handleInputChange}
                            placeholder="e.g., 1.5L Turbo"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Power</label>
                          <input
                            type="text"
                            name="power"
                            value={editFormData.power}
                            onChange={handleInputChange}
                            placeholder="e.g., 150 HP"
                          />
                        </div>
                        <div className="form-group">
                          <label>Drivetrain</label>
                          <select name="drivetrain" value={editFormData.drivetrain} onChange={handleInputChange}>
                            <option value="">Select Drivetrain</option>
                            <option value="fwd">Front Wheel Drive</option>
                            <option value="rwd">Rear Wheel Drive</option>
                            <option value="awd">All Wheel Drive</option>
                            <option value="4wd">4 Wheel Drive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-section">
                      <h4>Additional Details</h4>
                      <div className="form-group">
                        <label>Features</label>
                        <input
                          type="text"
                          name="features"
                          value={editFormData.features}
                          onChange={handleInputChange}
                          placeholder="Separate features with commas (e.g., AC, GPS, Bluetooth)"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Vehicle description..."
                        />
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="isAvailable"
                            checked={editFormData.isAvailable}
                            onChange={handleInputChange}
                          />
                          <span>Vehicle is available for rent</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="modal-btn secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="modal-btn primary" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update Vehicle"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
