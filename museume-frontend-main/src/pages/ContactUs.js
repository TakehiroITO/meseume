import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Navigation from './Navigation';
import { useTranslation } from 'react-i18next';
import { inquiryApi } from '../api/inquiryApi';
import { fetchData } from '../api/fetchHelpers';

const ContactUs = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const [userInfo, setUserInfo] = useState({ email: '', username: '' });

  // ユーザー情報取得を無効化（バックエンドで自動設定）
  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     if (token) {
  //       try {
  //         const response = await fetchData('/api/account-info/');
  //         setUserInfo({
  //           email: response.email || '',
  //           username: response.username || response.first_name || ''
  //         });
  //       } catch (error) {
  //         console.error('Error fetching user info:', error);
  //       }
  //     }
  //   };

  //   fetchUserInfo();
  // }, [token]);

  const validationSchema = Yup.object().shape({
    subject: Yup.string().required(t('Subject is required')),
    inquiryDetails: Yup.string()
      .required(t('Inquiry details are required'))
      .min(10, t('Please provide more details')),
    ...(!token ? {
      email: Yup.string()
        .email(t('Invalid email address'))
        .required(t('Email is required')),
      fullName: Yup.string().required(t('Full name is required')),
    } : {})
  });

  const formik = useFormik({
    initialValues: {
      subject: '',
      inquiryDetails: '',
      ...(token ? {} : { email: '', fullName: '' }),
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const payload = {
        subject: values.subject,
        inquiry_message: values.inquiryDetails,
        ...(!token ? {
          user_email: values.email,
          user_name: values.fullName
        } : {}),
      };

      try {
        await inquiryApi(payload);
        window.location.href = `/inquiry-thank-you`;
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <>
      <Navigation />
      <div className="contact-container">
        <h1 className="contact-title">{t('Contact Us')}</h1>
        <p className="centered-text">下記内容をご記入の上送信してください。<br />３〜５営業日以内に担当者よりメールにてご連絡させていただきます。</p>

        <form onSubmit={formik.handleSubmit} className="contact-form">
          <div className="contact-form-group">
            <label className="contact-label">{t('Subject')}</label>
            <input
              type="text"
              placeholder={t('Please fill in the subject line')}
              {...formik.getFieldProps('subject')}
              className={`contact-input ${
                formik.touched.subject && formik.errors.subject
                  ? 'contact-input-error'
                  : ''
              }`}
            />
            {formik.touched.subject && formik.errors.subject && (
              <div className="contact-error">{formik.errors.subject}</div>
            )}
          </div>

          {!token && (
            <>
              <div className="contact-form-group">
                <label className="contact-label">{t('Email')}</label>
                <input
                  type="email"
                  placeholder={t('Please enter your email')}
                  {...formik.getFieldProps('email')}
                  className={`contact-input ${
                    formik.touched.email && formik.errors.email
                      ? 'contact-input-error'
                      : ''
                  }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="contact-error">{formik.errors.email}</div>
                )}
              </div>

              <div className="contact-form-group">
                <label className="contact-label">{t('Full Name')}</label>
                <input
                  type="text"
                  placeholder={t('Please enter your full name')}
                  {...formik.getFieldProps('fullName')}
                  className={`contact-input ${
                    formik.touched.fullName && formik.errors.fullName
                      ? 'contact-input-error'
                      : ''
                  }`}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <div className="contact-error">{formik.errors.fullName}</div>
                )}
              </div>
            </>
          )}

          <div className="contact-form-group">
            <label className="contact-label">{t('Inquiry Details')}</label>
            <textarea
              placeholder={t('Please enter your inquiry here')}
              {...formik.getFieldProps('inquiryDetails')}
              className={`contact-textarea ${
                formik.touched.inquiryDetails && formik.errors.inquiryDetails
                  ? 'contact-input-error'
                  : ''
              }`}
            />
            {formik.touched.inquiryDetails && formik.errors.inquiryDetails && (
              <div className="contact-error">{formik.errors.inquiryDetails}</div>
            )}
          </div>

          <button type="submit" className="contact-submit">
            {t('Submit')}
          </button>
        </form>
      </div>
    </>
  );
};

export default ContactUs;
