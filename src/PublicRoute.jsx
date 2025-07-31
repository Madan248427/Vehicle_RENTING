import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function PublicRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    console.log("PublicRoute: Loading user...");
    return null; // or loading spinner
  }

  if (isSignedIn) {
    const role = user?.unsafeMetadata?.role || "user";
    console.log("PublicRoute: User is signed in with role:", role);

    if (role === "admin") {
      console.log("PublicRoute: Redirecting admin to /admin/dashboard");
      return <Navigate to="/admin" replace />;
    }

    if (role === "user") {
      console.log("PublicRoute: Redirecting user to /user");
      return <Navigate to="/user" replace />;
    }

    // Optional: fallback for unexpected roles
    console.log("PublicRoute: Unknown role, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // Not signed in, render the public page
  console.log("PublicRoute: No user signed in, rendering public page");
  return children;
}
