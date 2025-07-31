import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// Import both sidebars
import UserSidebar from '../side-bar/sidebar';
import AdminSidebar from '../../Admin/sidebar/sidebar-dashboard';

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) return <div>Loading user data...</div>;
  if (!isSignedIn) return <div>You must be signed in to view this page.</div>;

  // Get role
  const role = user.unsafeMetadata?.role?.toLowerCase();

  // Prepare initials if no image
  const fullName = user.fullName || 'User';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Conditionally render sidebar based on role */}
      {role === 'admin' ? <AdminSidebar /> : <UserSidebar />}

      <div style={styles.container}>
        <h1 style={styles.title}>Your Profile</h1>

        <div style={styles.avatar}>
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="User Avatar" style={styles.image} />
          ) : (
            <div style={styles.initials}>{initials}</div>
          )}
        </div>

        <div style={styles.info}>
          <p><strong>Full Name:</strong> {fullName}</p>
          <p><strong>Username:</strong> {user.username || 'N/A'}</p>
          <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || 'N/A'}</p>
          <p><strong>Phone:</strong> {user.primaryPhoneNumber?.phoneNumber || 'N/A'}</p>
          <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p><strong>Role:</strong> {role || 'Not assigned'}</p>
        </div>

        <button
          style={styles.editButton}
          onClick={() => {
            if (role === 'admin') {
              navigate('/admin/edit-profile');
            } else {
              navigate('/user/edit-profile');
            }
          }}
        >
          Edit Profile
        </button>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '50px auto',
    padding: 30,
    border: '1px solid #ddd',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: 30,
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  avatar: {
    width: 120,
    height: 120,
    margin: '0 auto 20px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
    color: '#555',
    fontWeight: 'bold',
    userSelect: 'none',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  initials: {
    userSelect: 'none',
  },
  info: {
    textAlign: 'left',
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 1.6,
    color: '#444',
  },
  editButton: {
    backgroundColor: '#0070f3',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: 16,
  },
};
