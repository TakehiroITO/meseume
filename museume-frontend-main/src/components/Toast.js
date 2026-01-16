// ToastNotification.js
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastNotification = () => {
  return (
    <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar
      closeOnClick
      pauseOnHover
      draggable
      className="toast-container"
    />
  );
};

export default ToastNotification;
