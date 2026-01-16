import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navigation from './Navigation';
import { getPublicWorks } from '../redux/slices/workSlice';
import { getAdvertisement } from '../redux/slices/billingSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Howto1 from '../assets/images/Howto1.png';
import Howto2 from '../assets/images/Howto2.png';
import Howto3 from '../assets/images/Howto3.png';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { publicWorks, isLoading } = useSelector((state) => state.work);
  const { advertisements } = useSelector((state) => state.billing);
  const [allWorks, setAllWorks] = useState([]);


  const duplicatedWorks = [...allWorks, ...allWorks, ...allWorks, ...allWorks, ...allWorks, ...allWorks,  ...allWorks,  ...allWorks, ...allWorks, ...allWorks, ...allWorks, ...allWorks, ...allWorks, ...allWorks, ...allWorks,  ...allWorks,  ...allWorks, ...allWorks, ...allWorks];

  useEffect(() => {
    
    dispatch(getPublicWorks({ page: 1 }));
    dispatch(getAdvertisement());
  }, [dispatch]);

  useEffect(() => {
    if (publicWorks?.results) {
      setAllWorks(publicWorks.results.filter(work => work.images_data.length > 0));
    }
  }, [publicWorks]);

  const handleImageClick = (work) => {
    navigate(`/gallery-detail/${work?.id}`);
  };



  useEffect(() => {
    let animationFrame;

    const animate = () => {
      if (!isHovered) {
        setScrollPosition(prev => {
          const newPosition = prev + 0.5;
          return newPosition;
        });
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isHovered, allWorks.length]);
  return (
    <>
      <Navigation />
      <div className="landing-container">
        <img src="/assets/LineShape1.svg" alt="Curve 1" className="feature-svg-1"/>
        <img src="/assets/LineShape2.svg" alt="Curve 1" className="feature-svg-2"/>
        {/* Header Section */}
        <div className="header">
          <img src="/assets/MuseumLogo.svg"  className="img-fluid-land" alt="museume" style={{width: '900px'}} />
        </div>

        {/* Film Strip */}
        <div className="film-strip-container">
      <div 
        className="film-strip-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="film-strip"
          style={{ 
            transform: `translateX(-${scrollPosition}px)`,
          }}
        >
          {duplicatedWorks.map((work, index) => (
            <div
              key={`${work.id}-${index}`}
              className="film-frame"
              onClick={() => handleImageClick(work)}
            >
              <img
                src={work.images_data[0].image_url}
                alt={work.title}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
        {/* Features Section */}
        <div className="features">
          <div className="feature-item">
            <div className="feature-frame square">
              <div className="frame-border">
                {/* <div className="image-placeholder">{t('Image')}</div> */}
              </div>
            </div>
            <div className="feature-text">
              <div className="feature-title pink" style={{marginLeft: '-35px'}}>
                {t('You can share your creations with your family, friends,')}<br />
                {t(' and even people all over the world.')}
              </div>
              <div className="feature-description" style={{marginLeft: '-35px'}}>
                {t("Even people who have never been there or don't speak the language may like your art!")}<br />
              </div>
            </div>
          </div>

          <div className="feature-item right">
            <div className="feature-frame oval">
              {/* <div className="image-placeholder">{t('Image')}</div> */}
            </div>
            <div className="feature-text">
              <div className="feature-title" style={{color: '#7b59a5'}}>
                {t('Create Your Own Secret Art Gallery')}
              </div>
              <div className="feature-description">
                {t('You can create your own "my museum" by collecting works created by others!')}<br />
              </div>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-frame fancy">
              {/* <div className="image-placeholder">{t('Image')}</div> */}
            </div>
            <div className="feature-text" style={{ marginTop: '-40px' }}>
              <div className="feature-title" style={{color: '#0099d4'}}>
                {t('Learn your favorite genre of art from domestic and international artists!')}<br />
              </div>
              <div className="feature-description" style={{ marginTop: '-15px' }}>
                {t("You can further improve your art skills with online classes and archive classes!")}<br />
              </div>
            </div>
          </div>

          <div className="feature-item right">
            <div className="feature-frame dotted">
              {/* <div className="image-placeholder">{t('Image')}</div> */}
            </div>
            <div className="feature-text">
              <div className="feature-title" style={{color: '#1aaea4'}}>
                {t('Enter the contest and have your work recognized!')}
              </div>
              <div className="feature-description">
                {t('Enter your work in various types of contests!')}<br />
              </div>
            </div>
          </div>
        </div>

        {/* How To Use Section */}
        <div className="how-to-use">
      <div className="title-container">
        <img 
          src="/assets/HowToUse.svg" 
          alt={t('divider')} 
          className="divider" 
          style={{ width: '100%', height: 'auto' }}
        />
        {/* <h2 className="section-title">{t('HOW TO USE')}</h2> */}
        {/* <img 
          src="/path-to-right-divider.svg" 
          alt={t('divider')} 
          className="divider right-divider" 
        /> */}
      </div>
      <div className="subtitle">{t('How to upload and publish works')}</div>
      
      <div className="steps">
        <div className="step">
          <div className="step-frame">
            <img 
            src={Howto1} 
            alt={t('Take a photo')} 
              className="step-image"
            />
          </div>
          <div className="step-text">
            {t('Take a photo of your work!')}
            <br />
            {t('New works or old works are both OK!')}
          </div>
        </div>

        <div className="step">
          <div className="step-frame">
            <img 
            src={Howto2} 
            alt={t('Upload image')} 
              className="step-image"
            />
          </div>
          <div className="step-text">
            {t('Register for free from the buttons below')}
            <br />
            {t('and upload the image.')}
          </div>
        </div>

        <div className="step">
          <div className="step-frame">
            <img 
            src={Howto3} 
            alt={t('Publish work')} 
              className="step-image"
            />
          </div>
          <div className="step-text">
            {t("After setting 'publish',")}
            <br />
            {t('people around the world can see your work!')}
            <br />
            <span className="note">{t('* You can set time limit, limited release, etc.')}</span>
          </div>
        </div>
      </div>
    </div>

        {/* Register Button */}
        <button className="register-button" onClick={() => navigate('/register')}>
          {t('Click here to register for free')}
        </button>

        {/* Sponsorship Section */}
        <div className="sponsorship">
          <img src="/assets/Sponsorship.svg" alt={t('Sponsorship Image')} className="section-title" style={{ width: '100%' }} />
          {/* <div className="sponsor-grid">
            {advertisements?.filter(ad => ad.add_type === 'logo').map((ad, index) => (
              <div key={ad.id || index} className="sponsor-box">
                <img
                  src={ad.banner_image}
                  alt={ad.name || t(`Logo ${index + 1}`)}
                />
              </div>
            ))}
          </div> */}
          <div className="ad-banners">
            
            {advertisements?.filter(ad => ad.add_type === 'banner').map((ad, index) => (
              <div key={ad.id || index} className="ad-banner">
                <img
                  src={ad.banner_image}
                  alt={ad.name || t(`Advertisement ${index + 1}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
