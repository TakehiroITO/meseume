import React from 'react';

const Spinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen-wrapper">
        <div className="spinner-container">
          <svg 
            className="spinner" 
            viewBox="0 0 50 50"
          >
            <circle
              className="spinner-circle"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <svg 
        className="spinner" 
        viewBox="0 0 50 50"
      >
        <circle
          className="spinner-circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
};

export default Spinner;