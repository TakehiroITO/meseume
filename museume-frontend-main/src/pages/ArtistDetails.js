import React from 'react';
import Navigation from './Navigation';

const ArtistClassDetail = () => {
  return (
    <>
      <Navigation />
      <div className="artist-detail-container">
        <h1 className="artist-detail-title">Artist Class</h1>
        
        <div className="artist-detail-content">
          <div className="artist-detail-left">
            <div className="artist-detail-image-container">
              <img 
                src="http://127.0.0.1:8000/media/works/eye.jpeg" 
                alt="Learn to Draw with watercolours!" 
                className="artist-detail-image"
              />
              <div className="artist-detail-image-title">
                Learn to Draw with watercolours!
              </div>
            </div>
          </div>

          <div className="artist-detail-right">
            <div className="artist-detail-user">
              <img 
                src="/path-to-avatar.jpg"
                alt="user avatar"
                className="artist-detail-user-avatar"
              />
              <span className="artist-detail-username">user_name_dayo</span>
            </div>

            <h2 className="artist-detail-video-title">
              Video title. The title of the video. The title of the video. The title of the video.
            </h2>

            <div className="artist-detail-description">
              <p>
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work.
              </p>
              
              <p>
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work.
              </p>
              
              <p>
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work
                Description of the work Description of the work.
              </p>
            </div>

            <div className="artist-detail-meta">
              <div className="artist-detail-section">
                <h3>tag</h3>
                <div className="artist-detail-tags">
                  <span className="artist-detail-tag">cute</span>
                  <span className="artist-detail-tag">colorful</span>
                  <span className="artist-detail-tag">animal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtistClassDetail;
