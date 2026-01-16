import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getContests } from '../redux/slices/contestSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const ContestList = () => {
  const { t } = useTranslation(); // Use the translation function
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { contests, isLoading } = useSelector((state) => state.contest);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(getContests({ page: 1, search, filter }));
  }, [dispatch, search, filter]);

  const handleSeeMore = () => {
    if (contests?.next) {
      setPage(prev => prev + 1);
      dispatch(getContests({ page: page + 1, search, filter }));
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(getContests({ page: 1, search, filter }));
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const isContestActive = (endDate) => {
    return new Date(endDate) > new Date();
  };

  const handleDetailsClick = (contestId) => {
    navigate('/contest-application', { state: { contestId } });
  };

  return (
    <>
      <Navigation />
      <div className="contest-container">
        <div className="contest-search-wrapper">
          <div className="contest-search-section">
            <div className="contest-search-container">
              <Search className="contest-search-icon" />
              <input 
                type="text" 
                placeholder={t('Search by free word')}
                className="contest-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select 
              className="contest-dropdown"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">{t('All Contests')}</option>
              <option value="already_held">{t('Already Held')}</option>
              <option value="in_session">{t('In Session')}</option>
              <option value="scheduled">{t('Scheduled')}</option>
            </select>

            {/* <input 
              type="text" 
              placeholder={t('Tag Search')}
              className="contest-tag-input"
            /> */}

            <button 
              className="contest-search-button"
              onClick={handleSearch}
            >
              {t('Narrow down your search by these criteria')}
            </button>
          </div>
        </div>
  
        {/* Ongoing Contests Section */}
        <div className="contest-section">
          <h2 className="contest-section-title">{t('Scheduled and ongoing contests')}</h2>
          {contests?.results?.filter(contest => isContestActive(contest.end_date) && contest.winner === null).map(contest => (
            <div key={contest.id}>
              <div className="contest-card">
                <div className="contest-image-container">
                  {contest.thumbnail ? (
                    <img src={contest.thumbnail} alt={contest.name} className="contest-image" />
                  ) : (
                    <div className="contest-image-placeholder">
                      {getInitials(contest.name)}
                    </div>
                  )}
                  <div className="contest-user">
                    <div className="contest-org-initial">
                      {`${contest.organization.name}`}
                    </div>
                  </div>
                </div>
                <div className="contest-info">
                  <h3 className="contest-title">{contest.name}</h3>
                  <p className="contest-date">
                    {getFormattedDate(contest.start_date)} - {getFormattedDate(contest.end_date)}
                  </p>
                  <p>{contest.explanation}</p>
                  <button 
                    className="contest-details-button"
                    onClick={() => handleDetailsClick(contest.id)}
                  >
                    {t('Details')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completed Contests Section - New Grid Layout */}
        <div className="contest-section">
          <h2 className="contest-section-title">{t('Contests already held (results announced)')}</h2>
          <div className="held-contests-grid">
            {contests?.results?.filter(contest => contest.winner !== null || !isContestActive(contest.end_date)).map(contest => (
              <div key={contest.id} className="held-contest-item">
                <div className="held-contest-image">
                  {contest.thumbnail ? (
                    <img src={contest.thumbnail} alt={contest.name} />
                  ) : (
                    <div className="held-contest-placeholder">
                      {getInitials(contest.name)}
                    </div>
                  )}
                </div>
                <div className="held-contest-title">
                  {contest.name}
                </div>
                <div className="held-contest-info">
                  <p>{getFormattedDate(contest.start_date)} - {getFormattedDate(contest.end_date)}</p>
                  <div className="held-contest-user">
                    <span>{contest.organization.name}</span>
                  </div>
                </div>
                <button 
                  className="held-contest-details-button"
                  onClick={() => handleDetailsClick(contest.id)}
                >
                  {t('Details')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {contests?.next && (
          <button 
            className="contest-see-more"
            onClick={handleSeeMore}
            disabled={isLoading}
          >
            {isLoading ? t('Loading...') : t('See more')}
          </button>
        )}
      </div>
    </>
  );
};

export default ContestList;
