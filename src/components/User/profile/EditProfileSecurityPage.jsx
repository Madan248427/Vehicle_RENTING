import React from 'react';
import { UserProfile, useUser } from '@clerk/clerk-react';

// Import sidebars
import UserSidebar from '../Sidebar/sidebar';
import AdminSidebar from '../../Admin/sidebar/sidebar-dashboard';

export default function EditProfileSecurityPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <div>Loading user data...</div>;
  if (!isSignedIn) return <div>You must be signed in to access this page.</div>;

  const role = user.unsafeMetadata?.role?.toLowerCase();
  // Base profile path without "/security"
  const path = role === 'admin' ? '/admin/edit-profile' : '/user/edit-profile';

  return (
    <>
      {/* Conditionally render sidebar based on role */}
      {role === 'admin' ? <AdminSidebar /> : <UserSidebar />}

      <div style={{ maxWidth: 600, margin: '50px auto' }}>
        <h1>Security Settings</h1>
        <UserProfile
          key="security-tab" // forces remount if needed
          path={path}        // base profile path
          routing="path"
          initialPage="security"
          appearance={{ elements: { card: { boxShadow: 'none' } } }}
        />
      </div>
    </>
  );
}
