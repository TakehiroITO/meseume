import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Heart } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getMemberWork, getTags, getCategories, likeWork, unlikeWork } from '../redux/slices/workSlice';
import { getProfiles } from '../redux/slices/userSlice';
import Loader from '../components/Loader';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserGallery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { memberWork, isLoading, tags, categories } = useSelector((state) => state.work);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allWorks, setAllWorks] = useState([]);
  const userId = location.state?.userId;

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
      id: userId,
      page: 1,
    };
    if (userId) {
      dispatch(getMemberWork(queryParams));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (memberWork?.results) {
      setAllWorks(memberWork.results);
    }
  }, [memberWork]);

  const getInitials = (email) => {
    const [name] = email.split('@');
    return name.slice(0, 2).toUpperCase();
  };

  const handleImageClick = (work) => {
    navigate(`/gallery-detail/${work?.id}`);
  };

  // const handleLikeClick = async (work) => {
  //   if (work.is_liked_by_user) {
  //     await dispatch(unlikeWork(work.id));
  //   } else {
  //     await dispatch(likeWork(work.id));
  //   }
  //   setAllWorks(prevWorks => prevWorks.map(w => 
  //     w.id === work.id 
  //       ? { ...w, is_liked_by_user: !w.is_liked_by_user, likes_count: w.is_liked_by_user ? w.likes_count - 1 : w.likes_count + 1 } 
  //       : w
  //   ));
  // };
  const handleSearchAndFilter = () => {
    setCurrentPage(1);
    setAllWorks([]);
    const queryParams = {
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedTags && { tags: selectedTags }),
      id: userId,
      page: 1,
    };
    dispatch(getMemberWork(queryParams));
  };

  return (
    <>
      <Navigation />
      {/* <div className="gallery-search-section">
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
      </div> */}
      <div className="gallery-container user-gallery-container">
        <h1 className="gallery-title">{t('User Gallery')}</h1>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="gallery-grid">
            {allWorks?.filter(work => work.images_data.length > 0).map((work) => (
              <div key={work.id} className="gallery-item">
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
                
                <div className="gallery-item-info">
                  <div className="gallery-item-header">
                    <div className={`user-avatar-public ${!work.member.profile_picture ? 'initial' : ''}`}>
                      {work.member.profile_picture ? (
                        <img 
                          src={work.member.profile_picture} 
                          alt={work.member.username}
                        />
                      ) : (
                        getInitials(work.member.username)
                      )}
                    </div>
                    <span className="username">{work.member.username}</span>
                    <div className="gallery-likes">
                      <Heart
                        className={`gallery-heart-icon ${work.is_liked_by_user ? 'active' : ''}`}
                        // onClick={(event) => {
                        //   event.stopPropagation();
                        //   handleLikeClick(work);
                        // }}
                      />
                      <span className="likes-count">{work.likes_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UserGallery;


