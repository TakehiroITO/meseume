import React from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from './Navigation';

const CommercialTransaction = () => {
  const { t } = useTranslation();

  return (
    <>
      <Navigation />
      <div className="terms-page">
        <div className="terms-header">
          <h1>{t('Notation Based on the Specified Commercial Transaction Act')}</h1>
        </div>
        <div className="terms-container">
          <h2>{t('Name of the Seller')}</h2>
          <p>{t('Seso Corporation')}</p>

          <h2>{t('Location')}</h2>
          <p>{t('3-11-28 Seta, Setagaya-ku, Tokyo')}</p>

          <h2>{t('Contact Information')}</h2>
          <p>{t('Phone: 050-3629-1877')}</p>
          <p>{t('Hours: 10:00 AM - 3:00 PM (excluding weekends and holidays)')}</p>
          <p>{t('Email: contact@museume.art')}</p>

          <h2>{t('Person in Charge of Operations')}</h2>
          <p>{t('Rina Tanaka')}</p>

          <h2>{t('Cancellation Policy')}</h2>
          <p>{t('Refunds cannot be issued after payment, so please ensure you fully understand the service details before making a payment.')}</p>
          <p>{t('For paid membership cancellations, please notify us via email at the address above by the 10th of the month prior to the desired cancellation month. Your cancellation will be completed upon receipt of confirmation from us. Please note that once you cancel, all data up to that point will be deleted.')}</p>

          <h2>{t('Payment Methods')}</h2>
          <p>{t('Credit Card, etc.')}</p>

          <h2>{t('Pricing')}</h2>
          <p>{t('Paid Membership: ¥110/month (including tax and fees)')}</p>
          <p>{t('Organization Membership: ¥1,980/month (including tax and fees)')}</p>
        </div>
      </div>
    </>
  );
};

export default CommercialTransaction;
