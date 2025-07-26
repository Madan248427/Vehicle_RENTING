// src/components/VehicleList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../components/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const cloudinaryBase = 'https://res.cloudinary.com/duortzwqq/image/upload';

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vehicles'));
        const vehiclesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  if (vehicles.length === 0) return <p>Loading vehicles...</p>;

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', padding: '20px'
    }}>
      {vehicles.map(vehicle => (
        <div key={vehicle.id} style={{
          border: '1px solid #ddd', borderRadius: 10, padding: 16, width: 280, boxShadow: '2px 2px 12px #eee'
        }}>
          <img
            src={`${cloudinaryBase}/${vehicle.imageId}.jpg`}
            alt={vehicle.name}
            style={{ width: '100%', borderRadius: 8, marginBottom: 10 }}
            onError={e => { e.target.src = 'https://via.placeholder.com/280x180?text=No+Image'; }}
          />
          <h3>{vehicle.name}</h3>
          <p><b>Brand:</b> {vehicle.brand}</p>
          <p><b>Category:</b> {vehicle.category}</p>
          <p><b>Model:</b> {vehicle.model}</p>
          <p><b>Price:</b> ${vehicle.price} / day</p>
          <p><b>Mileage:</b> {vehicle.mileage}</p>
          <p><b>Fuel Type:</b> {vehicle.fuelType}</p>
          <p><b>Available:</b> {vehicle.isAvailable ? 'Yes' : 'No'}</p>
          <p><b>Description:</b> {vehicle.description}</p>
          <p><b>Features:</b> {vehicle.features?.join(', ')}</p>
          <p><small>Added on: {vehicle.createdAt?.toDate ? vehicle.createdAt.toDate().toLocaleString() : 'N/A'}</small></p>
        </div>
      ))}
    </div>
  );
};

export default VehicleList;



// const cloudinaryBase = "https://res.cloudinary.com/duortzwqq/image/upload"