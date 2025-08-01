"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Car, Users, MapPin, Award, Shield, Heart, Target } from "lucide-react"
import styles from "./about.module.css"

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
      name: "Chhoyisang",
      position: "Frontend Developer",
      image: "/xoysang.jpg",
      description:
        "Expert in modern UI design and responsive layouts, Xoysang ensures that every customer enjoys a smooth and intuitive experience when browsing or booking a vehicle on our platform.",
    },
    {
      id: 2,
      name: "Aagya",
      position: "Frontend Developer",
      image: "/aagya.jpg",
      description:
        "Aagya brings elegance and functionality to the Motovia interface, specializing in user experience and accessibility to make our services available to all users.",
    },
    {
      id: 3,
      name: "Rochak",
      position: "Backend Developer",
      image: "rochak.jpg",
      description:
        "Responsible for building secure and scalable backend systems, Rochak ensures that all your bookings and data are processed smoothly and reliably behind the scenes.",
    },
    {
      id: 4,
      name: "Kumuda",
      position: "Backend Developer",
      image: "/kumuda.jpg",
      description:
        "With strong expertise in databases and server-side development, Kumuda optimizes performance and maintains the reliability of our vehicle inventory and user accounts.",
    },
    {
      id: 5,
      name: "Madan",
      position: "Team Leader",
      image: "/MRK3.jpg",
      description:
        "Leading the team with vision and focus, Madan coordinates frontend and backend efforts, drives innovation, and ensures timely delivery of features that make Motovia the best in the business.",
    },
  ]

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Every vehicle undergoes rigorous safety inspections and maintenance.",
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "Exceptional service and support for a smooth rental experience.",
    },
    {
      icon: Target,
      title: "Quality Excellence",
      description: "Only the highest standards in vehicles and services.",
    },
    {
      icon: Award,
      title: "Innovation",
      description: "Always investing in the latest technology and features.",
    },
  ]

  const handleNavClick = () => {
    navigate("/vehicles")
  }

  // Separate team leader from other members
  const teamLeader = teamMembers.find((member) => member.position === "Team Leader")
  const otherMembers = teamMembers.filter((member) => member.position !== "Team Leader")

  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <section className={styles.aboutHero}>
          <h1 className={styles.aboutTitle}>About Motovia</h1>
          <p className={styles.aboutSubtitle}>
            Motovia is a modern online vehicle rental company providing premium cars at affordable prices — with or
            without drivers. Whether you're a guest or a registered user, we make booking fast, easy, and accessible.
          </p>
          <img src="/logo.png" alt="About Motovia" className={styles.heroImage} />
        </section>

        <div className={styles.aboutNavigation}>
          <button
            onClick={() => setSelectedSection("company")}
            className={selectedSection === "company" ? styles.active : ""}
          >
            Our Company
          </button>
          <button
            onClick={() => setSelectedSection("team")}
            className={selectedSection === "team" ? styles.active : ""}
          >
            Our Team
          </button>
        </div>

        {selectedSection === "company" && (
          <>
            <section className={styles.statsSection}>
              <h2>Motovia by Numbers</h2>
              <div className={styles.statsGrid}>
                {companyStats.map(({ icon: Icon, label, value }, idx) => (
                  <div key={idx} className={styles.statCard}>
                    <Icon size={48} />
                    <div>{value}</div>
                    <div>{label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.infoSection}>
              <h2>How Motovia Works</h2>
              <p>
                Motovia is an online vehicle rental company that offers a seamless and convenient way to book premium
                vehicles for personal or business use.
              </p>
              <p>
                <strong>Guests:</strong> Anyone can browse our wide selection of vehicles and even make bookings without
                creating an account.
              </p>
              <p>
                <strong>Registered Users:</strong> By signing up, you unlock enhanced features such as the ability to
                add or update reviews, manage your bookings, and enjoy exclusive offers. Most importantly, if you
                require a driver,{" "}
                <strong>registered users receive a professional driver completely free of charge</strong>.
              </p>
              <p>Our mission is to deliver affordable, safe, and high-quality vehicles to everyone, everywhere.</p>
            </section>

            <section className={styles.valuesSection}>
              <h2>Our Values</h2>
              <div className={styles.valuesGrid}>
                {values.map(({ icon: Icon, title, description }, idx) => (
                  <div key={idx} className={styles.valueCard}>
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
          <section className={styles.teamSection}>
            <h2>Meet Our Team</h2>

            {/* Team Leader Section */}
            {teamLeader && (
              <div className={styles.leaderSection}>
                <div className={styles.leaderCard}>
                  <img src={teamLeader.image || "/placeholder.svg"} alt={teamLeader.name} />
                  <h3>{teamLeader.name}</h3>
                  <p className={styles.leaderRole}>{teamLeader.position}</p>
                  <p className={styles.leaderDesc}>{teamLeader.description}</p>
                </div>
              </div>
            )}

            {/* Other Team Members */}
            <div className={styles.teamGrid}>
              {otherMembers.map((member) => (
                <div key={member.id} className={styles.teamCard}>
                  <img src={member.image || "/placeholder.svg"} alt={member.name} />
                  <h3>{member.name}</h3>
                  <p className={styles.teamRole}>{member.position}</p>
                  <p className={styles.teamDesc}>{member.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
