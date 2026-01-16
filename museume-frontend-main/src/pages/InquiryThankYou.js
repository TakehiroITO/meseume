import React, { useEffect, useState } from "react";
import Navigation from "./Navigation"; // Import the Navigation component
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const EmailVerification = () => {
  const { t } = useTranslation(); // Use the translation function

  return (
    <>
      <Navigation />
      <div className="verification-container">
        <div className="alert-icon">!</div>  {/* Circle with exclamation mark inside */}
        <h2>{t("Thank you for contacting us.")}</h2>
        <p className="verification-text">
          <>
            {t('If you do not receive a response,')} <br />
            {t('please resend your inquiry to contact@museume.art.')} <br />
            {t('Also, please be sure to check your junk mail as it may occasionally arrive in your spam folder.')}
          </>
        </p>
      </div>
    </>
  );
};

export default EmailVerification;
