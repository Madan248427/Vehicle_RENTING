"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Car, Users, MapPin, Award, Shield, Heart, Target, Star } from "lucide-react"
import { vehicles } from "../../pages/vehicless" 

export default function About() {
  const [selectedSection, setSelectedSection] = useState("company")
  const navigate = useNavigate()

  const companyStats = [
    { icon: Car, label: "Premium Vehicles", value: "500+" },
    { icon: Users, label: "Happy Customers", value: "50,000+" },
    { icon: MapPin, label: "Locations", value: "25+" },
    { icon: Award, label: "Years Experience", value: "15+" },
  ]

  const teamMembers = [
    {
      id: 1,
      name: "John Smith",
      position: "CEO & Founder",
      image: "/placeholder.svg?height=300&width=300&text=John+Smith",
      description: "With over 20 years in the automotive industry, John founded Motovia with a vision to revolutionize car rental services.",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      position: "Operations Director",
      image: "/placeholder.svg?height=300&width=300&text=Sarah+Johnson",
      description: "Sarah ensures our fleet is maintained to the highest standards and our operations run smoothly across all locations.",
    },
    {
      id: 3,
      name: "Michael Chen",
      position: "Technology Lead",
      image: "/placeholder.svg?height=300&width=300&text=Michael+Chen",
      description: "Michael leads our digital transformation, developing cutting-edge solutions for seamless customer experiences.",
    },
  ]

  const values = [
    { icon: Shield, title: "Safety First", description: "Every vehicle undergoes rigorous safety inspections and maintenance." },
    { icon: Heart, title: "Customer Care", description: "Exceptional service and support for a smooth rental experience." },
    { icon: Target, title: "Quality Excellence", description: "Only the highest standards in vehicles and services." },
    { icon: Award, title: "Innovation", description: "Always investing in the latest technology and features." },
  ]

  const featuredVehicles = vehicles?.slice(0, 3) || []

  const handleVehicleClick = (id) => {
    navigate(`/vehicles/${id}`)
  }

  const handleNavClick = () => {
    navigate("/vehicles")
  }

  return (
    <div className="about-page">
      <div className="container">
        {/* Hero */}
        <section className="about-hero">
          <h1 className="about-title">About Motovia</h1>
          <p className="about-subtitle">Your trusted partner for premium car rentals since 2009.</p>
          <img src="/placeholder.svg?height=400&width=600&text=About+Motovia" alt="About Motovia" />
        </section>

        {/* Tabs */}
        <div className="about-navigation">
          <button onClick={() => setSelectedSection("company")} className={selectedSection === "company" ? "active" : ""}>Our Company</button>
          <button onClick={() => setSelectedSection("team")} className={selectedSection === "team" ? "active" : ""}>Our Team</button>
          <button onClick={() => setSelectedSection("vehicles")} className={selectedSection === "vehicles" ? "active" : ""}>Our Vehicles</button>
        </div>

        {/* Sections */}
        {selectedSection === "company" && (
          <>
            <section className="stats-section">
              <h2>Motovia by Numbers</h2>
              <div className="stats-grid">
                {companyStats.map(({ icon: Icon, label, value }, idx) => (
                  <div key={idx} className="stat-card">
                    <Icon size={48} />
                    <div>{value}</div>
                    <div>{label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="story-section">
              <h2>Our Story</h2>
              <p>Founded in 2009, Motovia started with just five vehicles and has grown into a trusted industry leader.</p>
              <img src="/placeholder.svg?height=400&width=500&text=Our+Story" alt="Our Story" />
            </section>

            <section className="values-section">
              <h2>Our Values</h2>
              <div className="values-grid">
                {values.map(({ icon: Icon, title, description }, idx) => (
                  <div key={idx} className="value-card">
                    <Icon size={40} />
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {selectedSection === "team" && (
          <section className="team-section">
            <h2>Meet Our Team</h2>
            <div className="team-grid">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-card">
                  <img src={member.image} alt={member.name} />
                  <h3>{member.name}</h3>
                  <p>{member.position}</p>
                  <p>{member.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedSection === "vehicles" && (
          <section className="vehicles-section">
            <h2>Our Premium Fleet</h2>
            <div className="vehicles-grid">
              {featuredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card" onClick={() => handleVehicleClick(vehicle.id)}>
                  <img src={vehicle.image || "/placeholder.svg"} alt={vehicle.name} />
                  <h3>{vehicle.name}</h3>
                  <p>{vehicle.category}</p>
                  <div>
                    <Star size={16} fill="currentColor" />
                    <span>{vehicle.rating}</span>
                  </div>
                  <div>${vehicle.price}/day</div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button onClick={handleNavClick}>View All Vehicles</button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
