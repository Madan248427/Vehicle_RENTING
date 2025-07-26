import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import Admin from './Admin';

export default function SecureAdminRoute() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" />;

  const role = user?.unsafeMetadata?.role;
  if (role !== 'admin') return <Navigate to="/user" />;

  return <Admin />;
}
