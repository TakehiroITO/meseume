// VideoPage.js
import React, { useState } from 'react';
import Navigation from "./Navigation";
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';

const VideoPage = () => {
  const [playerError, setPlayerError] = useState(false);
  const location = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const videoUrlFromParams = urlParams.get('artistClassVideoUrl');
  const videoUrl = location.state?.artistClassVideoUrl || videoUrlFromParams;
  const { t } = useTranslation();

  // Handler that is called when ReactPlayer fails to load the video
  const handleError = () => {
    setPlayerError(true);
  };

  return (
    <>
      <Navigation />
      <div className="video-page">
        <div className="video-page-container">
          <div className="video-title">
            {/* Title or other content if needed */}
          </div>
          <div className="video-wrapper">
            {/* If we have a URL and no error yet, show the ReactPlayer */}
            {videoUrl && !playerError ? (
              <ReactPlayer
                url={videoUrl}
                controls
                width="100%"
                height="100%"
                onError={handleError}  // <-- callback on video load error
              />
            ) : (
              // If there's an error, or no URL at all, show a fallback link
              <div className="meeting-link-container">
                <h3>{t('Meeting Link')}</h3>
                {videoUrl ? (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meeting-link"
                  >
                    {videoUrl}
                  </a>
                ) : (
                  <p>{t('No video URL was provided.')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPage;
