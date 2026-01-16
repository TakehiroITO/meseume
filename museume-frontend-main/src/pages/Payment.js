// PaymentPage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/PaymentForm';
import Navigation from './Navigation';
import { useTranslation } from 'react-i18next';

// Initialize Stripe with your publishable key
// const stripePromise = loadStripe('pk_test_51QgH89KFU3wA5ZIm99uPflTYyXApEIV9iqcOvw8KaAaCm8Er7S8CCQawIjvXOWzqDuOdwfxWaCho3I05QrwceAVV00mwbKjumF');
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISH_KEY);

const PaymentPage = () => {
  const location = useLocation();
  const { clientSecret, amount, artistClassId, artistClassType, artistUrl, currency } = location.state || {};

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#14b8a6',
      },
    },
  };

  const { t } = useTranslation(); // Use the translation function

  return (
    <>
      <Navigation />
      <div className="payment-page">
        <div className="payment-container">
          <h1 style={{textAlign: 'center', margin: 10}}>{t('Complete Payment')}</h1>
          
          {clientSecret ? (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm 
                amount={amount} 
                artistClassId={artistClassId}
                artistClassType={artistClassType}
                artistUrl={artistUrl}
                currency={currency}
              />
            </Elements>
          ) : (
            <div className="error-message">
              {t('Invalid payment session. Please try again.')}.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
