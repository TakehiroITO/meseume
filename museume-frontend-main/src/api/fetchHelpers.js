// src/api/fetchHelper.js
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Add this import

// Helper function to get the Authorization header
const auth = () => {
  const childToken = localStorage.getItem('child_token');
  const token = localStorage.getItem('token');
  return childToken || token ? `Bearer ${childToken || token}` : null;
};

// Helper function to build query string from an object
const buildQueryParams = (params) => {
  if (!params) {
    params = {};
  }

  // Filter out undefined or null values
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
  );

  const query = new URLSearchParams(filteredParams).toString();
  return query ? `?${query}` : '';
};

// Helper function to process error responses
const processErrorResponse = (error) => {
  if (!error.response) {
    return error.message || ('Network error occurred');
  }

  const { data, status } = error.response;
    // Handle 500 server errors
    if (status === 500) {
      return data.errors;
    }
  
    // Handle 403 forbidden errors
    if (status === 403) {
      console.log('Forbidden error:', data);
      return data.errors;
    }
  

  // Function to format error messages without including keys like "errors" or status codes
  const formatErrorMessage = (obj) => {
    return Object.entries(obj)
      .map(([field, value]) => {
        // Handle array of errors
        if (Array.isArray(value)) {
          return `${value.join(', ')}`;
        }
        // Handle nested objects
        else if (typeof value === 'object' && value !== null) {
          return formatErrorMessage(value);
        }
        // Handle string/number values
        return `${value}`;
      })
      .join('\n');
  };

  // Handle specific error messages
  if (typeof data === 'object' && !Array.isArray(data)) {
    return formatErrorMessage(data);
  }
  
  // Handle string error message or other formats
  return data.message || data.detail || JSON.stringify(data) || 'An error occurred';
};

// Main function to fetch data using Axios
export async function fetchData({
  apiUrl,
  method = 'GET',
  body,
  formData,
  contentType = 'application/json',
  queryParams = {},
}) {
  // Add lang parameter to every request
  const currentLang = localStorage.getItem('language') || 'en';
  queryParams.lang = currentLang;

  // Check for auth paths more explicitly
  const isAuthPath = apiUrl && ['/password-reset-confirm', '/signup', '/password-reset', '/login', '/verify-email?'].some(path => 
    apiUrl.includes(path) && 
    !apiUrl.includes('/profile/login/') && 
    !apiUrl.includes('/artist-classes/signup/')
  );

  const queryString = buildQueryParams(queryParams);
  const separator = apiUrl && apiUrl.includes('?') ? '&' : '?';
  const token = auth();
  const requestConfig = {
    url: `${apiUrl}${queryString ? separator + queryString.slice(1) : ''}`,
    method,
    headers: {
      ...(formData ? {} : { 'Content-Type': contentType }),
      Accept: contentType,
      // Always include Authorization unless it's specifically an auth path
      ...(token && !isAuthPath ? { Authorization: token } : {}),
    },
    data: formData || (contentType === 'application/json' ? JSON.stringify(body) : body),
  };

  // Add CSRF for non-GET methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    requestConfig.withCredentials = true;
    requestConfig.headers['X-CSRFToken'] = document.cookie.split('; ').find(row => row.startsWith('csrftoken'))?.split('=')[1] || '';
  }

  try {
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    // Log the error details for debugging
    console.error('Request failed:', {
      url: requestConfig.url,
      method: requestConfig.method,
      headers: requestConfig.headers,
      error: error.response?.data || error.message
    });

    // Process the error response
    const errorMessage = processErrorResponse(error);
    throw new Error(errorMessage);
  }
}