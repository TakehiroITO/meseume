import React, { useEffect, useState } from "react";
import { ReactComponent as PlusIcon } from '../assets/images/plus-icon.svg'; // You will need an SVG plus icon
import Navigation from "./Navigation";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAccountInfo, getProfiles, childProfileLogin } from '../redux/slices/userSlice';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const AddUserScreen = () => {
  const { t } = useTranslation(); // Use the translation function
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profilesRes } = useSelector((state) => state.user);
  const accountInfo = useSelector((state) => state.user.accountInfoRes);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    // Check if child token exists in localStorage
    const childToken = localStorage.getItem('child_token');
    if (childToken) {
      navigate('/my-work');
      return;
    }
    dispatch(getAccountInfo());
    dispatch(getProfiles());
  }, [dispatch, navigate]);

  // Function to generate initials from the email or name
  const generateInitials = (name) => {
    return name.charAt(0);
  };

  // Function to get alternating color
  const getAlternatingColor = (index) => {
    const colors = ['#58B806', '#9769ED'];
    return colors[index % colors.length];
  };

  // Function to handle child login
  const handleChildLogin = async (profile) => {
    try {
      setSelectedProfile(profile.id);
      // Add a slight delay to show the selection effect before navigation
      setTimeout(async () => {
        await dispatch(childProfileLogin({ username: profile.username })).unwrap();
        navigate('/my-work');
      }, 300);
    } catch (error) {
      console.error('Failed to login as child:', error);
      setSelectedProfile(null);
    }
  };

  return (
    <>
      <Navigation />

      {profilesRes && profilesRes?.length > 0 ? (
        <div className="user-selection-screen">
          <div className="user-profile-container">
            <p className="profile-name" style={{marginRight: "5px"}}>{accountInfo?.email}{t(" is logged in")}</p>
          </div>

          <h3 className="select-add-user-text">{t('Select or add users')}</h3>

          <div className="user-list">
            {profilesRes.map((profile, index) => (
              <div 
                key={profile.id} 
                className={`user-item ${selectedProfile === profile.id ? 'selected' : ''}`}
                onClick={() => handleChildLogin(profile)}
                style={{
                  transform: selectedProfile === profile.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  border: selectedProfile === profile.id ? '2px solid #5E81AC' : 'none',
                  boxShadow: selectedProfile === profile.id ? '0 0 10px rgba(94, 129, 172, 0.5)' : 'none'
                }}
              >
                <div className="profile-picture-container">
                  {profile.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt={profile.username}
                      className="child-profile-picture"
                    />
                  ) : (
                    <div
                      className="initials-container"
                      style={{ backgroundColor: getAlternatingColor(index) }}
                    >
                      {generateInitials(profile.username)}
                    </div>
                  )}
                </div>
                <p className="child-name">{profile.username}</p>
              </div>
            ))}

            {/* Add new user button */}
            <div className="user-item add-user-button" onClick={() => navigate('/register-user')}>
              <div className="add-user-button">
                <PlusIcon className="plus-icon" />
              </div>
              {/* <p className="add-user-text">{t('Add new user')}</p> */}
            </div>
          </div>
        </div>
      ) : (
        <div className="user-info-container">
          <h2 className="user-info-title">{t('Then enter your user information.')}</h2>

          <div className="add-user-button" onClick={() => navigate('/register-user')}>
            <PlusIcon className="plus-icon" />
          </div>

          <p className="add-user-text">{t('Adding new users')}</p>
        </div>
      )}
    </>
  );
};

export default AddUserScreen;
