import React, { useState, useEffect } from "react";
import Navigation from "./Navigation"; // Import the Navigation component
import { useDispatch } from "react-redux"; // Import useDispatch hook
import { resetPasswordConfirm } from "../redux/slices/authSlice"; // Import the resetPassword action from authSlice
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation hooks for navigation and query param access
import queryString from 'query-string'; // Import query-string library
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import { toast } from 'react-toastify'; 

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const dispatch = useDispatch(); // Initialize useDispatch hook
  const navigate = useNavigate(); // Initialize useHistory hook
  const location = useLocation(); // Initialize useLocation hook
  const queryParams = queryString.parse(location.search); // Parse query parameters
  const { uid, token } = queryParams; // Extract uid and token from query parameters
  const { t } = useTranslation(); // Use the translation function

  const handleResetPassword = async (e) => {

    e.preventDefault();
    
    let isValid = true;
    if (!password) {
      setPasswordError(t('Password is required'));
      isValid = false;
    } else if (password.length < 8 || password.length > 32) { // Length validation
      setPasswordError(t('Password must be between 8 and 32 characters'));
      isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(password)) { // Alphanumeric validation
      setPasswordError(t('Password must contain only alphanumeric characters'));
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) { // Complex password validation
      setPasswordError(t('Password must contain at least one uppercase letter, one lowercase letter, and one number'));
      isValid = false;
    } else {
      setPasswordError('');
    }
    if (!confirmPassword) {
      setConfirmPasswordError(t('Confirm Password is required'));
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    if (isValid && password && confirmPassword && password === confirmPassword) {
      const credentials = { password, 'confirm_password': confirmPassword, uid, token }; // Send password and confirm password
      const response = await dispatch(resetPasswordConfirm(credentials));
      if (response.type === 'auth/resetPasswordConfirm/fulfilled') {
        navigate('/login'); // Navigate to login page after successful password reset
        toast.success(t('Password reset successful. Please login with your new password.')); // Show success message
      }
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError('');
  };

  return (
    <>
      {/* Navigation Component */}
      <Navigation />

      {/* Reset Password Form Section */}
      <section className="pt-pb">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 px-lg-4 col-md-5 mx-auto">
              <div className="login-form">
                <h3 className="text-center">{t('Reset Password')}</h3>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <input type="password" className="form-control shadow-none" id="password" placeholder={t('New Password')} value={password} onChange={handlePasswordChange} />
                    {passwordError && <p style={{ color: 'red', fontSize: 'small' }}>{passwordError}</p>}
                  </div>
                  <div className="mb-3">
                    <input type="password" className="form-control shadow-none" id="confirm-password" placeholder={t('Confirm New Password')} value={confirmPassword} onChange={handleConfirmPasswordChange} />
                    {confirmPasswordError && <p style={{ color: 'red', fontSize: 'small' }}>{confirmPasswordError}</p>}
                  </div>
                  <button type="submit" className="btn-green w-100">{t('Reset Password')}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PasswordReset;
