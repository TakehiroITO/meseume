import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/helpers';

const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initialize with null for loading state

  useEffect(() => {
    const checkTokens = async () => {
      const isParentTokenValid = await isTokenValid('token'); // Check parent token validity
      const isChildTokenValid = await isTokenValid('child_token'); // Check child token validity

      if (!isChildTokenValid) {
        localStorage.removeItem('child_token'); // Remove child token if not valid
      }

      setIsAuthenticated(isParentTokenValid);
    };

    checkTokens(); // Check tokens on component load
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Display a loading state while checking
  }
  if (isAuthenticated) {
    if (localStorage.getItem('token') && localStorage.getItem('child_token')) {
      return <Navigate to="/my-work" />;
    } else if (localStorage.getItem('token')) {
      // Using window.location to both navigate and refresh
      window.location.href = '/add-user'; // Changed from replace to href for a full page reload
      return null; // Return null to prevent further rendering
    }
  }

  // Render the public component if not authenticated
  return children;
};

export default PublicRoute;
