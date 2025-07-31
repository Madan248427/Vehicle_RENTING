import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import styles from "../../styles/Navbar.module.css";  // <-- module import

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navbarContent}>
          <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
            <span className={styles.logoAccent}>MotO</span>Via
          </Link>

          <ul className={styles.navMenu}>
            <li className={styles.navItem}>
              <Link
                to="/"
                className={`${styles.navLink} ${
                  location.pathname === "/" ? styles.activeNavLink : ""
                }`}
              >
                Home
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link
                to="/vehicles"
                className={`${styles.navLink} ${
                  location.pathname.startsWith("/vehicles")
                    ? styles.activeNavLink
                    : ""
                }`}
              >
                Vehicles
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link
                to="/about"
                className={`${styles.navLink} ${
                  location.pathname === "/about" ? styles.activeNavLink : ""
                }`}
              >
                About
              </Link>
            </li>
          </ul>

          <div className={styles.navActions}>
            <div className={styles.authButtons}>
              <Link to="/sign-in" className={`${styles.btn} ${styles.btnOutline}`}>
                Sign In
              </Link>
              <Link to="/sign-up" className={`${styles.btn} ${styles.btnPrimary}`}>
                Sign Up
              </Link>
            </div>
          </div>

          <button
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div
        className={`${styles.mobileMenuOverlay} ${
          isMobileMenuOpen ? styles.open : ""
        }`}
        onClick={closeMobileMenu}
      >
        <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.mobileMenuClose}
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            <X />
          </button>
          <ul className={styles.mobileNavMenu}>
            <li className={styles.mobileNavItem}>
              <Link to="/" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                Home
              </Link>
            </li>

            <li className={styles.mobileNavItem}>
              <Link
                to="/vehicles"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                Vehicles
              </Link>
            </li>

            <li className={styles.mobileNavItem}>
              <Link to="/about" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                About
              </Link>
            </li>
          </ul>
          <div className={styles.mobileAuthButtons}>
            <Link
              to="/sign-in"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={closeMobileMenu}
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={closeMobileMenu}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
