import React from 'react';
import { useUser } from '@clerk/clerk-react';

export default function UserAvatar({ size = 100 }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  const imageUrl = user?.imageUrl;
  const fullName = user?.fullName || 'User';
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        ...styles.avatar,
        width: size,
        height: size,
        fontSize: size / 2.5,
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="User" style={styles.image} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

const styles = {
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    color: '#555',
    borderRadius: '50%',
    overflow: 'hidden',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    userSelect: 'none',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};
