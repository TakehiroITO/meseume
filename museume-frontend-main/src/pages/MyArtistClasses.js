import React, { useState, useEffect } from 'react';
import { Zap, Search, ChevronDown } from 'lucide-react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getMyArtistClasses } from '../redux/slices/contestSlice';
import { getTags } from '../redux/slices/workSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const ArtistList = () => {
  const { t } = useTranslation(); // Use the translation function
  const dispatch = useDispatch();
  const { myArtistClasses: artistClasses, isLoading } = useSelector((state) => state.contest);
  const { tags } = useSelector((state) => state.work)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState(undefined);
  const [classTypeFilter, setClassTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getMyArtistClasses({ page, search, is_free: feeFilter, class_type: classTypeFilter, status: statusFilter }));
    dispatch(getTags()); // Fetch tags on page load
  }, [dispatch, page, search, filter, feeFilter, classTypeFilter, statusFilter]);

  const handleSearch = () => {
    setPage(1); // Reset page to 1 when search is performed
    dispatch(getMyArtistClasses({ page: 1, search, is_free: feeFilter, class_type: classTypeFilter, status: statusFilter }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    dispatch(getMyArtistClasses({ page: newPage, search, is_free: feeFilter, class_type: classTypeFilter, status: statusFilter }));
  };

  const handleSeeMore = () => {
    if (!isLoading && artistClasses?.next) {
      const nextPage = page + 1;
      setPage(nextPage);

      dispatch(getMyArtistClasses({
        page: nextPage,
        search,
        is_free: feeFilter,
        class_type: classTypeFilter,
        status: statusFilter,
      }));
    }
  };
  const handleFeeFilterChange = (value) => {
    setFeeFilter(value);
    setPage(1); // Reset page to 1 when filter changes
    dispatch(getMyArtistClasses({ page: 1, search, is_free: value, class_type: classTypeFilter, status: statusFilter }));
  };

  const handleClassTypeFilterChange = (value) => {
    setClassTypeFilter(value);
    setPage(1); // Reset page to 1 when filter changes
    dispatch(getMyArtistClasses({ page: 1, search, is_free: feeFilter, class_type: value, status: statusFilter }));
  };

  const handleImageClick = (artistClassId) => {
    navigate(`/artist-signup-detail`, { state: { artistClassId } });
  };

  const handleSearchInputChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === '') {
      handleSearch();
    }
  };

  const handleSearchSubmit = () => {
    dispatch(getMyArtistClasses({ page: 1, search, is_free: feeFilter, class_type: classTypeFilter, status: statusFilter }));
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1); // Reset page to 1 when filter changes
    dispatch(getMyArtistClasses({ page: 1, search, is_free: feeFilter, class_type: classTypeFilter, status: value }));
  };

  // Function to filter tag names based on artistClass tags
  const getTagNames = (artistClassTags) => {
    return artistClassTags.map(tagId => tags.find(tag => tag.id === tagId)?.name || 'Unknown Tag');
  };

  // 状況バッジを表示する関数
  const getStatusBadge = (item) => {
    if (!item.start_date || !item.end_date) {
      return null;
    }
    
    let status, className;
    if (item.status === 'scheduled') {
      status = t('scheduled');
      className = 'status-scheduled';
    } else if (item.status === 'ongoing') {
      status = t('ongoing');
      className = 'status-ongoing';
    } else if (item.status === 'completed') {
      status = t('completed');
      className = 'status-completed';
    } else {
      return null;
    }
    
    return <span className={`status-badge ${className}`}>{status}</span>;
  };

  return (
    <div>
      <Navigation />
      <div className="artist-list-container">
        <div className="artist-list-search-section">
          <div className="artist-list-search-wrapper">
            {/* Search Input */}
            <div className="search-input-container">
              <Search className="artist-list-search-icon" />
              <input
                type="text"
                placeholder={t('Search by free word')}
                className="artist-list-search-input"
                value={search}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
              />
            </div>

            {/* All Type Select */}
            {/* All Type Select */}
            {/* All Type Select */}
            <div className="dropdown-container">
              <select
                className="artist-list-filter-select"
                onChange={(e) => handleFeeFilterChange(e.target.value)}
              >
                <option value="">{t('all type')}</option>
                <option value="true">{t('free')}</option>
                <option value="false">{t('fee')}</option>
              </select>
              <ChevronDown className="dropdown-icon" />
            </div>

            {/* Class Type Select */}
            <div className="dropdown-container">
              <select
                className="artist-list-filter-select"
                onChange={(e) => handleClassTypeFilterChange(e.target.value)}
              >
                <option value="">{t('class type')}</option>
                <option value="real_time">{t('real time')}</option>
                <option value="recorded">{t('recorded')}</option>
              </select>
              <ChevronDown className="dropdown-icon" />
            </div>

            {/* Status Select */}
            <div className="dropdown-container">
              <select
                className="artist-list-filter-select"
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                value={statusFilter}
              >
                <option value="">{t('all status')}</option>
                <option value="scheduled">{t('scheduled')}</option>
                <option value="ongoing">{t('ongoing')}</option>
                <option value="completed">{t('completed')}</option>
              </select>
              <ChevronDown className="dropdown-icon" />
            </div>
            <button className="artist-list-search-btn" onClick={handleSearchSubmit}>
              {t('Search by these criteria')}
            </button>
          </div>
        </div>

        <h1 className="artist-list-heading">{t('My Artist Classes')}</h1>

        <div className="artist-list-grid">
          {Array.from(
            new Map(
              artistClasses?.results?.map(item => [item.id, item]) || []
            ).values()
          ).map((item) => (<div key={item.id} className="artist-list-card">
            <div className="artist-list-card-image-container">
              <img
                src={item.thumbnail}
                alt={item.name}
                className="artist-list-card-image"
                onClick={() => handleImageClick(item.id)}
              />
              {/* 開催済みバッジ */}
              {item.status === 'completed' && (
                <div className="class-status-badge completed-badge">
                  {t('completed')}
                </div>
              )}
              <div className="artist-list-card-title">
                {item.name}
              </div>
            </div>
            <div className="artist-list-card-footer">
              <div className="artist-list-user-info">
                <div className="artist-list-user-left">
                  {/* <img 
                      src={item?.user?.avatar} 
                      alt={item?.user?.username}
                      className="artist-list-user-avatar"
                    />
                    <span className="artist-list-username">
                      {item?.user?.username}
                    </span> */}
                </div>
                <div className="artist-list-status">
                  {getStatusBadge(item)}
                  {item.is_free ? (
                    <span className="artist-list-free">
                      <Zap size={16} className="status-icon" />
                      {t('free')}
                    </span>
                  ) : (
                    <span className="artist-list-free">
                      <Zap size={16} className="status-icon" />
                      {t('paid')}
                    </span>
                  )}
                  {item.class_type === 'recorded' && (
                    <span className="artist-list-free">
                      <Zap size={16} className="status-icon" />
                      {t('recorded')}
                    </span>
                  )}
                </div>
              </div>
              <div className="artist-list-tags">
                {getTagNames(item.tags)?.map((tag, index) => (
                  <span key={index} className="artist-list-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          ))}
        </div>

        {artistClasses?.next && (
          <button className="contest-see-more" onClick={handleSeeMore} disabled={isLoading}>
            {isLoading ? t('Loading...') : t('See more')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtistList;
