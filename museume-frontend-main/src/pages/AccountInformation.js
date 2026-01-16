import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { getAccountInfo, updateAccountInfo, getProfiles, deleteAccount } from '../redux/slices/userSlice';
import Navigation from './Navigation';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import { X } from 'lucide-react';  // Add this import

const AccountInformation = () => {
  const { t } = useTranslation(); // Use the translation function
  const dispatch = useDispatch();
  const accountInfo = useSelector((state) => state.user.accountInfoRes);
  const sharedProfiles = useSelector((state) => state.user.profilesRes);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  useEffect(() => {
    dispatch(getAccountInfo());
    dispatch(getProfiles());
  }, [dispatch]);
  // Validation Schema
  const validationSchema = Yup.object({
    first_name: Yup.string()
      .required(t('Name is required'))
      .min(2, t('Name must be at least 2 characters')),
    address: Yup.string()
      .required(t('Current address is required')),
    email: Yup.string()
      .email(t('Invalid email format'))
      .required(t('Email is required')),
    password: Yup.string()
      .test('is-modified', t('Password must be at least 8 characters, include one uppercase letter, and one number'), function (value) {
        if (!value || value === '****************') {
          return true; // Skip validation if unchanged
        }
        return /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/.test(value);
      }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      first_name: accountInfo?.first_name || '',
      address: accountInfo?.address || '',
      email: accountInfo?.email || 'sample@gmail.com',
      password: '****************',
    },
    validationSchema,
    onSubmit: (values) => {
      const updatedValues = { ...values };
  
      // Remove password field if it hasn't been changed
      if (updatedValues.password === '****************') {
        delete updatedValues.password;
      }
  
      console.log(updatedValues);
      dispatch(updateAccountInfo(updatedValues));
    },
  });

  return (
    <>
      <Navigation />
      <div className="info-container">
        <h1 className="info-title">{t('Account Information')}</h1>
        
        <form onSubmit={formik.handleSubmit} className="info-form">
          <div className="info-form-group">
            <label className="info-label">{t('Name')}</label>
            <input
              type="text"
              {...formik.getFieldProps('first_name')}
              className={`info-input ${formik.touched.first_name && formik.errors.first_name ? 'info-input-error' : ''}`}
            />
            {formik.touched.first_name && formik.errors.first_name && (
              <div className="info-error">{formik.errors.first_name}</div>
            )}
          </div>

          <div className="info-form-group">
            <label className="info-label">{t('Current Address')}</label>
            <input
              type="text"
              {...formik.getFieldProps('address')}
              className={`info-input ${formik.touched.address && formik.errors.address ? 'info-input-error' : ''}`}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="info-error">{formik.errors.address}</div>
            )}
          </div>

          <div className="info-form-group">
            <label className="info-label">{t('Email Address')}</label>
            <input
              type="email"
              {...formik.getFieldProps('email')}
              className={`info-input ${formik.touched.email && formik.errors.email ? 'info-input-error' : ''}`}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="info-error">{formik.errors.email}</div>
            )}
          </div>

          <div className="info-form-group">
            <label className="info-label">{t('(computer) password')}</label>
            <input
              type="password"
              {...formik.getFieldProps('password')}
              className={`info-input ${formik.touched.password && formik.errors.password ? 'info-input-error' : ''}`}
            />
            <div className="info-error">{formik.errors.password}</div>
            <button type="button" className="info-change-password">
              {t('Change Password')}
              <span className="info-change-label">{t('change')}</span>
            </button>
          </div>

          <div className="info-shared-users">
            <label className="info-label">{t('Shared users')}</label>
            <div className="info-users-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
              {sharedProfiles && sharedProfiles.map((user) => (
                <div key={user.id} className="info-user-item">
                  <div className={`info-user-avatar ${!user.profile_picture ? 'info-user-initial' : ''}`}>
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt={user.username} />
                    ) : (
                      <span>{user.initial}</span>
                    )}
                  </div>
                  <span className="info-username">{user.username}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="info-save-button">
            {t('Save Information')}
          </button>
          <button type="button" className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>{t("Delete Account")}</button>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
              <X size={18} />
            </button>
            <h3>{t('Delete Account')}</h3>
            <p>{t('Are you sure you want to delete this account?')}</p>
            
            <div className="delete-confirm-checkbox">
              <input
                type="checkbox"
                id="confirm-delete"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
              />
              <label htmlFor="confirm-delete">{t('I understand that this action cannot be undone')}</label>
            </div>

            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>{t('Cancel')}</button>
              <button
                className="delete-confirm"
                onClick={() => {
                  dispatch(deleteAccount()).then(() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  });
                }}
                disabled={!deleteConfirmed}
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
 </>
  );
};

export default AccountInformation;
