import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header style={styles.header}>
      <Link to="/">
        <img src="/logo2.svg" alt="Motovia Logo" style={styles.logo} />
      </Link>
      <h1 style={styles.title}>Motovia Vehicle Rental</h1>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logo: {
    width: "120px",
    height: "auto",
    marginRight: "20px",
  },
  title: {
    fontSize: "24px",
    margin: 0,
    color: "#333",
  },
};

export default Header;
