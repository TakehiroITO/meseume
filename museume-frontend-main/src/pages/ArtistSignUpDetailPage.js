import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getArtistClassDetail, artistClassSignUp } from '../redux/slices/contestSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTags } from '../redux/slices/workSlice';
import { decodeToken } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';

const ArtistSignupDetail = () => {
  const dispatch = useDispatch();
  const { artistDetail, isLoading, error, signupRes } = useSelector((state) => state.contest);
  const { tags } = useSelector((state) => state.work);
  const location = useLocation();
  const { artistClassId } = location.state || {};
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false); // <-- track video loading error
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (artistClassId) {
      dispatch(getArtistClassDetail(artistClassId));
    }
  }, [dispatch, artistClassId]);

  useEffect(() => {
    if (signupRes?.artist_class) {
      navigate(`/link-detail`, { state: { is_free: artistDetail?.is_free, class_id: artistDetail?.id } });
    }
  }, [signupRes, artistDetail, navigate]);

  const handleSignup = async () => {
    try {
      const childToken = localStorage.getItem('child_token');
      const token = localStorage.getItem('token');
      if (!childToken && !token) {
        navigate(`/login`);
      }
      const decodedToken = decodeToken(childToken);
      const memberId = decodedToken.user_id;

  
      const body = {
        member: memberId,
        artist_class: artistClassId,
      };
  
      // Dispatch signup and handle response
      const response = await dispatch(artistClassSignUp(body)).unwrap();
      console.log('Signup response:', response); // Add logging
  
      if (!artistDetail.is_free) {
        if (response.payment_intent_client_secret) {
          // Navigate to payment page with all necessary data
          navigate('/payment', {
            state: {
              clientSecret: response.payment_intent_client_secret,
              paymentIntentId: response.payment_intent_id, // Add this
              amount: response.amount, // Use amount from response
              currency: response.currency,
              artistClassId: artistClassId,
              artistClassType: artistDetail.class_type,
              artistUrl: artistDetail.url,
              signupId: response.signup_id // Add this
            },
          });
        } else {
          console.error('Missing payment intent client secret');
        }
      } else {
        navigate('/my-artist-classes');
      }
      
      setShowConfirmPopup(false);
    } catch (error) {
      console.error('Artist class signup error:', error);
    }
  };

  const getTagNames = (artistClassTags) => {
    return artistClassTags.map((tagId) => tags.find((tag) => tag.id === tagId)?.name || 'Unknown Tag');
  };

  const { member_signup, class_type, thumbnail, url, name, description, status, end_date } = artistDetail || {};

  // 終了判定関数
  const isClassCompleted = () => {
    return status === 'completed' || (end_date && new Date(end_date) < new Date());
  };

  // ボタンの状態を判定する関数
  const getButtonState = () => {
    if (member_signup?.is_signed_up) {
      return { disabled: true, text: t('Already signed up') };
    }
    
    if (isClassCompleted()) {
      return { disabled: true, text: t('This class has ended') };
    }
    
    return { disabled: false, text: t('Sign up for this artist class') };
  };

  return (
    <>
      <Navigation />
      <div className="artist-sign-up-detail-container">
        <h1 className="artist-sign-up-detail-title">{t('Artist Class')}</h1>
        
        <div className="artist-sign-up-detail-content">
          <div className="artist-sign-up-detail-left">
            <div className="artist-sign-up-detail-image-wrapper">
              {/* Show ReactPlayer if user is signed up, class is recorded, and no error. 
                  Fallback to thumbnail & URL if video fails or is not available. */}
              {member_signup?.is_signed_up && !hasVideoError ? (
                // Show video player
                <ReactPlayer
                  url={url}
                  controls
                  width="640px"     // or "100%" / your preferred style
                  height="360px"    // or "100%" / your preferred style
                  onError={() => {
                    console.error('Failed to load video.');
                    setHasVideoError(true);
                  }}
                />
              ) : (
                <>
                  {/* Show thumbnail if not signed up OR an error occurred */}
                  <img
                    src={thumbnail}
                    alt={name || ''}
                    className="artist-sign-up-detail-image"
                  />
                  
                  {/* Only show URL if user *is* signed up (even in fallback mode) */}
                  {member_signup?.is_signed_up && url && (
                    <div className="artist-url-fallback">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="artist-sign-up-detail-right">
            <div className="artist-sign-up-detail-header">
              <h2 className="artist-sign-up-detail-video-title">
                {name || t('Video title. The title of the video.')}
              </h2>

              {(() => {
                const buttonState = getButtonState();
                return (
                  <button
                    className="artist-sign-up-detail-button"
                    onClick={buttonState.disabled ? undefined : () => setShowConfirmPopup(true)}
                    disabled={buttonState.disabled}
                    style={buttonState.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {buttonState.text}
                  </button>
                );
              })()}
            </div>

            <div className="artist-sign-up-detail-description">
              <p>{description}</p>
            </div>

          </div>
        </div>

        {showConfirmPopup && (
          <div className="confirm-popup-overlay">
            <div className="confirm-popup">
              <h3 className="confirm-popup-title">
                {t('Are you sure to sign up for this class?')}
              </h3>
              <div className="confirm-popup-buttons">
                <button
                  className="confirm-popup-button confirm-popup-confirm"
                  onClick={handleSignup}
                >
                  {t('Sign up')}
                </button>
                <button
                  className="confirm-popup-button confirm-popup-cancel"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArtistSignupDetail;
