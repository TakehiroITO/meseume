import React, { useState, useEffect } from 'react';
import { Search, X, Heart, Clock, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyWorks, getTags, getCategories } from '../redux/slices/workSlice';
import { submitContestWork, getContestDetail } from '../redux/slices/contestSlice';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import { useNavigate } from 'react-router-dom';

const GallerySelectionModal = ({ isOpen, onClose, onSelect, contestId }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(); // Use the translation function
  const navigate = useNavigate();
  const { works, tags, categories } = useSelector((state) => state.work);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [selectedWork, setSelectedWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allWorks, setAllWorks] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
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
    if (works?.results) {
      if (currentPage === 1) {
        setAllWorks(works.results);
      } else {
        setAllWorks(prev => [...prev, ...works.results]);
      }
    }
  }, [works, currentPage]);

  const handleSeeMore = () => {
    if (works?.next) {
      const queryParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedTags && { tags: selectedTags }),
        page: currentPage + 1,
      };
      setCurrentPage(prev => prev + 1);
      dispatch(getMyWorks(queryParams));
    } else {
      setShowMore(true);
    }
  };

  if (!isOpen) return null;

  const handleSelect = async () => {
    if (selectedWork) {
      try {
        await dispatch(submitContestWork({
          contest: contestId,
          work: selectedWork.id
        })).unwrap();
        navigate('/my-contests');
        // await dispatch(getContestDetail(contestId));
        // onSelect(selectedWork);
        // onClose();
      } catch (error) {
        console.error("Error submitting contest work:", error);
      }
    }
  };

  return (
    <div className="gallery-selection-modal-overlay">
      <div className="gallery-selection-modal">
        <div className="gallery-selection-modal-header">
          <h2 className="gallery-selection-modal-title">
            {t('Select a submission for the contest')}
          </h2>
          <button className="gallery-selection-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="gallery-selection-search">
        <div className="gallery-selection-search-input">
            <Search className="gallery-selection-search-icon" />
            <input
              type="text"
              placeholder={t("Search by title")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* <select
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
            className="gallery-dropdown"
          >
            <option value="">{t('Select a tag')}</option>
            {tags?.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select> */}
        </div>

        <div className="gallery-selection-content">
          <div className="gallery-selection-grid">
            {allWorks?.map((work) => (
              <div 
                key={work.id} 
                className={`gallery-selection-item ${selectedWork?.id === work.id ? t('selected') : ''}`}
                onClick={() => setSelectedWork(work)}
              >
                <div className="gallery-selection-item-header">
                  <span className="gallery-selection-item-date">
                    <img src={require('../assets/images/clock.png')} alt="Clock Icon" className="clock-icon" style={{ marginRight: '3px' }} /> {new Date(work.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="gallery-selection-item-title">{work.title}</h3>

                <div className="gallery-selection-item-image">
                  <img
                    src={work?.images_data[0]?.image_url}
                    alt={work.title}
                  />
                  {selectedWork?.id === work.id && (
                    <div className="gallery-selection-item-selected">
                      <span>{t('selected')}</span>
                    </div>
                  )}
                </div>

                <p className="gallery-selection-item-description">
                  {work.description}
                </p>

                <div className="gallery-likes-my">
                  <Heart
                    className={`gallery-heart-icon ${work.is_liked_by_user ? t('active') : ''}`}
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
        </div>

        {!showMore && works?.next && (
          <button onClick={handleSeeMore} className="see-more-button">
            <span className="see-more-text">{t('See more')}</span>
            <ChevronDown className="see-more-icon" />
          </button>
        )}

        <div className="gallery-selection-footer">
          <button 
            className="gallery-selection-submit"
            disabled={!selectedWork}
            onClick={handleSelect}
          >
            {t('Enter this work in the contest')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GallerySelectionModal;