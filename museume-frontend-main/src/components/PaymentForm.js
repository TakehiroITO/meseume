// PaymentForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux'; // Import useDispatch hook
import { confirmPayment } from '../redux/slices/contestSlice'; // Import the confirmPayment action
import { useTranslation } from 'react-i18next';
import { CURRENCY_SIGN_MAP } from '../constants';

const PaymentForm = ({ clientSecret, amount, artistClassId, artistClassType, artistUrl, currency }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize useDispatch hook
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const getCurrencySign = (currency) => {
    return CURRENCY_SIGN_MAP[currency] || currency;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/my-artist-classes`
        },
      });

      if (submitError) {
        setError(submitError.message);
        return;
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      if (paymentIntent.status === 'succeeded') {
        // Dispatch the confirmPayment action with the paymentIntent
        dispatch(confirmPayment(paymentIntent.id)).then((action) => {
          if (action.type === 'contest/confirmPayment/fulfilled') {
            // 決済完了後はMyアーティストクラスにリダイレクト
            navigate('/my-artist-classes');
          } else {
            setError('Failed to confirm payment.');
          }
        });
      } else {
        setError('Payment was not successful.');
      }
    } catch (err) {
      setError('An error occurred while processing your payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>{t("Complete the Payment")}</h2>
      <div className="amount-display">
        {t("Amount to pay: ")}{getCurrencySign(currency)}{amount}
      </div>
      <PaymentElement />
      {error && <div className="error-message">{error}</div>}
      <button 
        type="submit" 
        disabled={!stripe || processing} 
        className="submit-button"
      >
        {processing ? t('Processing...') : t('Pay now')}
      </button>
    </form>
  );
};

export default PaymentForm;
