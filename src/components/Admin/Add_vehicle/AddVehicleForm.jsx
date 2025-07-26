"use client"

import { useState } from "react"
import { db, serverTimestamp } from "../../firebase/firebase"
import { collection, addDoc } from "firebase/firestore"
import axios from "axios"
import "./add-vehicle-form.css" // Import the new CSS file

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
    imageFile: null, // For image upload
    videoFile: null, // For video upload
    // New specification fields
    engine: "",
    power: "",
    seating: "",
    drivetrain: "",
  })

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
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
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
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/duortzwqq/${resourceType}/upload`, // Dynamic endpoint
        data,
      )
      return res.data.public_id
    } catch (error) {
      console.error(`Error uploading ${resourceType} to Cloudinary:`, error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const imageId = await uploadToCloudinary(formData.imageFile)
      const videoId = await uploadToCloudinary(formData.videoFile) // Upload video if present

      const vehicleData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        fuelType: formData.fuelType,
        mileage: formData.mileage,
        model: formData.model,
        price: Number(formData.price),
        features: formData.features,
        isAvailable: formData.isAvailable,
        createdAt: serverTimestamp(),
        imageId, // Store image ID
        videoId, // Store video ID
        // New specification data
        specifications: {
          engine: formData.engine,
          power: formData.power,
          seating: formData.seating,
          drivetrain: formData.drivetrain,
        },
      }
      await addDoc(collection(db, "vehicles"), vehicleData)
      alert("Vehicle added successfully!")
      // Optionally reset form here
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
    } catch (err) {
      console.error("Error:", err)
      alert("Failed to add vehicle.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-vehicle-form-container">
      <h2>Add New Vehicle</h2>

      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input name="name" placeholder="Vehicle Name" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="brand">Brand:</label>
        <input name="brand" placeholder="Brand" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <input name="category" placeholder="Category (e.g., SUV, Sedan)" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="model">Model:</label>
        <input name="model" placeholder="Model" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="mileage">Mileage:</label>
        <input name="mileage" placeholder="Mileage (e.g., 10000 km)" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="fuelType">Fuel Type:</label>
        <input name="fuelType" placeholder="Fuel Type (e.g., Petrol, Diesel)" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="price">Price (per day):</label>
        <input name="price" type="number" placeholder="Price" onChange={handleChange} required />
      </div>

      <h3>Specifications</h3>
      <div className="form-group">
        <label htmlFor="engine">Engine:</label>
        <input name="engine" placeholder="Engine (e.g., V6 Turbo)" onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="power">Power:</label>
        <input name="power" placeholder="Power (e.g., 320 HP)" onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="seating">Seating:</label>
        <input name="seating" placeholder="Seating (e.g., 5 Seats)" onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="drivetrain">Drivetrain:</label>
        <input name="drivetrain" placeholder="Drivetrain (e.g., AWD, FWD)" onChange={handleChange} />
      </div>

      <h3>Features</h3>
      <div className="form-group">
        <label htmlFor="feature0">Feature 1:</label>
        <input name="feature0" placeholder="Feature 1" onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="feature1">Feature 2:</label>
        <input name="feature1" placeholder="Feature 2" onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="feature2">Feature 3:</label>
        <input name="feature2" placeholder="Feature 3" onChange={handleChange} />
      </div>

      <div className="checkbox-group">
        <label htmlFor="isAvailable">Available:</label>
        <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="imageFile">Upload Image:</label>
        <input type="file" name="imageFile" accept="image/*" onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="videoFile">Upload Video (Optional):</label>
        <input type="file" name="videoFile" accept="video/*" onChange={handleChange} />
      </div>

      <button type="submit" className="submit-button">
        Add Vehicle
      </button>
    </form>
  )
}

export default AddVehicleForm
