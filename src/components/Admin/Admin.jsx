import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

import AddVehicleForm from './Add_vehicle/AddVehicleForm';
import VehicleList from '../../componrnts/imageuploadation/VehicleList';

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const path = location.pathname;

  let content;
  if (path.endsWith('/addvehicle')) {
    content = <AddVehicleForm />;
  } else if (path.endsWith('/showvehicle')) {
    content = <VehicleList />;
  } else {
    content = <p>Please select an action above.</p>;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={containerStyle}>
      <h2>🚗 Welcome, Admin</h2>
      <nav style={navStyle}>
        <Link to="addvehicle" style={navLinkStyle}>➕ Add Vehicle</Link>
        <Link to="showvehicle" style={navLinkStyle}>📋 Show Vehicles</Link>
        <button onClick={handleLogout} style={logoutButtonStyle}>🚪 Logout</button>
      </nav>

      <div style={{ marginTop: '2rem' }}>
        {content}
      </div>
    </div>
  );
};

const containerStyle = {
  padding: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
};

const navStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem',
  borderBottom: '1px solid #ccc',
  paddingBottom: '0.5rem',
};

const navLinkStyle = {
  textDecoration: 'none',
  fontWeight: 'bold',
  color: '#007bff',
};

const logoutButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#dc3545',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default Admin;
