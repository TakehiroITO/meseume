import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBillingPlans, createCheckoutSession, getSubscriptionStatus, cancelSubscription } from '../redux/slices/billingSlice';
import Navigation from './Navigation';
import Loader from '../components/Loader';
import { CURRENCY_SIGN_MAP } from '../constants';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const SubscriptionPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    plans,
    subscriptionStatus,
    isLoading,
    error
  } = useSelector((state) => state.billing);

  useEffect(() => {
    dispatch(getBillingPlans());
    dispatch(getSubscriptionStatus());
  }, [dispatch]);

  const handleUpgrade = async (planId) => {
    try {
      const response = await dispatch(createCheckoutSession(planId)).unwrap();
      if (response?.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const handleCancel = async () => {
    try {
      await dispatch(cancelSubscription()).unwrap();
      // Refresh subscription status after cancellation
      dispatch(getSubscriptionStatus());
    } catch (err) {
      console.error('Cancel subscription error:', err);
    }
  };

  if (isLoading) return <Loader />;

  const isSubscribed = subscriptionStatus?.active;
  const activePlanId = subscriptionStatus?.plan?.id;

  const getCurrencySign = (currency) => {
    return CURRENCY_SIGN_MAP[currency] || currency;
  };

  let daily_plans = plans?.filter(plan => plan.interval === 'day');
  let weekly_plans = plans?.filter(plan => plan.interval === 'week');
  let monthly_plans = plans?.filter(plan => plan.interval === 'month');
  let yearly_plans = plans?.filter(plan => plan.interval === 'year');

  return (
    <>
      <Navigation />
      <div className="subscription-container">
        <h1 className="subscription-title">{t("Rate Plans")}</h1>
        <p className="subscription-description">
          {t("Basic functions are available free of charge. Depending on the functionality you need,")}<br />
          {t("You can upgrade at any time.")}
        </p>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Comparison Table */}
        <div className="comparison-section">
          <h2 className="comparison-title">{t("Plans")}</h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th></th>
                <th>{t("Free Plan")}</th>
                <th>{t("Premium Plan")}</th>
              </tr>
            </thead>
            <tbody>
              {daily_plans?.length > 0 &&
                <tr className="price-row">
                  <th>{t("Daily Fee (Tax Included)")}</th>
                  {plans?.map((plan) => (
                    plan?.interval === 'day' ? (<td key={plan.id}>{getCurrencySign(plan?.currency.toUpperCase())} {parseInt(plan.amount)}</td>) : (<td key={plan.id}>-</td>)
                  ))}
                </tr>
              }
              {weekly_plans?.length > 0 &&
                <tr className="price-row">
                  <th>{t("Weekly Fee (Tax Included)")}</th>
                  {plans?.map((plan) => (
                    plan?.interval === 'week' ? (<td key={plan.id}>{getCurrencySign(plan?.currency.toUpperCase())} {parseInt(plan.amount)}</td>) : (<td key={plan.id}>-</td>)
                  ))}
                </tr>
              }
              {monthly_plans?.length > 0 &&
                <tr className="price-row">
                  <th>{t("Monthly Fee (Tax Included)")}</th>
                  {plans?.map((plan) => (
                    plan?.interval === 'month' ? (<td key={plan.id}>{getCurrencySign(plan?.currency.toUpperCase())} {parseInt(plan.amount)}</td>) : (<td key={plan.id}>-</td>)
                  ))}
                </tr>
              }
              {yearly_plans?.length > 0 &&
                <tr className="price-row">
                  <th>{t("Yearly Fee (Tax Included)")}</th>
                  {plans?.map((plan) => (
                    plan?.interval === 'year' ? (<td key={plan.id}>{getCurrencySign(plan?.currency.toUpperCase())} {parseInt(plan.amount)}</td>) : (<td key={plan.id}>-</td>)
                  ))}
                </tr>
              }
              <tr>
                <th>{t("Upload Limit (Per Account)")}</th>
                <td>{t("Up to 5 images")}</td>
                <td>{t("Unlimited")}</td>
              </tr>
              <tr>
                <td></td>
                {plans?.map((plan) => (
                  plan.amount > 0 ? (
                    <td key={plan.id} className='comparison-table__upgrade-button-container'>
                      <button
                        className={`subscription-button ${isSubscribed && plan.id === activePlanId ? 'cancel' : 'upgrade'}`}
                        onClick={() => isSubscribed && plan.id === activePlanId ? handleCancel() : handleUpgrade(plan.id)}
                      >
                        {isSubscribed && plan.id === activePlanId ? t('Cancel Subscription') : t('Select This Plan')}
                      </button>
                    </td>
                  ) : <td key={plan.id} className='comparison-table__upgrade-button-container'></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;
