import React, { useEffect } from 'react';
import { Heart } from 'lucide-react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getContestDetail } from '../redux/slices/contestSlice';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import { useNavigate } from 'react-router-dom';

const ContestDetail = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Use the translation function
  const dispatch = useDispatch();
  const { contestDetail, isLoading } = useSelector((state) => state.contest);
  const location = useLocation();
  const { contestId } = location.state || {};
  useEffect(() => {
    if (contestId) {
      dispatch(getContestDetail(contestId));
    }
  }, [dispatch, contestId]);

  if (isLoading || !contestDetail) {
    return <div>{t('Loading...')}</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleImageClick = (work_id) => {
    navigate(`/gallery-detail/${work_id}`);
  };

  return (
    <>
      <Navigation />
      <div className="contest-detail-container">
        <h1 className="contest-detail-main-title">{t('Contest Details')}</h1>

        <div className="contest-detail-content">
          <div className="contest-detail-image-section">
            <img 
              src={contestDetail.thumbnail}
              alt={contestDetail.title}
              className="contest-detail-image"
            />
          </div>

          <div className="contest-detail-info">
            <div className="contest-detail-user">
              <img 
                src={contestDetail?.user?.profile_picture}
                alt={contestDetail?.user?.username}
                className="contest-detail-user-avatar"
              />
              <span className="contest-detail-username">
                {contestDetail?.user?.username}
              </span>
            </div>

            <h2 className="contest-detail-title">{contestDetail.title}</h2>
            <div className="contest-detail-dates">
              <p className="contest-detail-date">
                <span className="date-label">{t('Start Date')}: </span>
                {formatDate(contestDetail.start_date) || t('Date not available')}
              </p>
              <p className="contest-detail-date">
                <span className="date-label">{t('End Date')}: </span>
                {formatDate(contestDetail.end_date) || t('Date not available')}
              </p>
            </div>

            <div className="contest-detail-description">
              {contestDetail.description}
            </div>

            <div className="contest-detail-eligibility">
              <h3>{t('Eligibility for Application')}</h3>
              <p>{contestDetail.eligibility}</p>
            </div>

            <div className="contest-detail-entry">
              <h3>{t('Entry history for this contest')}</h3>
              {/* Entry history content */}
            </div>
          </div>
        </div>
        {contestDetail.entry_history && contestDetail.entry_history.length > 0 && (
          <div className="entry-history-section">
            <h2 className="entry-history-title">{t('Entry history for this contest')}</h2>
            <div className="entry-history-slider">
              {contestDetail.entry_history.map((entry) => (
                <div key={entry.id} className="entry-history-item" onClick={() => handleImageClick(entry.work_id)}>
                  {entry.image ? (
                    <img 
                      src={entry.image} 
                      alt={entry.title} 
                      className="entry-history-image"
                    />
                  ) : (
                    <div className="entry-history-image-placeholder" />
                  )}
                  <h3 className="entry-history-work-title">
                    {entry.title}
                  </h3>
                  <p className="entry-history-date">
                    {formatDate(entry.submission_date) || t('Date not available')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ContestDetail;
