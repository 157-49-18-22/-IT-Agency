import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserAvatar = ({ size = 40, className = '' }) => {
  const { currentUser } = useAuth();
  
  // Get user initials or fallback to 'U'
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = currentUser?.username ? getInitials(currentUser.username) : 'U';

  return (
    <div 
      className={`inline-flex items-center justify-center rounded-full bg-blue-500 text-white ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`,
        lineHeight: 1,
      }}
    >
      {userInitials}
    </div>
  );
};

export default UserAvatar;
