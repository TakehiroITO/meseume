import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import './App.css';
import MemberRegistrationPage from './pages/MemberRegisterationPage';
import EmailVerification from './pages/EmailVerification';
import InquiryThankYou from './pages/InquiryThankYou';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';
import VerificationEmail from './pages/VerificationEmail';
import UserRegistration from './pages/UserRegisteration';
import AddUserScreen from './pages/AddUserScreen';
import UserInformation from './pages/UserInformation'; // Import UserInformation page
import AccountInformation from './pages/AccountInformation'; // Import AccountInformation page
import ContactUs from './pages/ContactUs'; // Import ContactUs page
import ContestList from './pages/ContentList'; // Import ContestList page
import ContestApplication from './pages/ContestApplication'; // Import ContestApplication page
import ContestDetail from './pages/ContestDetails'; // Import ContestDetail page
import MyContestList from './pages/MyContests'; // Import MyContestList page
import PublicRoute from './routes/PublicRoute'; 
import ProtectedRoute from './routes/ProtectedRoute'; 
import ToastNotification from './components/Toast';
import { Provider } from 'react-redux';
import store from './redux/store';
import './i18n';
import { isTokenValid, scheduleTokenRefresh } from './utils/helpers';
import RegisterWorkForm from './pages/AddWorkScreen';
import MyGalleryPage from './pages/MyGalleryPage'
import PublicGalleryPage from './pages/PublicGallery';
import GalleryDetail from './pages/GalleryDetailPage';
import MyCollectionPage from './pages/MyCollectionPage';
import ArtistListPage from './pages/ArtistListPage'; // Import ArtistList page
import ArtistDetails from './pages/ArtistDetails'; // Import ArtistDetails page
import ArtistSignupDetail from './pages/ArtistSignUpDetailPage'; // Import ArtistSignupDetail page
import Link from './pages/LinkPage';
import VideoPage from './pages/VideoLink';
import PaymentPage from './pages/Payment'; // Import Payment page
import AccountPaymentInformation from './pages/AccountPaymentInformation'; // Import AccountPaymentInformation page
import FamilyGallery from './pages/FamilyGallery';
import UserGallery from './pages/UserGallery';
import LandingPage from './pages/LandingPage';
import TermsAndServices from './pages/TermsAndServices'; // Import TermsAndServices page
import PrivacyPolicy from './pages/PrivacyPolicy';
import CommercialTransaction from './pages/CommercialTransaction';
import MyArtistClasses from './pages/MyArtistClasses';
import EditWorkForm from './pages/EditWorkScreen';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      const isValid = await isTokenValid();
      setIsAuthenticated(isValid);
    };
    checkAuthentication(); // Check token on component load
    scheduleTokenRefresh('parent'); // Schedule token refresh for parent when the app starts
    if (localStorage.getItem('child_token')) {
      scheduleTokenRefresh('child'); // Schedule token refresh for child if child_token exists
    }
  }, []);

if (isAuthenticated === null) {
  return <div>Loading...</div>; // Display a loading state while checking authentication
}

  return (
    <Provider store={store}>
      <ToastNotification/>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><MemberRegistrationPage /></PublicRoute>} />
          <Route path="/email-verification" element={<PublicRoute><EmailVerification /></PublicRoute>} />
          <Route path="/password-reset-confirm" element={<PublicRoute><PasswordReset/></PublicRoute>} />
          <Route path="/verify-email" element={<PublicRoute><VerificationEmail/></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword/></PublicRoute>} />
          <Route path="/public-gallery" element={<PublicGalleryPage/>}/>
          <Route path="/contest-list" element={<ContestList/>} /> {/* Add Contest List route */}
          <Route path="/artist-list" element={<ArtistListPage/>} /> {/* Add Artist List route */}
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/gallery-detail/:id" element={<ProtectedRoute><GalleryDetail/></ProtectedRoute>}/>
          {/* <Route path="/video-link" element={<ProtectedRoute><VideoLin/></ProtectedRoute>}/> */}
          <Route path="/contact-us" element={<ContactUs/>} /> {/* Add Contact Us route */}
          <Route path="/inquiry-thank-you" element={<PublicRoute><InquiryThankYou /></PublicRoute>} />
          <Route path="/terms-and-services" element={<TermsAndServices/>} /> {/* Add Terms and Services route */}
          <Route path ="/privacy-policy" element={<PrivacyPolicy/>} />
          <Route path ="/commercial-transaction" element={<CommercialTransaction/>} />
          <Route path="/contest-application" element={<ProtectedRoute><ContestApplication/></ProtectedRoute>} /> {/* Add Contest Application route */}
          <Route path="/contest-detail" element={<ProtectedRoute><ContestDetail/></ProtectedRoute>} /> {/* Add Contest Detail route */}
          <Route path="/artist-signup-detail" element={<ArtistSignupDetail/>} /> {/* Add Artist Signup Detail route */}
          <Route path="/my-work" element={<MyGalleryPage/>}/>

          {localStorage.getItem('child_token') ? (
            <>
              <Route path="/user-info" element={<ProtectedRoute><UserInformation/></ProtectedRoute>}/> {/* Add User Information route */}
              <Route path="/register-work" element={<ProtectedRoute><RegisterWorkForm/></ProtectedRoute>}/>
              <Route path="/edit-work" element={<ProtectedRoute><EditWorkForm/></ProtectedRoute>}/>
              {/* <Route path="/my-work" element={<ProtectedRoute><MyGalleryPage/></ProtectedRoute>}/> */}
              <Route path="/my-collection" element={<ProtectedRoute><MyCollectionPage/></ProtectedRoute>}/>
              <Route path="/family-gallery" element={<ProtectedRoute><FamilyGallery/></ProtectedRoute>}/> {/* Add Family Gallery route */}
              <Route path="/user-gallery" element={<ProtectedRoute><UserGallery/></ProtectedRoute>}/> {/* Add User Gallery route */}
          <Route path="/my-contests" element={<ProtectedRoute><MyContestList/></ProtectedRoute>} /> {/* Add My Contest List route */}
          <Route path="/my-artist-classes" element={<MyArtistClasses/>} /> {/* Add Artist List route */}
          <Route path="/artist-details" element={<ArtistDetails/>} /> {/* Add Artist Details route */}
          <Route path ="/link-url" element ={<VideoPage/>}/>
          <Route path ="/link-detail" element ={<Link/>}/>
          <Route path="/payment" element={<ProtectedRoute><PaymentPage/></ProtectedRoute>} /> {/* Add Payment route */}

            </>
          ) : null}

          {/* Move register-user route outside of conditional blocks */}
          <Route path="/register-user" element={<ProtectedRoute><UserRegistration/></ProtectedRoute>}/>
          <Route path="/add-user" element={<ProtectedRoute><AddUserScreen/></ProtectedRoute>}/>

          {localStorage.getItem('token') && !localStorage.getItem('child_token') && (
            <>
              <Route path="/account-payment-info" element={<ProtectedRoute><AccountPaymentInformation/></ProtectedRoute>} /> {/* Add Account Payment Information route */}
              <Route path="/account-info" element={<ProtectedRoute><AccountInformation/></ProtectedRoute>}/> {/* Add Account Information route */}
            </>
          )}

          <Route 
            path="/" 
            element={isAuthenticated ? (localStorage.getItem('child_token') ? <Navigate to="/my-work" /> : <Navigate to="/add-user" />) : <Navigate to="/" />} 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/add-user" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}
export default App;
