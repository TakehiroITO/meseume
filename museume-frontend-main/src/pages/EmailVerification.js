import React, { useEffect, useState } from "react";
import Navigation from "./Navigation"; // Import the Navigation component
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const EmailVerification = () => {
  const { t } = useTranslation(); // Use the translation function
  const [email, setEmail] = useState('');
  const [isPass, setIsPass] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const isPassParam = urlParams.get('is_pass');
    if (emailParam) {
      setEmail(emailParam);
    }
    if (isPassParam) {
      setIsPass(isPassParam);
    }
  }, []);

  return (
    <>
      <Navigation />
      <div className="verification-container">
        <div className="alert-icon">!</div>  {/* Circle with exclamation mark inside */}
        <h2>{isPass ? t("Please complete the password reset verification.") : t("Please complete the email verification.")}</h2>
        <p className="email-address">{email}</p>
        <p className="verification-text">
          {isPass ? (
            <>
              {t('Your password reset is not yet complete.')} <br />
              {t('A confirmation email has been sent to your registered email address.')} <br />
              {t('Please click link to reset your password.')}
            </>
          ) : (
            <>
              {t('Your account registration is not yet complete.')} <br />
              {t('A confirmation email has been sent to your registered email address.')} <br />
              {t('Please register for authentication from the confirmation email.')}
            </>
          )}
        </p>

        {/* <a href="/forgot-password" className="forgot-password-link">
        Forgot your password?
      </a> */}
      </div>
    </>
  );
};

export default EmailVerification;
