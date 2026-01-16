import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { useSelector, useDispatch } from "react-redux";
import { registerChild } from "../redux/slices/userSlice"; // Import the registerChild action from userSlice
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const OVERSEAS_COUNTRIES = ["アメリカ合衆国 (United States)",
  "カナダ (Canada)",
  "イギリス (United Kingdom)",
  "ドイツ (Germany)",
  "フランス (France)",
  "イタリア (Italy)",
  "スペイン (Spain)",
  "オーストラリア (Australia)",
  "日本 (Japan)",
  "中国 (China)",
  "韓国 (South Korea)",
  "シンガポール (Singapore)",
  "インド (India)",
  "ブラジル (Brazil)",
  "メキシコ (Mexico)",
  "ロシア (Russia)",
  "南アフリカ (South Africa)",
  "アラブ首長国連邦 (UAE)",
  "サウジアラビア (Saudi Arabia)",
  "トルコ (Turkey)",
  "スウェーデン (Sweden)",
  "ノルウェー (Norway)",
  "オランダ (Netherlands)",
  "スイス (Switzerland)",
  "ベルギー (Belgium)",
  "アルゼンチン (Argentina)",
  "ニュージーランド (New Zealand)",
  "マレーシア (Malaysia)",
  "タイ (Thailand)",
  "インドネシア (Indonesia)"]

const JAPAN_PREFECTURES = [ '北海道',
                            '青森県',
                            '岩手県',
                            '宮城県',
                            '秋田県',
                            '山形県',
                            '福島県',
                            '茨城県',
                            '栃木県',
                            '群馬県',
                            '埼玉県',
                            '千葉県',
                            '東京都',
                            '神奈川県',
                            '新潟県',
                            '富山県',
                            '石川県',
                            '福井県',
                            '山梨県',
                            '長野県',
                            '岐阜県',
                            '静岡県',
                            '愛知県',
                            '三重県',
                            '滋賀県',
                            '京都府',
                            '大阪府',
                            '兵庫県',
                            '奈良県',
                            '和歌山県',
                            '鳥取県',
                            '島根県',
                            '岡山県',
                            '広島県',
                            '山口県',
                            '徳島県',
                            '香川県',
                            '愛媛県',
                            '高知県',
                            '福岡県',
                            '佐賀県',
                            '長崎県',
                            '熊本県',
                            '大分県',
                            '宮崎県',
                            '鹿児島県',
                            '沖縄県',
                        ]

const UserRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentAddress, setCurrentAddress] = useState('');
  const [realName, setRealName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [previewImage, setPreviewImage] = useState(''); // State to hold the preview image URL
  const [currentAddressError, setCurrentAddressError] = useState('');
  const [realNameError, setRealNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');

  const dispatch = useDispatch(); // Initialize useDispatch hook
  const { registerChildRes, isLoading, error } = useSelector((state) => state.user); // Get user state

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // Limit to 5 files
    setSelectedFiles(files);
    // Assuming the first file is the profile picture and we want to preview it
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(files[0]);
    }
  };
  const handleRegisterChild = async () => {
    // Validation remains same but change variable names in the check
    if (!currentAddress) {
      setCurrentAddressError(t('Current address is required'));
    } else {
      setCurrentAddressError('');
    }
    if (!realName) {
      setRealNameError(t('Real name is required'));
    } else {
      setRealNameError('');
    }
    if (!username) { // This is actually email now
      setUsernameError(t('Username is required'));
    } else if (!/^[\w.@+-]+$/.test(username)) {
      setUsernameError(t('Username can only contain letters, numbers, and @/./+/-/_ characters'));
    } else {
      setUsernameError('');
    }
    if (!dateOfBirth) {
      setDateOfBirthError(t('Date of birth is required'));
    } else {
      setDateOfBirthError('');
    }
  
    if (currentAddress && realName && username && dateOfBirth && 
        /^[\w.@+-]+$/.test(username)) {
      const formData = new FormData();
      formData.append('address', currentAddress);
      formData.append('username', username);
      formData.append('first_name', realName);
      formData.append('date_of_birth', dateOfBirth);
  
      if (selectedFiles.length > 0) {
        formData.append('profile_picture', selectedFiles[0]);
      }
  
      dispatch(registerChild(formData));
      navigate('/add-user');
    }
  };
  

  // Reset form on successful registration
  React.useEffect(() => {
    if (registerChildRes?.username) {
      setSelectedFiles([]);
      setCurrentAddress('');
      setRealName('');
      setUsername('');
      setDateOfBirth('');
      setPreviewImage(''); // Reset preview image on successful registration
      setCurrentAddressError('');
      setRealNameError('');
      setUsernameError('');
      setDateOfBirthError('');
    }
  }, [registerChildRes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'currentAddress':
        setCurrentAddress(value);
        setCurrentAddressError('');
        break;
      case 'realName':
        setRealName(value);
        setRealNameError('');
        break;
      case 'username':
        setUsername(value);
        if (!/^[\w.@+-]+$/.test(value)) {
          setUsernameError(t('Username can only contain letters, numbers, and @/./+/-/_ characters'));
        } else {
          setUsernameError('');
        }        
        break;
      case 'dateOfBirth':
        setDateOfBirth(value);
        setDateOfBirthError('');
        break;
      default:
        break;
    }
  };

  return (
    <>
    <Navigation/>
    <div className="form-container">
      <h2 className="form-title">{t('User Registration')}</h2>

      <div className="form-group">
        <label className="form-label">{t('Select your current address')}</label>
        <select
          className="form-input"
          value={currentAddress}
          name="currentAddress"
          onChange={handleInputChange}
        >
          <option value="" disabled>
            {t('Select a location')}
          </option>
          <optgroup label={t('Japan Prefectures')}>
            {JAPAN_PREFECTURES.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {t(prefecture)}
              </option>
            ))}
          </optgroup>
          <optgroup label={t('Overseas Countries')}>
            {OVERSEAS_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {t(country)}
              </option>
            ))}
          </optgroup>
        </select>
        {currentAddressError && <p style={{ color: 'red', fontSize: 'small' }}>{currentAddressError}</p>}
      </div>


      <div className="form-group">
        <label className="form-label">{t('real name')}</label>
        <input type="text" className="form-input" placeholder={t('Enter real name')} value={realName} name="realName" onChange={handleInputChange} />
        {realNameError && <p style={{ color: 'red', fontSize: 'small' }}>{realNameError}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">{t('username')}</label>
        <input type="text" className="form-input" placeholder={t('Enter username')} value={username} name="username" onChange={handleInputChange} />
        {usernameError && <p style={{ color: 'red', fontSize: 'small' }}>{usernameError}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">{t('Date of birth')}</label>
        <div className="dob-inputs">
          <input type="date" className="dob-select" value={dateOfBirth} name="dateOfBirth" onChange={handleInputChange} />
        </div>
        {dateOfBirthError && <p style={{ color: 'red', fontSize: 'small'}}>{dateOfBirthError}</p>}
      </div>

      <div className="form-group icon-setting">
        <label className="form-label">{t('Icon Setting')}</label>
        <div className="upload-box" onClick={() => document.getElementById("fileInput").click()}>
          <span className="upload-text">{t('Upload Image')}<br />({t('up to a maximum of 5 pieces')})</span>
          {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100%', height: 'auto' }} />}
        </div>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>

      <button className="submit-button" onClick={handleRegisterChild} disabled={isLoading}>
        {isLoading ? t('Registering...') : t('Register')}
      </button>
      {/* {registerChildRes?.email && setTimeout(() => <p style={{ color: 'green' }}>{t('Registration successful!')}</p>, 200)}
      {error && setTimeout(() => <p style={{ color: 'red' }}>{error}</p>, 200)} */}
    </div>
    </>
  );
};

export default UserRegistration;
