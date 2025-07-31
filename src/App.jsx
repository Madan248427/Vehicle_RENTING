import React from "react";
import { Routes, Route } from "react-router-dom";

import SecureAdminRoute from "./components/Admin/SecureAdminRoute";
import SecureUserRoute from "./components/User/SecureUserRoute";
import PublicRoute from "./PublicRoute";

import ClekAuth from "./ClekAuth";
import HomeLandingPage from "./pages/Homelandingpage";
import About from "./pages/Aboutlanding";
import Vehicleslanding from "./pages/vehicles._landing";
import Feedbacklanding from "./pages/Feedbacklanding";
import Vehicledetails_landing from "./pages/vehicledetails_landing";

import AdminHome from "./components/Admin/AdminHome/AdminHome";
import Admin from "./components/Admin/Admin";
import AddVehicleForm from "./components/Admin/Add_vehicle/AddVehicleForm";
import VehicleList from "./componrnts/imageuploadation/VehicleList";
import EditProfileSecurityPage from "./components/User/profile/EditProfileSecurityPage.jsx";
import UserVehicle from "./pages/UserVehicle";
import Uservehicledet from "./pages/Uservehicledet";
import ProfilePage from "./components/User/profile/Profilepage";
import EditProfilePage from "./components/User/profile/EditProfilePage";
import UserBookings from "./components/User/Userbooking/UserBookings";
import Comp from "./components/User/complain/Comp";
import RatingPage from "./components/User/Rating/DisplayRatingsPage.jsx";
import BookingManagement from "./components/Admin/Booking_Management/BookingManagement";
import VehicleManagement from "./components/Admin/VehicleManagement/VehicleManagement";
import RatingManagement from "./components/Admin/RatingManagement/RatingManagement";
import ComplaintManagement from "./components/Admin/ComplaintManagement/ComplaintManagement";
import BookingForm from "./components/Admin/Booking_Management/BookingForm.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><HomeLandingPage /></PublicRoute>} />
      <Route path="/vehicles" element={<PublicRoute><Vehicleslanding /></PublicRoute>} />
      <Route path="/vechical_details/:id" element={<PublicRoute><Vehicledetails_landing /></PublicRoute>} />
      <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
      <Route path="/feedback" element={<PublicRoute><Feedbacklanding /></PublicRoute>} />
      <Route path="/sign-in" element={<PublicRoute><ClekAuth authType="sign-in" /></PublicRoute>} />
      <Route path="/sign-up" element={<PublicRoute><ClekAuth authType="sign-up" /></PublicRoute>} />

      {/* Admin Routes (nested) */}
      <Route path="/admin" element={<SecureAdminRoute />}>
        <Route index element={<AdminHome />} />
        <Route path="rating" element={<RatingManagement />} />
        <Route path="complain/COM" element={<Comp />} />
        <Route path="addvehicle" element={<AddVehicleForm />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="edit-profile" element={<EditProfilePage />} />
        <Route path="edit-profile/security" element={<EditProfileSecurityPage />} />
        <Route path="vehicle" element={<VehicleManagement />} />
        <Route path="booking" element={<BookingManagement />} />
        <Route path="complain" element={<ComplaintManagement />} />
        <Route path="booking/vehicleId/:vehicleId" element={<BookingForm />} />
      </Route>

      {/* User Routes (nested) */}
      <Route path="/user" element={<SecureUserRoute />}>
        <Route index element={<UserVehicle />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="edit-profile" element={<EditProfilePage />} />
        <Route path="edit-profile/security" element={<EditProfileSecurityPage />} />
        <Route path="booking" element={<UserBookings />} />
        <Route path="rating" element={<RatingPage />} />
        <Route path="complain" element={<Comp />} />
        <Route path="vehicle_details/:vehicleId" element={<Uservehicledet />} />
      </Route>

      {/* Optional fallback 404 route */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
