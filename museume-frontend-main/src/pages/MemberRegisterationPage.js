import React, { useState } from "react";
import Navigation from "./Navigation"; // Import the Navigation component
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch hooks
import { signup } from "../redux/slices/authSlice"; // Import the signup action from authSlice
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const MemberRegistrationPage = () => {
  const { t } = useTranslation(); // Use the translation function
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch(); // Initialize useDispatch hook
  const { signupRes, isLoading, error } = useSelector((state) => state.auth); // Get auth state

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    // Validate email and password
    let isValid = true;
  
    if (!email) {
      setEmailError(t('Email is required'));
      isValid = false;
    } else {
      setEmailError('');
    }
  
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
  
    if (isValid) {
      const userData = { email, password, confirm_password: password };
      dispatch(signup(userData));
    }
  };
  
  
  

  if (signupRes && signupRes.email) {
    console.log("signup response", signupRes)
    window.location.href = `/email-verification?email=${signupRes.email}`;
  }

  return (
    <>
      {/* Navigation Component */}
      <Navigation />

      {/* Registration Form Section */}
      <section className="pt-pb">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 px-lg-4 col-md-5 mx-auto">
              <div className="login-form">
                <h3 className="text-center">{t('Member Registration')}</h3>
                <p className="text-center" style={{ fontSize: 'small', marginBottom: '15px' }}>
                  下記にメールアドレスとパスワード（英数含め８文字以上）を入力し登録ボタンを押してください。<br />
                  その後contact@museume.artからメールが届きますので、ご確認をお願いします。
                </p>
                <form onSubmit={handleSignup}>
                  <div className="mb-3">
                    <input type="email" className="form-control shadow-none" id="email" placeholder={t('figma@example.com')} value={email} onChange={(e) => setEmail(e.target.value)} />
                    {emailError && <p style={{ color: 'red', fontSize: 'small' }}>{emailError}</p>}
                  </div>
                  <div className="mb-3 position-relative" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {/* Input field */}
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      className="form-control shadow-none password-field"
                      id="password"
                      placeholder={t('..........')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  {passwordError && <p style={{ color: 'red', fontSize: 'small' }}>{passwordError}</p>}
                  <button type="submit" className="btn-green w-100" disabled={isLoading}>
                    {isLoading ? t('Signing up...') : t('Create an Account')}
                  </button>
                  {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
                  {signupRes && <p style={{ color: 'green' }}>{t('Signup successful!')}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MemberRegistrationPage;
