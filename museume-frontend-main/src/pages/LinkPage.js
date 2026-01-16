// ZoomLink.js
import React, { useEffect, useState } from 'react';
import { MoveUpRight } from 'lucide-react';
import Navigation from './Navigation';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getArtistClassVideoUrl, getArtistClassDetail } from '../redux/slices/contestSlice';
import { useTranslation } from 'react-i18next';

const Link = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { artistClassVideoUrl, isLoading, artistDetail } = useSelector(state => state.contest);
  const [isFree, setIsFree] = useState(false);
  const [classId, setClassId] = useState(null);
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const classIdFromParams = urlParams.get('class_id');
    if (classIdFromParams) {
      setClassId(classIdFromParams);
    } else if (location.state) {
      setClassId(location.state.class_id);
      setIsFree(location.state.is_free);
    }
  }, [location]);

  useEffect(() => {
    if (classId) {
      dispatch(getArtistClassDetail(classId)).then(response => {
        if (response.payload && response.payload.member_signup && response.payload.member_signup.status === 'pending') {
          setIsPaymentPending(true);
        }
      });
    }
  }, [classId, dispatch]);

  const handleSendVideoUrl = async () => {
    if (classId && !isPaymentPending) {
      await dispatch(getArtistClassVideoUrl(classId));
    }
    if (artistClassVideoUrl) {
      console.log("artistClassVideoUrl:::::::::", artistClassVideoUrl);
      navigate(`/link-url`, { state: { artistClassVideoUrl: artistClassVideoUrl } });
    }
  };

  return (
    <>
      <Navigation />
      <div className="zoom-link-container">
        <div className="zoom-link-text">

            <h2 style={{ 
              fontSize: '24px',
              color: '#333',
              textAlign: 'center',
              margin: '20px 0',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              {isPaymentPending && !isFree ? 
                t('Payment is pending. Please complete the payment to receive the video URL.') :
                t(`The ${isFree ? 'free': 'paid'} video link has been sent to your registered email address.`)}
            </h2>
          
        </div>
      </div>
    </>
  );
};

export default Link;