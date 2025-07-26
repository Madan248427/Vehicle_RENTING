import React, { useEffect } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Nav from './components/Navbar'

export default function ClekAuth({ authType }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const role = user?.unsafeMetadata?.role || 'user';
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/user');
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return (
      <>
      <Nav/>
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {authType === 'sign-in' ? (
          <SignIn redirectUrl="/sign-in" />
        ) : (
          <SignUp unsafeMetadata={{ role: 'user' }} redirectUrl="/sign-in" />
        )}
      </div>
      </>
    );
  }

  return null; // Redirect handled in useEffect
}
