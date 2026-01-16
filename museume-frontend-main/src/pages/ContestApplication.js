import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import ContestApplyModal from '../components/ContestApplicationModal';
import GallerySelectionModal from '../components/GallerySelectionModal';
import { getContestDetail } from '../redux/slices/contestSlice';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import { useNavigate } from 'react-router-dom';

const ContestApplyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { contestId } = location.state || {};
  const { contestDetail, isLoading } = useSelector((state) => state.contest);
  const { works } = useSelector((state) => state.work);
  const { t } = useTranslation(); // Use the translation function

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [childTokenExists, setChildTokenExists] = useState(false);

  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  useEffect(() => {
    if (contestId) {
      dispatch(getContestDetail(contestId));
    }
     // Check if child_token exists in localStorage
     const childToken = localStorage.getItem('child_token');
     setChildTokenExists(!!childToken); // Convert to boolean
  }, [dispatch, contestId]);

  const handleGallerySelect = (work) => {
    if (selectedWork?.id === work.id) {
      setSelectedWork(null); // Deselect if the same work is clicked again
    } else {
      setSelectedWork(work);
    }
    // Handle the selected work submission
  };

  if (isLoading || !contestDetail) {
    return <div>{t('Loading...')}</div>;
  }

  const handleImageClick = (work_id) => {
    navigate(`/gallery-detail/${work_id}`);
  };

  return (
    <>
      <Navigation />
      <div className="apply-contest-container">
        <div className="apply-contest-card">
          <div className="apply-contest-layout">
          <div className="contest-detail-image-section">
            <img 
              src={contestDetail.thumbnail}
              alt={contestDetail.title}
              className="contest-detail-image"
            />
          </div>
            
            <div className="apply-contest-content">
              <div className="apply-contest-user-info">
                <img 
                  src={contestDetail?.user?.profile_picture}
                  alt={contestDetail?.user?.username}
                  className="apply-contest-user-avatar"
                />
                <span className="apply-contest-username">{contestDetail?.user?.username}</span>
              </div>
              
              <h1 className="apply-contest-title">
                {contestDetail.name}
              </h1>
              
              <p className="apply-contest-duration" style={{marginBottom: '32px', fontWeight: 'bold'}}>
                {formatDate(contestDetail.start_date)} - {formatDate(contestDetail.end_date)}
              </p>
              {childTokenExists && (
                <div className="apply-contest-button-group">
                  <button 
                    onClick={() => setIsGalleryModalOpen(true)}
                    className="apply-contest-button apply-contest-button-primary"
                  >
                    {t('Apply through My Gallery')}
                  </button>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)} 
                    className="apply-contest-button apply-contest-button-outline"
                  >
                    {t('Upload and submit your work')}
                  </button>
                </div>
              )}

              <div className="apply-contest-description">
                {contestDetail.explanation.split('\r\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>

              <div className="apply-contest-eligibility">
                <h3 className="apply-contest-eligibility-title" style={{fontWeight: 'bold'}}>
                  {t('Eligibility for Application')}
                </h3>
                <div className="apply-contest-eligibility-text">
                  {contestDetail.eligibility_criteria.split('\r\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <ContestApplyModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          contestId={contestId}
        />

        {/* Gallery Selection Modal */}
        <GallerySelectionModal 
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          works={works?.results}
          onSelect={handleGallerySelect}
          contestId={contestId}
        />
         {contestDetail.entry_history && contestDetail.entry_history.length > 0 && (
          <div className="entry-history-section">
            <h2 className="entry-history-title">{t('Entry history for this contest')}</h2>
            <div className="entry-history-slider">
              {contestDetail.entry_history.slice(0, 5).map((entry) => (
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
                    {formatDate(entry.submission_date)}
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

export default ContestApplyPage;
