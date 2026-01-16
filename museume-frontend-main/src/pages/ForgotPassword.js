import React, { useState } from "react";
import Navigation from "./Navigation";
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../redux/slices/authSlice';
import { FE_BASE_URL } from "../constants";
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const ForgotPassword = () => {
  const { t } = useTranslation(); // Use the translation function
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { resetPasswordRes, error } = useSelector(state => state.auth);

  const handleResetPassword = async () => {
    if (!email) {
      alert(t('Password is required'));
      return;
    }
    const response = await dispatch(resetPassword(email));
    if (response.type === 'auth/resetPassword/fulfilled') {
      window.location.href = `${process.env.REACT_APP_BASE_FE_URL}/email-verification?email=${email}&is_pass=true`;
    }
  };

  return (
    <>
    <Navigation/>
    <div className="password-reset-container">
      <h2 className="password-reset-title">{t('Password reset')}</h2>
      <p className="password-reset-instructions">
        {t('After entering your e-mail address, you will be authenticated. Please register for authentication from the confirmation email.')}
      </p>
      <input 
        type="email" 
        className="password-reset-email-input" 
        placeholder={t('tom@example.com')} 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="password-reset-submit-button" onClick={handleResetPassword} disabled={!email}>
        {t('Change your password')}
      </button>
      {/* {resetPasswordRes && <p>{t('Password reset email sent successfully.')}</p>} */}
      {/* {error && <p>{t('Error: {error}')}</p>} */}
    </div>
    </>
  );
};

export default ForgotPassword;
