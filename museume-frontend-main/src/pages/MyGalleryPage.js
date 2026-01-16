import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Heart } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getMyWorks, getTags, getCategories } from '../redux/slices/workSlice';
import { getProfiles } from '../redux/slices/userSlice';
import Loader from '../components/Loader';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GalleryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { works, isLoading, tags, categories } = useSelector((state) => state.work);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [showMore, setShowMore] = useState(false);
  const { profilesRes } = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [allWorks, setAllWorks] = useState([]);
  const [mainUser, setMainUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const mainUserData = works?.results?.find(work => work?.member?.id === decodedToken.user_id);
      setMainUser(mainUserData?.member);
    }
  }, [works]);

  useEffect(() => {
    dispatch(getProfiles());
    dispatch(getTags());
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const queryParams = {
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedTags && { tags: selectedTags }),
      page: 1,
    };
    setCurrentPage(1);
    setAllWorks([]);
    dispatch(getMyWorks(queryParams));
  }, [dispatch, searchTerm, selectedCategory, selectedTags]);
  
  useEffect(() => {
    // Only fetch for page changes, not for filter changes
    if (currentPage > 1) {
      const queryParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedTags && { tags: selectedTags }),
        page: currentPage,
      };
      dispatch(getMyWorks(queryParams));
    }
  }, [currentPage]);

  useEffect(() => {
    if (works?.results) {
      if (currentPage === 1) {
        setAllWorks(works.results);
      } else {
        setAllWorks(prev => [...new Set([...prev, ...works.results])]);
      }
    }
  }, [works, currentPage]);

  const handleSeeMore = () => {
    if (works?.next) {
      setCurrentPage(prev => prev + 1);
    } else {
      setShowMore(true);
    }
  };

  const getInitials = (email) => {
    const [name] = email.split('@');
    return name.slice(0, 2).toUpperCase();
  };

  const SharedUsers = ({ users }) => {
    return (
      <div className="gallery-shared-users">
        <h3>{t('Shared users')}</h3>
        <div className="gallery-user-avatars">
          {users?.map((user, index) => (
            <div key={user.id} className="user-avatar-container">
              {index === 0 && <span className="new-badge">NEW</span>}
              <div className={`user-avatar ${!user.profile_picture ? 'user-avatar-initial' : ''}`}>
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} />
                ) : (
                  getInitials(user.username)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleImageClick = (work) => {
    navigate(`/gallery-detail/${work?.id}`);
  };


  const handleSearchAndFilter = () => {
    setCurrentPage(1);
    setAllWorks([]);
    const queryParams = {
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedTags && { tags: selectedTags }),
      page: 1,
    };
    dispatch(getMyWorks(queryParams));
  };

  return (
    <>
      <Navigation />
      <div className="gallery-search-section">
        <div className="gallery-search-container-wrapper">
          <div className="gallery-search-input-container">
            <Search className="gallery-search-icon" />
            <input
              type="text"
              placeholder={t('Search by free word')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gallery-search-input"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="gallery-dropdown"
          >
            <option value="">{t('Select a category')}</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <button className="gallery-search-button" onClick={handleSearchAndFilter}>
            {t('Search by these criteria')}
          </button>
        </div>
      </div>
      <div className="gallery-container">
        {/* {isLoading && <Loader fullScreen />} */}
        {/* <div className="gallery-profile-section"> */}
          {/* <div className={`gallery-profile-image user-avatar ${!mainUser?.profile_picture ? 'user-avatar-initial' : ''}`}>
            {mainUser?.profile_picture ? (
              <img src={mainUser.profile_picture} alt="Profile" />
            ) : (
              mainUser?.username && getInitials(mainUser?.username)
            )}
          </div>
          <h2 className="gallery-username">{mainUser?.username}</h2> */}

          {/* <div className="gallery-shared-users">
            <SharedUsers users={profilesRes} />
          </div> */}

          {/* <p className="gallery-description">
            {t('Account description. Account description. Account description. Account description. Account description.')}
          </p> */}
        {/* </div> */}

        <h1 className="gallery-title">{t('My Gallery')}</h1>

        {isLoading && currentPage === 1 ? (
          <Loader />
        ) : (
          // Replace your gallery grid section with this:
          <div className="gallery-grid">
            {works?.results?.filter(work => work.images_data.length > 0).map((work) => (
              <div key={work.id} className="gallery-item-my">
                <div className="gallery-item-header">
                  <span className="gallery-item-date">
                    <img src={require('../assets/images/clock.png')} alt="Clock Icon" className="clock-icon" style={{ marginRight: '3px' }} /> {new Date(work.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="gallery-item-title">{work.title}</h3>

                <div className="gallery-item-image-container">
                  <img
                    src={work.images_data[0].image_url}
                    alt={work.title}
                    className="gallery-item-image"
                    onClick={() => handleImageClick(work)}
                  />
                </div>

                {work.description && (
                  <p className="gallery-item-description">{work.description}</p>
                )}

                <div className="gallery-likes-my">
                  <Heart
                    className={`gallery-heart-icon ${work.is_liked_by_user ? 'active' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      // handleLikeClick(work);
                    }}
                  />
                  <span className="likes-count">{work.likes_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && currentPage > 1 && <Loader />}

        {!showMore && works?.next && (
          <button onClick={handleSeeMore} className="see-more-button">
            <span className="see-more-text">{t('See more')}</span>
            <ChevronDown className="see-more-icon" />
          </button>
        )}
      </div>
    </>
  );
};

export default GalleryPage;
