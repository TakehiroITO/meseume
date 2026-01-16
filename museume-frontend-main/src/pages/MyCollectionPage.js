import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Heart } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCollection, getTags, getCategories } from '../redux/slices/workSlice';
import { getProfiles } from '../redux/slices/userSlice';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const MyCollectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Use the translation function
  const { myCollection, isLoading, tags, categories } = useSelector((state) => state.work);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allWorks, setAllWorks] = useState([]);

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
    dispatch(getMyCollection(queryParams));
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
      dispatch(getMyCollection(queryParams));
    }
  }, [currentPage]);
  useEffect(() => {
    if (myCollection?.results) {
      if (currentPage === 1) {
        setAllWorks(myCollection.results);
      } else {
        setAllWorks(prev => [...prev, ...myCollection.results]); 
      }
    }
  }, [myCollection, currentPage]);

  const handleSeeMore = () => {
    if (myCollection?.next) {
      setCurrentPage(prev => prev + 1);
    } else {
      setShowMore(true);
    }
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
    dispatch(getMyCollection(queryParams));
  };
console.log("currnet page:", currentPage)
  const getInitials = (email) => {
    const [name] = email.split('@');
    return name.slice(0, 2).toUpperCase();
  };

  const handleImageClick = (work) => {
    navigate(`/gallery-detail/${work?.id}`);
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
        <h1 className="gallery-title">{t('My Collection')}</h1>
        {isLoading && currentPage === 1 ? (
          <Loader />
        ) : (
// Inside your map function in the gallery grid
<div className="gallery-grid">
  {myCollection?.results?.filter(work => work.images_data.length > 0).map((work) => (
    <div key={work.id} className="gallery-item">
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
              onClick={(event) => {
                event.stopPropagation();
              }}
            />
            <span className="likes-count">{work.likes_count}</span>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
        )}
        {isLoading && currentPage > 1 && <Loader />}

        {!showMore && myCollection?.next && (
          <button onClick={handleSeeMore} className="see-more-button">
            <span className="see-more-text">{t('See more')}</span>
            <ChevronDown className="see-more-icon" />
          </button>
        )}
      </div>
    </>
  );
};

export default MyCollectionPage;
