import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../constants';
import axios from 'axios';

const Navigation = () => {
  const [externalLinks, setExternalLinks] = useState({});
  const { t } = useTranslation();

  // Fetch external links for navbar
  useEffect(() => {
    const fetchNavbarLinks = async () => {
      try {
        const AUTH_URL = `${BASE_URL}`;
        const response = await axios.get(`${AUTH_URL}/public-navbar/`);
        const links = response.data.reduce((acc, item) => {
          acc[item.navbar_type] = item.url;
          return acc;
        }, {});
        setExternalLinks(links);
      } catch (error) {
        console.error('Failed to fetch navbar links:', error);
      }
    };

    fetchNavbarLinks();
  }, []);

  useEffect(() => {
    // Find the main container dynamically
    const mainContainer = document.querySelector('#header');

    if (mainContainer) {
      mainContainer.style.display = 'flex';
      mainContainer.style.flexDirection = 'column';
      mainContainer.style.flex = '1';
    }
  }, []);
  return (
    <>
      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-left">
            <img src={require('../assets/images/mwseume.png')} alt="Museume Logo" className="footer-logo" />
          </div>
          <div className="footer-center">
            <a href="https://seso-j.com/museume/" className="footer-link">{t('About us')}</a> 
            <a href="https://seso-j.com/how-to-use/" className="footer-link">使い方</a> 
            <a href="https://seso-j.com/企業・団体の方向け/" className="footer-link">法人・団体様</a> 
            <a href={externalLinks.blog} className="footer-link">{t('Blog')}</a> 
            <a href="/contact-us" className="footer-link">{t('Contact Us')}</a>
            <a href="/terms-and-services" className="footer-link">{t('Terms and Services')}</a> 
            <a href="/privacy-policy" className="footer-link">{t('Privacy Policy')}</a>
            <a href="/commercial-transaction" className="footer-link">{t('Specified Commercial Transaction Act')}</a>
          </div>
          <div className="footer-right">
            © 2025 Museume
          </div>
        </div>
      </footer>
    </>
  );
};

export default Navigation;
