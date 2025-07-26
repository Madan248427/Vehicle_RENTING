import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClekAuth from './ClekAuth';
import SecureAdminRoute from './components/Admin/SecureAdminRoute';
import SecureUserRoute from './components/User/SecureUserRoute';

import HomeLandingPage from './pages/Homelandingpage';

import About from './pages/Aboutlanding';
import Vehicleslanding from './pages/vehicles._landing';
import Feedbacklanding from './pages/Feedbacklanding';

import Admin from './components/Admin/Admin';  // import Admin component
import AddVehicleForm from './components/Admin/Add_vehicle/AddVehicleForm';
import VehicleList from './componrnts/imageuploadation/VehicleList';
import Vehicledetails_landing from './pages/vehicledetails_landing';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeLandingPage />} />
      <Route path="/vehicles" element={<Vehicleslanding />} />
      <Route path="/vechical_details/:id" element={<Vehicledetails_landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/feedback" element={<Feedbacklanding />} />
      <Route path="/sign-in" element={<ClekAuth authType="sign-in" />} />
      <Route path="/sign-up" element={<ClekAuth authType="sign-up" />} />

      {/* Protected Admin routes with nested routes */}
      <Route path="/admin/dashboard" element={<SecureAdminRoute />}>
        {/* Admin layout */}
        <Route index element={<Admin />} /> {/* default admin page */}
        <Route path="/admin/dashboard/addvehicle" element={<AddVehicleForm />} />
        <Route path="/admin/dashboard/showvehicle" element={<VehicleList />} />
      </Route>

      {/* Protected User route */}
      <Route path="/user" element={<SecureUserRoute />} />
    </Routes>
  );
}
