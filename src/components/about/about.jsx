"use client"

import { useState } from "react"
import { Car, Users, MapPin, Award, Shield, Heart, Target, Crown } from "lucide-react"
import styles from "./about.module.css"

export default function About() {
  const [selectedSection, setSelectedSection] = useState("company")

  const companyStats = [
    { icon: Car, label: "Premium Vehicles", value: "500+" },
    { icon: Users, label: "Happy Customers", value: "50,000+" },
    { icon: MapPin, label: "Locations", value: "25+" },
    { icon: Award, label: "Years Experience", value: "15+" },
  ]

  const teamMembers = [
    {
      id: 5,
      name: "Madan",
      position: "Team Leader",
      image: "/MRK3.jpg",
      description:
        "Leading the team with vision and focus, Madan coordinates frontend and backend efforts, drives innovation, and ensures timely delivery of features that make Motovia the best in the business.",
      isLeader: true,
    },
    {
      id: 1,
      name: "Xoysang",
      position: "Frontend Developer",
      image: "/xoysang.jpg",
      description:
        "Expert in modern UI design and responsive layouts, Xoysang ensures that every customer enjoys a smooth and intuitive experience when browsing or booking a vehicle on our platform.",
      isLeader: false,
    },
    {
      id: 2,
      name: "Aagya",
      position: "Frontend Developer",
      image: "/aagya.jpg",
      description:
        "Aagya brings elegance and functionality to the Motovia interface, specializing in user experience and accessibility to make our services available to all users.",
      isLeader: false,
    },
    {
      id: 3,
      name: "Rochak",
      position: "Backend Developer",
      image: "/rochak.jpg",
      description:
        "Responsible for building secure and scalable backend systems, Rochak ensures that all your bookings and data are processed smoothly and reliably behind the scenes.",
      isLeader: false,
    },
    {
      id: 4,
      name: "Kumuda",
      position: "Backend Developer",
      image: "/kumuda.jpg",
      description:
        "With strong expertise in databases and server-side development, Kumuda optimizes performance and maintains the reliability of our vehicle inventory and user accounts.",
      isLeader: false,
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

  // Separate team leader from other members
  const teamLeader = teamMembers.find((member) => member.isLeader)
  const otherMembers = teamMembers.filter((member) => !member.isLeader)

  const handleNavClick = () => {
    // Handle navigation - you can use react-router-dom navigate here
    console.log("Navigate to vehicles")
  }

  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <section className={styles.aboutHero}>
          <h1 className={styles.aboutTitle}>About Motovia</h1>
          <p className={styles.aboutSubtitle}>
            Motovia is a modern online vehicle rental company providing premium cars at affordable prices — with or
            without drivers. Whether you're a guest or a registered user, we make booking fast, easy, and accessible.
          </p>
          <div className={styles.heroImageContainer}>
            <img src="/logo.png" alt="About Motovia" className={styles.heroImage} />
          </div>
        </section>

        <div className={styles.aboutNavigation}>
          <button
            onClick={() => setSelectedSection("company")}
            className={`${styles.navButton} ${selectedSection === "company" ? styles.active : ""}`}
          >
            Our Company
          </button>
          <button
            onClick={() => setSelectedSection("team")}
            className={`${styles.navButton} ${selectedSection === "team" ? styles.active : ""}`}
          >
            Our Team
          </button>
        </div>

        {selectedSection === "company" && (
          <>
            <section className={styles.statsSection}>
              <h2 className={styles.sectionTitle}>Motovia by Numbers</h2>
              <div className={styles.statsGrid}>
                {companyStats.map(({ icon: Icon, label, value }, idx) => (
                  <div key={idx} className={styles.statCard}>
                    <div className={styles.statIconWrapper}>
                      <Icon size={48} className={styles.statIcon} />
                    </div>
                    <div className={styles.statValue}>{value}</div>
                    <div className={styles.statLabel}>{label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.infoSection}>
              <h2 className={styles.sectionTitle}>How Motovia Works</h2>
              <div className={styles.infoContent}>
                <div className={styles.infoCard}>
                  <p>
                    Motovia is an online vehicle rental company that offers a seamless and convenient way to book
                    premium vehicles for personal or business use.
                  </p>
                </div>
                <div className={styles.infoCard}>
                  <h3 className={styles.infoCardTitle}>For Guests</h3>
                  <p>
                    Anyone can browse our wide selection of vehicles and even make bookings without creating an account.
                  </p>
                </div>
                <div className={styles.infoCard}>
                  <h3 className={styles.infoCardTitle}>For Registered Users</h3>
                  <p>
                    By signing up, you unlock enhanced features such as the ability to add or update reviews, manage
                    your bookings, and enjoy exclusive offers. Most importantly, if you require a driver,{" "}
                    <strong>registered users receive a professional driver completely free of charge</strong>.
                  </p>
                </div>
                <div className={styles.infoCard}>
                  <h3 className={styles.infoCardTitle}>Our Mission</h3>
                  <p>Our mission is to deliver affordable, safe, and high-quality vehicles to everyone, everywhere.</p>
                </div>
              </div>
            </section>

            <section className={styles.valuesSection}>
              <h2 className={styles.sectionTitle}>Our Values</h2>
              <div className={styles.valuesGrid}>
                {values.map(({ icon: Icon, title, description }, idx) => (
                  <div key={idx} className={styles.valueCard}>
                    <div className={styles.valueIconWrapper}>
                      <Icon size={40} className={styles.valueIcon} />
                    </div>
                    <h3 className={styles.valueTitle}>{title}</h3>
                    <p className={styles.valueDescription}>{description}</p>
                    <div className={styles.valueCardAccent}></div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {selectedSection === "team" && (
          <section className={styles.teamSection}>
            <h2 className={styles.sectionTitle}>Meet Our Team</h2>

            {/* Team Leader Section */}
            {teamLeader && (
              <div className={styles.leaderSection}>
                <div className={styles.leaderCard}>
                  <div className={styles.leaderBadge}>
                    <Crown size={20} />
                    Team Leader
                  </div>
                  <div className={styles.leaderImageContainer}>
                    <img
                      src={teamLeader.image || "/placeholder.jpg"}
                      alt={teamLeader.name}
                      className={styles.leaderImage}
                    />
                    <div className={styles.leaderOverlay}></div>
                  </div>
                  <div className={styles.leaderContent}>
                    <h3 className={styles.leaderName}>{teamLeader.name}</h3>
                    <p className={styles.leaderRole}>{teamLeader.position}</p>
                    <p className={styles.leaderDesc}>{teamLeader.description}</p>
                  </div>
                  <div className={styles.leaderAccent}></div>
                </div>
              </div>
            )}

            {/* Other Team Members Section */}
            <div className={styles.membersSection}>
              <h3 className={styles.membersTitle}>Our Development Team</h3>
              <div className={styles.teamGrid}>
                {otherMembers.map((member) => (
                  <div key={member.id} className={styles.teamCard}>
                    <div className={styles.teamImageContainer}>
                      <img src={member.image || "/placeholder.jpg"} alt={member.name} className={styles.teamImage} />
                      <div className={styles.teamImageOverlay}></div>
                    </div>
                    <div className={styles.teamContent}>
                      <h4 className={styles.teamName}>{member.name}</h4>
                      <p className={styles.teamRole}>{member.position}</p>
                      <p className={styles.teamDesc}>{member.description}</p>
                    </div>
                    <div className={styles.teamCardAccent}></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
