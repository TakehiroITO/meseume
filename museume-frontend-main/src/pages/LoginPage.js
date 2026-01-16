import React, { useState, useEffect } from "react";
import Navigation from "./Navigation"; // Import the Navigation component
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector hooks
import { login } from "../redux/slices/authSlice"; // Import the login action from authSlice
import { useNavigate } from "react-router-dom"; // Import useNavigate hook for navigation
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const LoginPage = () => {
  const { t } = useTranslation(); // Use the translation function
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch(); // Initialize useDispatch hook
  const navigate = useNavigate(); // Initialize useHistory hook
  const { isLoading } = useSelector((state) => state.auth); // Get auth state

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const credentials = { email, password };
    // Validate email and password
    if (!email) {
      setEmailError(t('Email is required'));
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError(t('Password is required'));
    } else {
      setPasswordError('');
    }
    if (email && password) {
      dispatch(login(credentials)).then((action) => {
        if (action.type === 'auth/login/fulfilled') {
          navigate('/add-user'); // Navigate to add-user page after successful login
        } else if (action.type === 'auth/login/rejected') {
          // setEmailError(t('Invalid email or password'));
          // setPasswordError(t('Invalid email or password'));
        }
      });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value.length > 0) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length > 0) {
      setPasswordError('');
    }
  };

  return (
    <>
      {/* Navigation Component */}
      <Navigation />

      {/* Login Form Section */}
      <section className="pt-pb">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 px-lg-4 col-md-5 mx-auto">
              <div className="login-form">
                <h3 className="text-center">{t('Login')}</h3>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <input type="email" className="form-control shadow-none" id="email" placeholder={t('figma@example.com')} value={email} onChange={handleEmailChange} />
                    {emailError && <div className="text-danger mt-1" style={{ fontSize: 'small', color: "red" }}>{emailError}</div>}
                  </div>
                  <div className="mb-3 position-relative" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {/* Input field */}
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      className="form-control shadow-none password-field"
                      id="password"
                      placeholder={t('..........')}
                      value={password}
                      onChange={handlePasswordChange}
                      style={{
                        paddingRight: '40px',   // Add padding to the right to make room for the icon
                        width: '100%',          // Ensure the input field takes full width
                        boxSizing: 'border-box' // Ensure padding and border are included in width calculation
                      }}
                    />
                    {/* Toggle password icon */}
                    <div
                      onClick={togglePasswordVisibility}
                      style={{
                        position: 'absolute',    // Position absolutely relative to the container
                        right: '10px',           // Place it 10px from the right edge of the input
                        top: '50%',              // Center vertically
                        transform: 'translateY(-50%)', // Adjust for perfect centering
                        cursor: 'pointer',
                        zIndex: 10               // Ensure it stays above other elements
                      }}
                    >
                      <img
                        src={isPasswordVisible ? require('../assets/images/show.png') : require('../assets/images/hide.png')}
                        className="img-fluid"
                        alt={t('Toggle Password')}
                        style={{ width: '20px', height: '20px' }} // Adjust the icon size
                      />
                    </div>
                  </div>
                  {passwordError && <div className="text-danger mt-1" style={{ fontSize: 'small', color: "red" }}>{passwordError}</div>}


                  <button type="submit" className="btn-green w-100" disabled={isLoading}>{t('Login')}</button>
                  <div className="text-center mt-md-4 mt-3">
                    <a href="/forgot-password" className="btn-forget">{t('Forgot your password?')}</a>
                  </div>
                  <div className="text-center mt-md-4 mt-3">
                    <a href="/register" className="btn-forget">{t('Create a new account')}</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
