import { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';
import { BASE_URL } from '../constants';

// Function to refresh the token
const refreshToken = async (tokenType = 'parent') => {
  try {
    const refreshTokenKey = tokenType === 'child' ? 'child_refresh_token' : 'refreshToken';
    const accessTokenKey = tokenType === 'child' ? 'child_token' : 'token';

    const refreshToken = localStorage.getItem(refreshTokenKey); 
    if (!refreshToken) {
      throw new Error(`No ${tokenType} refresh token available`);
    }

    const response = await axios.post(`${BASE_URL}/token/refresh/`, {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;
    localStorage.setItem(accessTokenKey, newAccessToken); 
    return newAccessToken;
  } catch (error) {
    console.error(`Unable to refresh ${tokenType} token:`, error);
    // localStorage.removeItem(tokenType === 'child' ? 'child_token' : 'token'); 
    // localStorage.removeItem(tokenType === 'child' ? 'child_refresh_token' : 'refreshToken'); 
    return null;
  }
};

export const isTokenValid = async (tokenType = 'parent') => {
  const tokenKey = tokenType === 'child' ? 'child_token' : 'token';
  let token = localStorage.getItem(tokenKey); 

  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token); // Decode the token
    const currentTime = Date.now() / 1000; // Get the current time in seconds

    if (decodedToken.exp < currentTime) {
      // Token has expired, attempt to refresh
      token = await refreshToken(tokenType); // Refresh the token

      if (!token) return false; // If token refresh fails, return false
    }

    return true; // Token is valid (either still valid or successfully refreshed)
  } catch (error) {
    // If any error in decoding, consider the token invalid
    console.error(`Error decoding ${tokenType} token:`, error);
    localStorage.removeItem(tokenKey); // Clear the token
    return false;
  }
};

export const scheduleTokenRefresh = (tokenType = 'parent') => {
  const tokenKey = tokenType === 'child' ? 'child_token' : 'token';
  const token = localStorage.getItem(tokenKey);

  if (!token) return;

  const decodedToken = jwtDecode(token);
  const expirationTime = decodedToken.exp * 1000; // Expiration time in milliseconds

  const timeUntilExpiration = expirationTime - Date.now();

  // Set a timeout to refresh the token 1 minute before it expires
  if (timeUntilExpiration > 60000) {
    setTimeout(async () => {
      await refreshToken(tokenType); // Automatically refresh the token
    }, timeUntilExpiration - 60000); // Schedule to refresh 1 minute before expiration
  } else {
    // If the token is already close to expiring, refresh it immediately
    refreshToken(tokenType);
  }
};

// Schedule refresh for both parent and child tokens if they exist
scheduleTokenRefresh('parent');
scheduleTokenRefresh('child');
