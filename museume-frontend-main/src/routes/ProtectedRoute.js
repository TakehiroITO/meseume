import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/helpers';
import { toast } from 'react-toastify'; 
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children }) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initialize with null for loading state

  useEffect(() => {
    const checkToken = async () => {
      const isValid = await isTokenValid(); // Await token validation and refresh if needed
      if (!isValid) {
        toast.error(t('Please log in to continue.'));
      }
      setIsAuthenticated(isValid);
    };

    checkToken(); // Check token on component load
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Display a loading state while checking
  }

  if (!isAuthenticated) {
    // If token is invalid, redirect to login page
    return <Navigate to="/login" />;
  }

  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;
