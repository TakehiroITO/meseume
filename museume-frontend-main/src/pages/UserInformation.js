import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile, getAllOrganizations, getProfiles, getOrganizationCode, deleteProfile } from '../redux/slices/userSlice';
import Navigation from './Navigation';
import { X } from 'lucide-react';  // Add this import
import { useTranslation } from 'react-i18next'; // Add this import
import { useNavigate } from 'react-router-dom';

const UserInformation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // <-- Initialize the navigation hook
  const profileInfo = useSelector((state) => state.user.profileRes);
  const organizations = useSelector((state) => state.user.allOrganizationsRes);
  const profiles = useSelector((state) => state.user.ProfilesRes);
  const organizationCode = useSelector((state) => state.user.organizationCodeRes);
  
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [profileOptions, setProfileOptions] = useState([]);
  const [sharedStatuses, setSharedStatuses] = useState({});
  const [organizationCodeInput, setOrganizationCodeInput] = useState('');
  const [organizationCodeValid, setOrganizationCodeValid] = useState(null); // Added to track organization code validity

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const handleDeleteClick = (e, profile) => {
    e.stopPropagation();
    setProfileToDelete(profile);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmed) {
      await dispatch(deleteProfile(profileToDelete.id)).unwrap();
      setShowDeleteConfirm(false);
      setProfileToDelete(null);
      setDeleteConfirmed(false);
      localStorage.removeItem('child_token');
      localStorage.removeItem('child_refresh_token');
      navigate('/login');
    }
  };

  const { t } = useTranslation(); // Use translation

  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return ageDate.getUTCFullYear() - 1970;
  };

  useEffect(() => {
    dispatch(getProfile());
    dispatch(getAllOrganizations());
    dispatch(getProfiles());
  }, [dispatch]);

  useEffect(() => {
    if (organizations) {
      setOrganizationOptions(organizations);
    }
  }, [organizations]);

  useEffect(() => {
    if (profiles) {
      setProfileOptions(profiles);
    }
  }, [profiles]);

  useEffect(() => {
    if (profileInfo?.organizations) {
      setSelectedOrgs(profileInfo.organizations);
    }
    if (profileInfo?.shared_users) {
      setSelectedProfiles(profileInfo.shared_users);
    }
  }, [profileInfo]);

  useEffect(() => {
    if (profileInfo?.shared_users) {
      const initialStatuses = {};
      profileInfo.shared_users.forEach(user => {
        initialStatuses[user.id] = user.is_shared;
      });
      setSharedStatuses(initialStatuses);
    }
  }, [profileInfo]);

  useEffect(() => {
    if (organizationCodeInput.length === 6) {
      dispatch(getOrganizationCode(organizationCodeInput));
    }
  }, [organizationCodeInput, dispatch]);

  useEffect(() => {
    if (organizationCode) {
      if (organizationCode.id) {
        const isAlreadyAdded = selectedOrgs.some(org => org.id === organizationCode.id);
        if (!isAlreadyAdded) {
          const updatedOrgs = [...selectedOrgs, organizationCode];
          setSelectedOrgs(updatedOrgs);
          formik.setFieldValue('organizations', updatedOrgs);
        }
        setOrganizationCodeValid(true); // Mark organization code as valid
      } else {
        setOrganizationCodeValid(false); // Mark organization code as invalid
      }
    }
  }, [organizationCode]);

  // Handle toggle changes
  const handleShareToggle = (profileId) => {
    setSharedStatuses(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  const validationSchema = Yup.object({
    username: Yup.string().required(t('Username is required')),
    date_of_birth: Yup.date().required(t('Date of Birth is required')).test(
      'age',
      t('You must be at least 0 years old'),
      value => calculateAge(value) >= 0
    ),
    organizations: Yup.array().min(0, t('At least one organization is required')),
    shared_users: Yup.array()
  });

  const formik = useFormik({
    initialValues: {
      username: profileInfo?.username || 'user_name_dayo',
      date_of_birth: profileInfo?.date_of_birth || '',
      organizations: profileInfo?.organizations || [],
      shared_users: profileInfo?.shared_users || [],
      is_published: Boolean(profileInfo?.is_published),
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const sharedUserIds = selectedProfiles
          .filter((profile) => sharedStatuses[profile.id])
          .map((profile) => profile.id);
  
        // For adding new organization
        await dispatch(
          updateProfile({
            ...values,
            organizations: selectedOrgs.map(org => org.id),
            shared_users: sharedUserIds,
          })
        ).unwrap();
        // navigate('/public-gallery');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
  });

  const handleOrgSelect = (e) => {
    const selectedOrgId = e.target.value;
    const selectedOrg = organizations.find(org => org.id === Number(selectedOrgId));
    
    if (selectedOrg && !selectedOrgs.find(org => org.id === selectedOrg.id)) {
      const newOrgs = [...selectedOrgs, selectedOrg];
      setSelectedOrgs(newOrgs);
      formik.setFieldValue('organizations', newOrgs);
    }
    e.target.value = ''; // Reset select
  };

  const removeOrg = (orgId) => {
    const newOrgs = selectedOrgs.filter(org => org.id !== orgId);
    setSelectedOrgs(newOrgs);
    formik.setFieldValue('organizations', newOrgs);
  };

  const handleProfileSelect = (e) => {
    const selectedProfileId = e.target.value;
    const selectedProfile = profiles.find(profile => profile.id === Number(selectedProfileId));

    if (selectedProfile && !selectedProfiles.find(profile => profile.id === selectedProfile.id)) {
      const newProfiles = [...selectedProfiles, selectedProfile];
      setSelectedProfiles(newProfiles);
      formik.setFieldValue('shared_users', newProfiles);
    }
    e.target.value = ''; // Reset select
  };

  const removeProfile = (profileId) => {
    const newProfiles = selectedProfiles.filter(profile => profile.id !== profileId);
    setSelectedProfiles(newProfiles);
    formik.setFieldValue('shared_users', newProfiles);
  };

  const maxDate = new Date();

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 225);

  return (
    <>
      <Navigation />
      <div className="user-info-container-view">
        <h1 className="user-info-title">{t('User Information')}</h1>
        
        <form onSubmit={formik.handleSubmit} className="user-info-form">
          <div className="user-info-form-group">
            <label className="user-info-label">{t('Username')}</label>
            <input
              type="text"
              {...formik.getFieldProps('username')}
              className="user-info-input"
            />
          </div>

          <div className="user-info-form-group">
            <label className="user-info-label">{t('Date of Birth')}</label>
            <input
              type="date"
              {...formik.getFieldProps('date_of_birth')}
              className="user-info-input"
              max={maxDate.toISOString().split('T')[0]}
              min={minDate.toISOString().split('T')[0]}
            />
            {formik.values.date_of_birth && (
              <div className="user-info-age">
                {t('Age')}: {calculateAge(formik.values.date_of_birth)} {t('years old')}
              </div>
            )}
          </div>

          {/* <div className="user-info-form-group">
            <label className="user-info-label">{t('Publish Settings')}</label>
            <div className="user-info-toggles">
              <div className="toggle-group">
                <label className="switch">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps('is_published')}
                    checked={formik.values.is_published}
                  />
                  <span className="slider"></span>
                </label>
                <div className="publish-status">
                  {formik.values.is_published ? t('is published') : t('not published')}
                </div>
              </div>
            </div>
          </div> */}

          <div className="user-info-form-group">
            <label className="user-info-label">{t('Organizations to which you belong')}</label>
            <div className="user-info-org-container">
              <input
                type="text"
                placeholder={t('Enter organization code')}
                className="user-info-input"
                value={organizationCodeInput}
                onChange={(e) => setOrganizationCodeInput(e.target.value)}
              />
              <div className="user-info-org-tags">
                {selectedOrgs.map((org) => (
                  <div key={org.id} className="user-info-org-tag">
                    <span>{org.name}</span>
                    <button
                      type="button"
                      onClick={() => removeOrg(org.id)}
                      className="user-info-org-remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {organizationCodeValid === false && (
                <div className="user-info-error">{t('Organization code is not valid')}</div>
              )}
              {organizationCodeValid === null && organizationCodeInput.length === 6 && (
                <div className="user-info-error">{t('Organization code must be 6 digits')}</div>
              )}
            </div>
          </div>

          <div className="user-info-form-group">
            <label className="user-info-label">{t('Shared range')}</label>
            <div className="user-info-profile-container">
              <div className="shared-users-grid">
                {selectedProfiles.map((profile) => (
                  <div key={profile.id} className="shared-user-card">
                    <div className="shared-user-avatar">
                      {profile.profile_picture ? (
                        <img src={profile.profile_picture} alt={profile.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="shared-user-name">{profile.username}</div>
                    <div className="shared-user-toggle">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={sharedStatuses[profile.id] || false}
                          onChange={() => handleShareToggle(profile.id)}
                        />
                        <span className="slider"></span>
                      </label>
                      <span className={`toggle-label ${sharedStatuses[profile.id] ? 'active' : ''}`}>
                        {sharedStatuses[profile.id] ? t('Shared') : t('Not Shared')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="user-info-save-button">{t('Save')}</button>
        </form>
        <button className="delete-btn" onClick={(e) => handleDeleteClick(e, profileInfo)}>{t("Delete the profile")}</button>
        {showDeleteConfirm && (
          <div className="delete-modal">
            <div className="delete-modal-content">
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
                <X size={18} />
              </button>
              <h3>{t('Delete Profile')}</h3>
              <p>{t('Are you sure you want to delete this profile?')}</p>
              
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
                  onClick={handleDeleteConfirm}
                  disabled={!deleteConfirmed}
                >
                  {t('Delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserInformation;
