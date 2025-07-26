import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import './index.css'

export default function PostSignUpHandler() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function setRole() {
      // If no role set in unsafeMetadata, set default "user"
      if (!user.unsafeMetadata?.role) {
        try {
          // If you want to get role from signup field, user.getSession()?.unsafeMetadata may help,
          // but Clerk doesn’t persist signup fields automatically in unsafeMetadata,
          // so here we default to "user"
          await user.update({
            unsafeMetadata: { role: 'user' },
          });
        } catch (err) {
          console.error('Error updating unsafeMetadata role:', err);
        }
      }
      // Redirect user based on role
      const role = user.unsafeMetadata?.role || 'user';

      if (role === 'admin') navigate('/admin');
      else navigate('/user');
    }

    setRole();
  }, [isLoaded, user, navigate]);

  return <div>Setting up your account...</div>;
}
