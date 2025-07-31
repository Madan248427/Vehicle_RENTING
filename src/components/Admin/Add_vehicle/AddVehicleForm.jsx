"use client"

import { useState, useRef, useEffect } from "react"
import "./AddVehicleForm.css" // Import the CSS file

// You'll need to import your Firebase config
import { db, serverTimestamp } from "../../firebase/firebase" // Adjusted path

import { collection, addDoc } from "firebase/firestore"

const AddVehicleForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    fuelType: "",
    mileage: "",
    model: "",
    price: "",
    features: ["", "", ""],
    isAvailable: true,
    imageFile: null,
    videoFile: null,
    engine: "",
    power: "",
    seating: "",
    drivetrain: "",
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs for file inputs to reset them manually
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [imagePreview, videoPreview])

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target

    if (name.startsWith("feature")) {
      const index = Number.parseInt(name.replace("feature", ""))
      const newFeatures = [...formData.features]
      newFeatures[index] = value
      setFormData((prev) => ({ ...prev, features: newFeatures }))
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === "file") {
      const file = files?.[0] || null
      setFormData((prev) => ({ ...prev, [name]: file }))
      // Generate preview for image or video
      if (file) {
        const previewUrl = URL.createObjectURL(file)
        if (name === "imageFile") {
          // Clean up previous preview
          if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
          }
          setImagePreview(previewUrl)
        } else if (name === "videoFile") {
          // Clean up previous preview
          if (videoPreview) {
            URL.revokeObjectURL(videoPreview)
          }
          setVideoPreview(previewUrl)
        }
      } else {
        // Clear preview if no file selected
        if (name === "imageFile") {
          if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
          }
          setImagePreview(null)
        } else if (name === "videoFile") {
          if (videoPreview) {
            URL.revokeObjectURL(videoPreview)
          }
          setVideoPreview(null)
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, imageFile: null }))
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoPreview(null)
    setFormData((prev) => ({ ...prev, videoFile: null }))
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const uploadToCloudinary = async (file) => {
    if (!file) return null
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "images") // Use your default preset for images

    // Determine resource type based on file type
    let resourceType = "image"
    if (file.type.startsWith("video/")) {
      resourceType = "video"
      data.append("upload_preset", "videos") // Use a different preset for videos if you have one
    }

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/duortzwqq/${resourceType}/upload`, {
        method: "POST",
        body: data,
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      return result.public_id
    } catch (error) {
      console.error(`Error uploading ${resourceType} to Cloudinary:`, error)
      throw error
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      category: "",
      description: "",
      fuelType: "",
      mileage: "",
      model: "",
      price: "",
      features: ["", "", ""],
      isAvailable: true,
      imageFile: null,
      videoFile: null,
      engine: "",
      power: "",
      seating: "",
      drivetrain: "",
    })
    // Clean up preview URLs
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
      setVideoPreview(null)
    }
    // Reset file inputs manually
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const imageId = await uploadToCloudinary(formData.imageFile)
      const videoId = await uploadToCloudinary(formData.videoFile)

      const vehicleData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        fuelType: formData.fuelType,
        mileage: formData.mileage,
        model: formData.model,
        price: Number(formData.price),
        features: formData.features.filter((feature) => feature.trim() !== ""), // Remove empty features
        isAvailable: formData.isAvailable,
        createdAt: serverTimestamp(), // This line is now active
        imageId,
        videoId,
        specifications: {
          engine: formData.engine,
          power: formData.power,
          seating: formData.seating,
          drivetrain: formData.drivetrain,
        },
      }

      // This line was commented out and is now uncommented to enable Firebase registration
      await addDoc(collection(db, "vehicles"), vehicleData)
      console.log("Vehicle data:", vehicleData) // For testing
      alert("Vehicle added successfully!")
      // Reset form after successful submission
      resetForm()
    } catch (err) {
      console.error("Error:", err)
      alert("Failed to add vehicle.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-vehicle-container">
      <div className="add-vehicle-card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="car-icon">🚗</span>
            Add New Vehicle
          </h2>
          <p className="card-description">Fill in the details below to add a new vehicle to your fleet</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="vehicle-form">
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="car-icon">🚗</span>
                Basic Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Vehicle Name *</label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    placeholder="Vehicle Name"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="brand">Brand *</label>
                  <input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    placeholder="Brand"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="model">Model *</label>
                  <input
                    id="model"
                    name="model"
                    value={formData.model}
                    placeholder="Model"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    id="category"
                    name="category"
                    value={formData.category}
                    placeholder="Category (e.g., SUV, Sedan)"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fuelType">Fuel Type *</label>
                  <input
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    placeholder="Fuel Type (e.g., Petrol, Diesel)"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mileage">Mileage *</label>
                  <input
                    id="mileage"
                    name="mileage"
                    value={formData.mileage}
                    placeholder="Mileage (e.g., 10000 km)"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price (per day) *</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    placeholder="Price"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  placeholder="Vehicle description"
                  onChange={handleChange}
                  required
                  rows="4"
                />
              </div>
            </div>

            <div className="separator"></div>

            {/* Specifications */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="settings-icon">⚙️</span>
                Specifications
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="engine">Engine</label>
                  <input
                    id="engine"
                    name="engine"
                    value={formData.engine}
                    placeholder="Engine (e.g., V6 Turbo)"
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="power">Power</label>
                  <input
                    id="power"
                    name="power"
                    value={formData.power}
                    placeholder="Power (e.g., 320 HP)"
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="seating">Seating</label>
                  <input
                    id="seating"
                    name="seating"
                    value={formData.seating}
                    placeholder="Seating (e.g., 5 Seats)"
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="drivetrain">Drivetrain</label>
                  <input
                    id="drivetrain"
                    name="drivetrain"
                    value={formData.drivetrain}
                    placeholder="Drivetrain (e.g., AWD, FWD)"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="separator"></div>

            {/* Features */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="star-icon">⭐</span>
                Features
              </h3>
              <div className="features-grid">
                {formData.features.map((feature, index) => (
                  <div className="form-group" key={index}>
                    <label htmlFor={`feature${index}`}>
                      Feature {index + 1} {index === 0 && "*"}
                    </label>
                    <input
                      id={`feature${index}`}
                      name={`feature${index}`}
                      value={feature}
                      placeholder={`Feature ${index + 1}`}
                      onChange={handleChange}
                      required={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="separator"></div>

            {/* Media Upload */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="upload-icon">📤</span>
                Media Upload
              </h3>
              <div className="media-grid">
                {/* Image Upload */}
                <div className="media-section">
                  <div className="form-group">
                    <label htmlFor="imageFile">Upload Image *</label>
                    <input
                      id="imageFile"
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      ref={imageInputRef}
                      required
                    />
                  </div>
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="preview-section">
                      <label>Image Preview:</label>
                      <div className="preview-container">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Selected vehicle"
                          className="preview-image"
                        />
                        <button type="button" className="remove-btn" onClick={removeImage}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Video Upload */}
                <div className="media-section">
                  <div className="form-group">
                    <label htmlFor="videoFile">Upload Video (Optional)</label>
                    <input
                      id="videoFile"
                      name="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleChange}
                      ref={videoInputRef}
                    />
                  </div>
                  {/* Video Preview */}
                  {videoPreview && (
                    <div className="preview-section">
                      <label>Video Preview:</label>
                      <div className="preview-container">
                        <video src={videoPreview} controls className="preview-video">
                          Your browser does not support the video tag.
                        </video>
                        <button type="button" className="remove-btn" onClick={removeVideo}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="checkbox-section">
              <label className="checkbox-label">
                <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
                <span className="checkmark"></span>
                Vehicle is available for rent
              </label>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? "Adding..." : "Add Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddVehicleForm
