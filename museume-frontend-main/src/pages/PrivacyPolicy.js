import React from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from './Navigation';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <>
      <Navigation />
      <div className="terms-page">
        <div className="terms-header">
          <h1>{t('Privacy policy')}</h1>
          <p className="last-updated">{t('Last Updated')}: {t('January 22, 2025')}</p>

          <p className="welcome-text">
            {t("seso Co., Ltd.(hereinafter referred to as ``the Company'') provides the services provided by the Company.Museume(hereinafter referred to as \"this service\"), we have established the following privacy policy (hereinafter referred to as \"this policy\") regarding the handling of personal information obtained.")}
          </p>
        </div>

        <div className="terms-container">
          <h2>{t('Article 1 (General Provisions)')}</h2>
          <ul>
            <li>{t('1. Our company complies with the Personal Information Protection Act and other related laws and guidelines, as well as this policy, and handles the personal information of users (hereinafter referred to as \"users\") appropriately.')}</li>
            <li>{t('2. \"Personal information\" in this policy refers to information about living individuals that can identify a specific individual through name, address, telephone number, email address, and other descriptions contained in the information.')}</li>
          </ul>
          
          <h2>{t('Article 2 (Information to be acquired and how to acquire it)')}</h2>
          <p>
            {t('In providing this service, our company may obtain the following information from users.')}
          </p>

          <ul>
            <li style={{display: 'block'}}>
              <h4>{t('1. Information obtained directly from users')}</h4>
              <ul>
                <li>{t('Basic information such as name, email address, address, phone number, etc.')}</li>
                <li>{t('Information for authentication such as user ID and password')}</li>
                <li>{t('Payment-related information such as credit card information and bank account information (as appropriate)')}</li>
                <li>{t('Data such as text, images, files, etc. input or sent by users when using this service')}</li>
                <li>{t('Information voluntarily provided by users, such as inquiry details and survey responses')}</li>
              </ul>
            </li>
            <li style={{display: 'block'}}>
              <h4>{t('2. Information obtained automatically')}</h4>
              <ul>
                <li>{t('Access logs and usage history (IP address, browser type, device information, referrer URL, viewing date and time, click history, etc.) obtained using technologies such as cookies and web beacons.')}</li>
                <li>{t("Location information (if you allow your device or browser to provide location information)")}</li>
              </ul>
            </li>
            <li style={{display: 'block'}}>
              <h4>{t('3. Information obtained from third parties')}</h4>
              <ul>
                <li>{t("ID information, public profile information, etc. obtained when the user allows SNS authentication or linkage with other companies' services.")}</li>
                <li>{t("Payment and delivery information obtained from payment agencies, delivery companies, etc.")}</li>
              </ul>
            </li>
          </ul>
          
          <h2>{t('Article 3 (Purpose of Use)')}</h2>
          <p>
            {t('Our company uses acquired personal information for the following purposes.')}
          </p>
          <ul>
            <li>{t('1. To provide and operate this service')}</li>
            <li>{t('2. To respond to inquiries from users regarding this service')}</li>
            <li>{t('3. To investigate and analyze the usage status and satisfaction level of this service.')}</li>
            <li>{t('4. To provide users with new features, campaigns, and other information related to this service.')}</li>
            <li>{t('5. To appropriately perform payment-related operations such as payment processing and billing.')}</li>
            <li>{t('6. To investigate and respond to acts that violate the Terms of Use or laws and regulations.')}</li>
            <li>{t('7. To ensure the safety and security of this service')}</li>
            <li>{t('8. For the creation of statistical data and marketing analysis after processing it in a form that does not identify individuals.')}</li>
            <li>{t('9. For matters incidental to the above purpose of use')}</li>
          </ul>

          <h2>{t('Article 4 (Use of Cookies, etc.)')}</h2>
          <ul>
            <li>{t('1. Our company may use cookies and similar technologies for the purpose of improving user convenience, analyzing usage status, optimizing advertising, etc.')}</li>
            <li>{t('2. Users can refuse to receive cookies by setting their browser, but in that case, some functions of this service may not be available.')}</li>
          </ul>

          <h2>{t('Article 5 (provided by third party)')}</h2>
          <ul>
            <li style={{display: 'block'}}>
              {t("1. As a general rule, our company will not provide personal information to third parties without obtaining the user's consent. However, this does not apply in the following cases.")}
              
              <ul>
                <li>{t("1. When based on laws and regulations")}</li>
                <li>{t("2. When it is necessary to protect a person's life, body, or property, and it is difficult to obtain the user's consent.")}</li>
                <li>{t("3. When it is particularly necessary to improve public health or promote the healthy upbringing of children, and it is difficult to obtain the user's consent.")}</li>
                <li>{t("4. In cases where it is necessary for a national institution, local government, or a person entrusted by them to cooperate in carrying out affairs stipulated by law, and obtaining consent from the user would impede the execution of said affairs. If there is a risk")}</li>
                <li>{t("5. If personal information is provided due to business succession or merger, etc. (However, even after succession, such personal information will be handled in accordance with the provisions of this policy)")}</li>
              </ul>
            </li>
            <li>{t('2. We will provide personal information to outsourcing companies such as payment processing companies and delivery companies only to the extent necessary to provide services to users. In this case, we will impose an obligation to protect personal information with the subcontractor and supervise them appropriately.')}</li>
          </ul>

          <h2>{t('Article 6 (Disclosure, correction, suspension of use, etc. of personal information)')}</h2>
          <ul>
            <li>{t('1. Based on the provisions of the Personal Information Protection Act, users can request the Company to disclose, correct, suspend use, delete, etc. their personal information.')}</li>
            <li>{t('2. If you wish to make a request as set forth in the preceding paragraph, please follow the procedures prescribed by our company. After verifying your identity, we will respond within a reasonable period and scope.')}</li>
            <li>{t('3. Additional fees may be charged for disclosure, etc. In that case, we will notify you in advance.')}</li>
          </ul>

          <h2>{t('Article 7 (Security management measures for personal information)')}</h2>
          <p>
            {t('We will take necessary and appropriate security control measures, including the following, to prevent the personal information we handle from being leaked, lost, or damaged.')}
          </p>
          <ul>
            <li>{t('1. Implement appropriate control measures such as access privilege management and password management.')}</li>
            <li>{t('2. Install security technologies such as firewalls and SSL/TLS to prevent unauthorized access from outside.')}</li>
            <li>{t('3. Establish rules for handling documents and data related to personal information and conduct regular training.')}</li>
          </ul>

          <h2>{t('Article 8 (Storage period of personal information)')}</h2>
          <p>
            {t('Our company will store personal information to the extent necessary to achieve the above-mentioned \"Article 3 (Purpose of Use)\" and, as soon as the purpose of use is achieved, appropriate processing such as deletion or anonymization will be carried out without delay. However, this does not apply if there is a legal requirement or if it is necessary to keep the information for a certain period of time in order to troubleshoot.')}
          </p>

          <h2>{t('Article 9 (Personal information of minors)')}</h2>
          <ul>
            <li>{t('1. If a minor (under 18 years old in Japan) uses this service, please obtain the consent of a legal representative before providing personal information.')}</li>
            <li>{t('2. We will respond appropriately to inquiries, corrections, or deletion requests from parents or legal representatives within a reasonable scope.')}</li>
          </ul>

          <h2>{t('Article 10 (Data transfer overseas)')}</h2>
          <p>
            {t('Personal information acquired by our company may be stored on servers overseas or outsourced to third parties located overseas. In that case, we will endeavor to ensure that appropriate protection measures are taken at the data transfer destination in accordance with the Personal Information Protection Act and other related laws and regulations.')}
          </p>

          <h2>{t('Article 11 (Changes to privacy policy)')}</h2>
          <ul>
            <li>{t('1. Our company may change the contents of this policy as appropriate to the extent that it does not violate the Personal Information Protection Act or other laws and regulations.')}</li>
            <li>{t('2. The revised Policy will become effective from the time it is posted on the Service or our website.')}</li>
            <li>{t('3. If the changes are important, we will notify users in advance or take measures to make them well known.')}</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
