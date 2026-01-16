import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getProfiles, childProfileLogin } from '../redux/slices/userSlice';
import { BASE_URL } from '../constants';
import axios from 'axios';

const Navigation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [externalLinks, setExternalLinks] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { profilesRes } = useSelector((state) => state.user);
  const [showSubUsers, setShowSubUsers] = useState(false);
  const [mainUser, setMainUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const child_token = localStorage.getItem('child_token');
    if (token && child_token) {
      dispatch(getProfiles());
    }
  }, [dispatch]);

  const toggleSubUsers = (e) => {
    e.stopPropagation();
    setShowSubUsers(!showSubUsers);
  };

  useEffect(() => {
    if (profilesRes && profilesRes.length > 0) {
      setMainUser(profilesRes.filter(profile => profile.is_logged_in == true)[0]);
    }
  }, [profilesRes]);

  // Fetch external links for navbar
  useEffect(() => {
    // const fetchNavbarLinks = async () => {
    //   try {
    //     const AUTH_URL = `${BASE_URL}`;
    //     const response = await axios.get(`${AUTH_URL}/public-navbar/`);
    //     const links = response.data.reduce((acc, item) => {
    //       acc[item.navbar_type] = item.url;
    //       return acc;
    //     }, {});
    //     setExternalLinks(links);
    //   } catch (error) {
    //     console.error('Failed to fetch navbar links:', error);
    //   }
    // };

    // fetchNavbarLinks();
  }, []);

  const toggleMobileMenu = (event) => {
    event.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const loggedOutMenuItems = [
  ];

  const generateInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?"; // Ensure valid character
  };
  
  // Function to get alternating color
  const getAlternatingColor = (username) => {
    const colors = ['#58B806', '#9769ED', '#FF5733', '#4A90E2', '#FF9800']; // Add more colors
    let sum = 0;
    for (let i = 0; i < username.length; i++) {
      sum += username.charCodeAt(i);
    }
    return colors[sum % colors.length]; // Consistent color based on username
  };

  const handleChildLogin = async (profile) => {
    try {
      localStorage.removeItem('child_token');
      localStorage.removeItem('child_refresh_token');
      await dispatch(childProfileLogin({ username: profile.username })).unwrap();
      if (location.pathname === '/my-work') {
        window.location.reload(); // Reload if already on the page
      } else {
        navigate('/my-work');
      }
    } catch (error) {
      console.error('Failed to login as child:', error);
    }
  };

  const toggleDesktopModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const renderAuthLink = () => {
    if (location.pathname === '/login') {
      return (
        <li className="nav-item position-relative">
          <a className="nav-link auth-btn" href="/register">{t('Member Registration')}</a>
        </li>
      );
    } else if (location.pathname === '/register') {
      return (
        <li className="nav-item position-relative auth-btn">
          <a className="nav-link auth-btn" href="/login">{t('Login')}</a>
        </li>
      );
    } else {
      return (
        <>
          <li className="nav-item position-absolute">
            <a className="nav-link auth-btn" href="/login">{t('Login')}</a>
          </li>
          <li className="nav-item position-absolute">
            <a className="nav-link auth-btn" href="/register">
              {t('Member Registration')}
            </a>
          </li>
        </>
      );
    }
  };

  const logout = () => {
    if (localStorage.getItem('child_token')) {
      localStorage.removeItem('child_token');
      localStorage.removeItem('child_refresh_token');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    navigate('/login');
  };

  const mainMenuItems = [
    { key: 'Search Works', path: '/public-gallery' },
    { key: 'All Contests', path: '/contest-list' },
    { key: 'Artist Class', path: '/artist-list' },
    // { key: 'About us', path: externalLinks.about || '#' },
    // { key: 'About us', path: externalLinks.about || '#' },

    // { key: 'Blog', path: externalLinks.blog || '#' },
    // { key: 'Contact Us', path: '/contact-us' },
  ];

  const userMenuItems = [
    { key: 'My Gallery', path: '/my-work' },
    { key: 'My Collection', path: '/my-collection' },
    { key: 'My Contest', path: '/my-contests' },
    { key: 'My Artist Classes', path: '/my-artist-classes' },
    { key: 'Family Gallery', path: '/family-gallery' },
    { key: 'Profile', path: '/user-info' },
    // { key: 'Artist Class', path: '/artist-list' },
    { key: 'Payment Information', path: '/account-payment-info' },
    { key: 'Account Information', path: '/account-info' },
    { key: 'Manage Users', path: '/add-user' },
    // { key: 'All Contests', path: '/contest-list' }
  ];

  const filteredUserMenuItems = localStorage.getItem('child_token') || localStorage.getItem('token')
    ? (localStorage.getItem('child_token')
      ? (localStorage.getItem('token')
        ? userMenuItems.filter(item => !['Account Information', 'Manage Users', 'Payment Information'].includes(item.key))
        : userMenuItems)
      : userMenuItems.filter(item => ['Account Information', 'Manage Users', 'Payment Information'].includes(item.key)))
    : loggedOutMenuItems;

  const renderProfileInfoBox = () => {
    if (!localStorage.getItem('token')) return null;
    if (!localStorage.getItem('child_token')) return null;

    return (
      <>
        {localStorage.getItem('token') && isMobileMenuOpen && localStorage.getItem('child_token') && (
          <div className="mobile-profile-circle" onClick={toggleSubUsers}>
            <img
              src={mainUser?.profile_picture || require('../assets/images/logo.svg').default}
              alt="profile"
            />
            {showSubUsers && (
              <div className="mobile-sub-users">
                {profilesRes?.map((profile) => (
                  <div
                    key={profile.id}
                    className="mobile-sub-user-item"
                    onClick={() => handleChildLogin(profile)}
                  >
                    <img
                      src={profile.profile_picture || require('../assets/images/logo.svg').default}
                      alt={profile.username}
                    />
                    <span>{profile.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>)
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
      setIsMobileMenuOpen(false);
    }
    if (!event.target.closest('.modal-dialog') && !event.target.closest('.desktop-hamburger')) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky-top sticky-header">
        <div className="container-fluid px-md-5">
          <nav className="navbar">
            <a className="navbar-brand" href="/">
              <img src={require('../assets/images/mwseume.png')} className="img-fluid" alt="logo" />
            </a>

            {/* Desktop Menu */}
            <div className="desktop-menu">
              <ul className="navbar-nav">
                {mainMenuItems
                  // .filter(item => !(item.key === "All Contests" && !localStorage.getItem('child_token')))
                  .map((item) => (
                    <li className="nav-item" key={item.key}>
                      <a className="nav-link active" href={item.path}>{t(item.key)}</a>
                    </li>
                  ))}
                {/* {!localStorage.getItem('token') && (
                  <li className="nav-item">
                    <a className="nav-link" href="/terms-and-services" style={{ color: '#4DB6AC' }}>{t('Terms and Services')}</a>
                  </li>
                )} */}
                {!localStorage.getItem('token') && renderAuthLink()}
                {localStorage.getItem('token') && localStorage.getItem('child_token') && (
                  <li className="nav-item">
                    <div className="user-profile-circle">
                      {mainUser?.profile_picture ? (
                        <img
                          src={mainUser.profile_picture}
                          alt={mainUser.username}
                        />
                      ) : (
                        <div
                          className="user-initial-circle"
                          style={{
                            backgroundColor: getAlternatingColor(mainUser?.username || ""),
                          }}
                        >
                      {generateInitials(mainUser?.username || "")}
                    </div>
                    )}
                      <div className="sub-users-dropdown">
                        {profilesRes?.map((profile) => ( !profile.is_logged_in &&
                          (<div
                            key={profile.id}
                            className="sub-user-item"
                            onClick={() => handleChildLogin(profile)}
                          >
                            {profile?.profile_picture ? (
                              <img
                                src={profile.profile_picture}
                                alt="profile"
                                style={{margin: '0px'}}
                              />
                            ) : (
                              <div
                                className="user-initial-circle"
                                style={{
                                  backgroundColor: getAlternatingColor(profile?.username || ""),
                                }}
                              >
                                {generateInitials(profile?.username || "")}
                              </div>
                            )}
                            <span>{profile.username}</span>
                          </div>)
                        ))}
                      </div>
                    </div>
                  </li>
                )}
                <li className="nav-item">
                  <LanguageSwitcher />
                </li>
                {localStorage.getItem('token') && (
                <li className="nav-item desktop-hamburger">
                  <a className="nav-link" href="#" onClick={toggleDesktopModal}>
                    <img src={require('../assets/images/hamburger.png')} className="img-fluid" alt="hamburger" />
                  </a>
                </li>
                )}
              </ul>
            </div>

            {localStorage.getItem('token') && localStorage.getItem('child_token') && (
              <div className="user-profile-circle-mobile" onClick={toggleSubUsers}>
                {mainUser?.profile_picture ? (
                  <img
                    src={mainUser.profile_picture}
                    alt="profile"
                  />
                ) : (
                  <div
                    className="user-initial-circle"
                    style={{
                      backgroundColor: getAlternatingColor(mainUser?.username || ""),
                    }}
                  >
                    {generateInitials(mainUser?.username || "")}
                  </div>
                )}
                <div className="sub-users-dropdown">
                  {profilesRes?.map((profile) => ( !profile.is_logged_in &&
                    (<div
                      key={profile.id}
                      className="sub-user-item"
                      onClick={() => handleChildLogin(profile)}
                    >
                      {profile?.profile_picture ? (
                        <img
                          src={profile.profile_picture}
                          alt="profile"
                        />
                      ) : (
                        <div
                          className="user-initial-circle"
                          style={{
                            backgroundColor: getAlternatingColor(profile?.username || ""),
                          }}
                        >
                          {generateInitials(profile?.username || "")}
                        </div>
                      )}
                      <span>{profile.username}</span>
                    </div>)
                  ))}
                </div>
              </div>
            )}
            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
              <div className="mobile-menu-content">
                <button className="btn-close" onClick={toggleMobileMenu} aria-label="Close">×</button>
                <LanguageSwitcher />

                {localStorage.getItem('child_token') && (
                  <div className="mobile-action-buttons">
                    <a href="/register-work" className="btn-border-green">{t('Register your work')}</a>
                  </div>
                )}
                <ul className="mobile-nav-list">
                  {[...filteredUserMenuItems, ...mainMenuItems].map((item) => (
                    <li key={item.key}>
                      <a href={item.path}>{t(item.key)}</a>
                    </li>
                  ))}
                  {!localStorage.getItem('token') && renderAuthLink()}
                  {localStorage.getItem('token') && (
                    <li>
                      <a href="#" onClick={logout}>{localStorage.getItem('child_token') ? t('Select another User') : t('Logout')}</a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Desktop Modal */}
      {isModalOpen && (
        <div className="modal show" tabIndex="-1" role="dialog" style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-scrollable modal-dialog-right" role="document">
            <div className="modal-content">
              <div className="modal-body">
                <button type="button" className="btn-close" onClick={toggleDesktopModal} aria-label="Close">×</button>
                {localStorage.getItem('child_token') && (
                  <>
                    <a href="/register-work" className="btn-border-green mb-3">{t('Register your work')}</a>
                  </>
                )}
                <div>
                  <ul>
                    {filteredUserMenuItems.map((item) => (
                      <li key={item.key}>
                        <a href={item.path}>{t(item.key)}</a>
                        <div>
                          <img src={require('../assets/images/angle-right.png')} className="img-fluid" alt="angle-right" />
                        </div>
                      </li>
                    ))}
                    {localStorage.getItem('token') && (
                      <li>
                        <a href="#" onClick={logout}>{localStorage.getItem('child_token') ? t('Select another User') : t('Logout')}</a>
                        <div>
                          <img src={require('../assets/images/angle-right.png')} className="img-fluid" alt="angle-right" />
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
