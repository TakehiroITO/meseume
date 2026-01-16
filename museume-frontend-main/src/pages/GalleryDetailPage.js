import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Download, Pencil } from 'lucide-react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getWorkDetail } from '../redux/slices/workSlice';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getProfile } from '../redux/slices/userSlice'; // Import getProfile action

const GalleryDetail = () => {
  const { t } = useTranslation(); // Use the translation function
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { workDetail } = useSelector((state) => state.work);
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profileRes);
  const { id } = useParams(); // Get ID from URL params

  const work = workDetail;
  const handleDownload = async () => {
    const zip = new JSZip();
    const timestamp = Math.floor(Date.now() / 1000);
    const folderName = `artwork_${id}_${timestamp}`;
    const folder = zip.folder(folderName);

    for (let i = 0; i < work.images_data.length; i++) {
      const imageUrl = work.images_data[i].image_url;
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        folder.file(`image_${i + 1}.jpg`, blob);
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `${folderName}.zip`);
    });
  };

  const canDownloadAndInteract = () => {
    if (!profile || !work) return false;
    // User viewing their own work
    if (profile.id === work.member.id) return true;
   
    // Check if user is a shared user with is_shared true
    return profile.shared_users.some(user => 
      user.is_shared && user.username === work.member.username
    );
   };
   

  useEffect(() => {
    if (id) {
      dispatch(getWorkDetail(id));
      dispatch(getProfile()); // Dispatch getProfile action
    }
  }, [dispatch, id]);

  const getInitials = (email) => {
    const [name] = email.split('@');
    return name.slice(0, 2).toUpperCase();
  };

  if (!work) {
    return null; // Render nothing if work is null or undefined
  }

  return (
    <>
      <Navigation />
      <div className="gallery-detail-container">
        <h1 className="gallery-detail-header">{t('gallery')}</h1>

        <div className="gallery-detail-content">
          <div className="gallery-detail-image-section">
            <div className="gallery-detail-main-image">
              {work.images_data.length > 1 && (
                <button
                  className="gallery-nav-button left"
                  onClick={() => setCurrentImageIndex((prev) =>
                    prev === 0 ? work.images_data.length - 1 : prev - 1
                  )}
                >
                  <ChevronLeft />
                </button>
              )}

              {work.images_data[currentImageIndex] && (
                <img
                  src={work.images_data[currentImageIndex].image_url}
                  alt={work.title}
                  onContextMenu={(e) => {
                    if (!canDownloadAndInteract()) {
                      e.preventDefault();
                    }
                  }}
                />
              )}

              {work.images_data.length > 1 && (
                <button
                  className="gallery-nav-button right"
                  onClick={() => setCurrentImageIndex((prev) =>
                    prev === work.images_data.length - 1 ? 0 : prev + 1
                  )}
                >
                  <ChevronRight />
                </button>
              )}
            </div>

            {work.images_data.length > 1 && (
              <div className="gallery-detail-thumbnails">
                {work.images_data.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    onContextMenu={(e) => {
                      if (!canDownloadAndInteract()) {
                        e.preventDefault();
                      }
                    }}
                  />
                ))}
              </div>
            )}
            {canDownloadAndInteract()  && (
              <div className="download-button-container" style={{ textAlign: 'center', marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  className="download-button"
                  onClick={handleDownload}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#4cafaf',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    width: '48%', // Set width to 48% for equal size
                  }}
                >
                  <Download size={20} style={{ marginRight: '8px' }} />
                  {t('Download work')}
                </button>
                <button
                  className="edit-button"
                  onClick={() => navigate('/edit-work', { state: { workId: id } })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#4cafaf',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    width: '48%', // Set width to 48% for equal size
                  }}
                >
                  <Pencil size={20} style={{ marginRight: '8px' }} />
                  {t('Edit work')}
                </button>
              </div>
            )}
          </div>
          <div className="gallery-detail-info">
            <div className="gallery-detail-author">
              <div className={`author-avatar ${!work.member.profile_picture ? 'user-avatar-initial' : ''}`}>
                {work.member.profile_picture ? (
                  <img src={work.member.profile_picture} alt={work.member.username} />
                ) : (
                  getInitials(work.member.username)
                )}
              </div>
              <span className="author-name">{work.member.username}</span>
            </div>

            <h2 className="gallery-detail-title">{work.title}</h2>

            <div className="gallery-detail-likes">
              <Heart
                className={`gallery-heart-icon ${work.is_liked_by_user ? 'active' : ''}`}
                size={20}
              />
              <span>{`${work.likes_count}`}</span>
            </div>

            {work.description && (
              <p className="gallery-detail-description">{work.description}</p>
            )}

            {work.category?.name && (
              <div className="gallery-detail-category">
                <h3>{t('Category')}</h3>
                <p>{work.category.name}</p>
              </div>
            )}

            {/* <div className="gallery-detail-tags">
              <h3>{t('tag')}</h3>
              <div className="tag-list-detail">
                {work.tags && work.tags.length > 0 ? (
                  work.tags.map((tag) => (
                    <span key={tag.id} className="tag-detail">
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <span className="tag-detail">{t('N/A')}</span>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryDetail;
