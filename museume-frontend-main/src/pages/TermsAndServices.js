import React from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from './Navigation';

const TermsAndServices = () => {
  const { t } = useTranslation();

  return (
    <>
      <Navigation />
      <div className="terms-page">
        <div className="terms-header">
          <h1>{t('Terms of Service')}</h1>
          <p className="last-updated">{t('Last Updated')}: {t('January 22, 2025')}</p>

          <p className="welcome-text">
            {t('Welcome to Museume. These Terms of Use govern your access to and use of the Services, including any related mobile applications, websites, products or services. All companies, organizations, classrooms, etc. (hereinafter referred to as "organizations") and individuals who use the service are called users. In addition, all service users are referred to as "users".')}
          </p>

          <p className="agreement-text">
            {t('By registering for, accessing, or using the Service, you agree to be bound by these Terms and all policies referenced herein. If you do not agree to these Terms, please do not use the Service.')}
          </p>
        </div>

        <div className="terms-container">
          <h2>{t('1. Acceptance of Terms')}</h2>

          <h3>{t('1.1 The power of law')}</h3>
          <p>
            {t('You must be of legal age (or have the consent of your legal guardian) to use the Service in your jurisdiction. By using the Service, you represent and warrant that you have the right, authority, and capacity to enter into this Agreement. Users shall also be responsible for all images, videos, and services such as contests that they upload at the time of registration.')}
          </p>

          <h3>{t('1.2 Changes to Terms')}</h3>
          <p>
            {t('We reserve the right, at our sole discretion, to change or modify these Terms at any time. We will post updated Terms on our website or otherwise notify you. If you continue to use the Service after the Terms have been updated, you will be deemed to have accepted the revised Terms.')}
          </p>

          <h2>{t('2. Service description')}</h2>
          <h3>{t('2.1 Museume Platform')}</h3>
          <p>
            {t('Museume is a platform where users can upload and share images of artworks. Users can belong to multiple organizations (hereinafter referred to as "Organizations") and can participate in contests held by these organizations and submit works.')}
          </p>

          <h3>{t('2.2 Groups and classes')}</h3>
          <p>
            {t('Organizations can create contests and classes. Classes may be scheduled live, at specific times, or via video streaming. Users can register for classes offered by organizations.')}
          </p>

          <h3>{t('2.3 Email communication')}</h3>
          <ul>
            <li>{t('Group staff → User: Group staff can send emails to users who belong to the group.')}</li>
            <li>{t('Group staff → Group staff: Staff within a group can send emails to each other.')}</li>
            <li>{t('Super Admin → All Users: A super admin appointed by your company can send emails to all users, whether staff or regular users.')}</li>
          </ul>

          <h2>{t('3. Account registration and security')}</h2>
          <h3>{t('3.1 Account creation')}</h3>
          <p>
            {t('In order to use certain features of the Service, you must create an account and provide accurate, current, and complete information. Registrants are responsible for updating their information if it changes. If any problems occur due to failure to update, each registrant will be solely responsible, and the operator will not be held responsible in any way.')}
          </p>

          <h3>{t('3.2 Account Security')}</h3>
          <p>
            {t('You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately if you suspect any unauthorized access to your account. In addition, the user shall be responsible for account management and shall bear all damages caused by the leakage of his or her account.')}
          </p>

          <h3>{t('3.3 Participating in multiple organizations')}</h3>
          <p>
            {t('Users can belong to one or more organizations. Each organization may have its own terms, guidelines, or eligibility criteria. A user can belong to an organization if the organization approves the user.')}
          </p>

          <h2>{t('4. User-generated content')}</h2>
          <h3>{t('4.1 Artwork and Submissions')}</h3>
          <p>
            {t('Users can upload artwork images and can also submit them to contests. By uploading content ("Content") to the Service, we may use, host, reproduce, modify, adapt, publish, translate, and display the Content on a non-proprietary, worldwide basis for the purpose of providing and improving the Service. Grants a royalty-free license.')}
          </p>

          <h3>{t('4.2 Content Responsibility')}</h3>
          <p>
            {t('You are solely responsible for all content that you upload, including its legality, reliability, and appropriateness. You must have the necessary rights to upload content.')}
          </p>

          <h3>{t('4.3 Prohibited Content')}</h3>
          <p>
            {t('You agree not to post or transmit any content that:')}
          </p>
          <ul>
            <li>{t('Items that infringe on the rights (including intellectual property rights) of third parties.')}</li>
            <li>{t('Is unlawful, defamatory, obscene, or otherwise inappropriate.')}</li>
            <li>{t('Encourages illegal or harmful activities.')}</li>
          </ul>

          <p>
            {t('We reserve the right to remove or restrict access to any content that, in our sole discretion, we deem to violate these Terms or applicable law. In addition, the user who uploaded the content shall be solely responsible for any damage caused by the content that violates the content.')}
          </p>

          <h2>{t('5. Intellectual property rights')}</h2>
          <h3>{t('5.1 Ownership')}</h3>
          <p>
            {t('We retain all rights, title, and interest in and to the Services, including without limitation trademarks, service marks, logos, and all related intellectual property. Additionally, all content licenses belong to the user who uploaded the content. If the information is diverted or sold without permission, the user may take legal action.')}
          </p>

          <h2>{t('6. Email communication')}</h2>
          <h3>{t('6.1 Consent to receive emails')}</h3>
          <p>
            {t('By creating an account, you agree to receive email communications from us, including, but not limited to:')}
          </p>
          <ul>
            <li>{t('Announcements from organizations (if you belong to an organization)')}</li>
            <li>{t('System notification')}</li>
            <li>{t('Marketing messages (opt out at any time)')}</li>
          </ul>

          <h3>{t('6.2 Using SendGrid and other email providers')}</h3>
          <p>
            {t('We use third party services, such as SendGrid, to send emails. By using the Services, you consent to such email communications and acknowledge that your data may be transferred to and processed by these third-party providers.')}
          </p>

          <h2>{t('7. Privacy and data protection')}</h2>
          <p>
            {t('We take your privacy seriously. Please review our Privacy Policy to learn about how we collect, use and disclose personal data. By using the Service, you agree to the practices described in the Privacy Policy.')}
          </p>

          <h2>{t('8. Prohibited actions')}</h2>
          <p>
            {t('You may not use the Service to:')}
          </p>
          <ul>
            <li>{t('Acts that violate any law or regulation.')}</li>
            <li>{t('Harass, threaten, or defraud other users;')}</li>
            <li>{t('Acts that interfere with or interrupt the service.')}</li>
            <li>{t('Acts of automatic data collection (scraping, collection, etc.) without our express permission.')}</li>
          </ul>

          <h2>{t('9. Withdrawal')}</h2>
          <h3>{t('9.1 Cancellation by User')}</h3>
          <p>
            {t('Users may terminate their use of the Service at any time by deleting their account.')}
          </p>

          <h3>{t('9.2 Withdrawal processing by our company')}</h3>
          <p>
            {t('We may, in our sole discretion, suspend or terminate your use of the Service if:')}
          </p>
          <ul>
            <li>{t('If the user violates these Terms.')}</li>
            <li>{t('If you engage in any activity that is harmful to us, the Services, or other users.')}</li>
            <li>{t('If our company terminates the provision of services for any reason.')}</li>
          </ul>

          <h2>{t('10. Disclaimer and Limitation of Liability')}</h2>
          <h3>{t('10.1 Disclaimer of Warranties')}</h3>
          <p>
            {t("The Service is provided ``as is'' and ``as available'' without warranty of any kind. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.")}
          </p>

          <h3>{t('10.2 Limitation of Liability')}</h3>
          <p>
            {t('To the maximum extent permitted by applicable law, the Company and its officers, directors, employees, and agents shall not be liable for any direct, indirect, incidental, special or consequential damages arising out of the use of or inability to use the Service. We are not responsible for any damage.')}
          </p>

          <h2>{t('11. SERVICE PROVISION AND DISCLAIMER OF WARRANTIES')}</h2>
          <h3>{t('11.1 Service provision status')}</h3>
          <p>
            {t('The Company provides the Service on an \"as is\" basis, and makes no warranty, express or implied, regarding its completeness, accuracy, usefulness, continuity, suitability for any particular purpose, etc. We do not guarantee it.')}
          </p>
          <h3>{t('11.2 Interruption/stopping of services')}</h3>
          <p>
            {t('If the Company determines that any of the following apply, the Company may temporarily suspend or suspend all or part of the Service without prior notice to the User.')}
          </p>
          <h3>{t('11.3 When performing maintenance, inspection, or updating of equipment for this service')}</h3>
          <p>
            {t('If it becomes difficult or impossible to provide this service due to fire, power outage, natural disaster, system failure, communication line malfunction, etc.')}
          </p>
          <p>
            {t('In other cases where the Company deems it unavoidable.')}
          </p>
          <h3>{t('11.4 No guarantee of damages due to service interruption')}</h3>
          <p>
            {t('The Company will not be held responsible for any damage caused to the User or a third party due to service interruption or suspension as stipulated in the preceding paragraph.')}
          </p>

          <h2>{t('12. Data preservation and backup')}</h2>
          <h3>{t('12.1 No guarantee of data integrity')}</h3>
          <p>
            {t('The Company does not guarantee the safety, availability, authenticity, or completeness of data uploaded or saved on the Service by users (hereinafter referred to as \"User Data\"). The Company will not be held responsible for any loss, damage, or falsification of user data due to server failure or malfunction, communication line failure, or other reasons.')}
          </p>
          <h3>{t('12.2 Backup obligations')}</h3>
          <p>
            {t('Users shall back up User Data as necessary at their own responsibility and expense. Our company is not obligated to back up user data, and will not be responsible for restoring it even if user data is lost or damaged.')}
          </p>

          <h2>{t('13. Disclaimer regarding data leakage, etc.')}</h2>
          <h3>{t('13.1 Disclaimer regarding server leaks')}</h3>
          <p>
            {t('The Company will not be held responsible for any leakage or outflow of user data due to reasons that are difficult for the Company to predict or control, such as communication line failures, server failures, unauthorized access or attacks by third parties, etc. yeah.')}
          </p>
          <h3>{t("13.2 Our company's intentional or gross negligence")}</h3>
          <p>
            {t('In the event that user data is leaked due to intentional or gross negligence on the part of the Company, the Company will be held responsible within the scope of laws and regulations, regardless of any other provisions of these Terms of Use. However, even if the Company is liable for compensation, the Company shall only be liable for direct and ordinary damages that actually occur to the user, and shall not be liable for any indirect damages, special damages, lost profits, etc. No.')}
          </p>

          <h2>{t('14. Limitation on damages')}</h2>
          <h3>{t('14.1 Upper limit for damages')}</h3>
          <p>
            {t('If the Company is liable for compensation to the User, the total amount of damages that the Company shall bear shall be limited to the total amount of usage fees for the Service that the Company has received from the User within the last one month. In addition, in the case of free services, we do not assume any liability.')}
          </p>
          <h3>{t('14.2 Scope of exemption')}</h3>
          <p>
            {t('If the User is subject to the Consumer Contract Act or other laws and regulations, this does not apply to damages caused by intentional or gross negligence on the part of the Company, but in other cases, exemptions and limitations of liability shall apply based on this provision. shall be')}
          </p>
          <h3>{t('14.3 Claims from third parties')}</h3>
          <p>
            {t("If a dispute arises with a third party due to the user's actions (including posting or uploading on this service) and the Company incurs any damage, the user shall resolve the dispute at his or her own responsibility and expense. and shall not cause any inconvenience or damage to our company.")}
          </p>

          <h2>{t('15. Exclusion of disclaimer')}</h2>
          <h3>{t('15.1 Relationship with mandatory laws and regulations')}</h3>
          <p>
            {t('If any provision of these Terms of Use violates the Consumer Contract Act or other mandatory laws or regulations, or is judged to be contrary to public order and morals, that provision will be null and void, and the remaining provisions will remain in effect. I assume that.')}
          </p>

          <h3>{t('15.2 Correction of invalid provisions')}</h3>
          <p>
            {t('If the provisions invalidated pursuant to the preceding paragraph are amended or limited by law or court judgment, such provisions shall be as effective as possible in the amended form.')}
          </p>

          <h2>{t('16. Compensation')}</h2>
          <p>
            {t("You agree to be responsible for any and all claims, losses, costs, liability, damages, and expenses (including reasonable attorneys' fees) arising in connection with (a) your use of the Service, (b) your Content, or (c) your violation of these Terms. ), you agree to indemnify and hold us and our affiliates, directors, officers, employees, and agents harmless.")}
          </p>

          <h2>{t('17. Governing Law and Dispute Resolution')}</h2>
          <p>
            {t("These Terms and your use of the Service are governed by the laws of Japan, without giving effect to its conflicts of laws principles. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the courts located in Tokyo.")}
          </p>

          <h2>{t('18. General provisions')}</h2>
          <h3>{t('18.1 Entire Agreement')}</h3>
          <p>
            {t("These Terms, the Privacy Policy, and any other legal notices or agreements published by us constitute the entire agreement between you and us regarding the Service.")}
          </p>
          <h3>{t('18.2 Possibility of separation')}</h3>
          <p>
            {t("If any provision of these Terms is determined to be invalid or unenforceable, that provision will be severed and the remaining provisions will remain in full force and effect.")}
          </p>
          <h3>{t('18.3 No Waiver')}</h3>
          <p>
            {t("No delay or failure to exercise any right under these Terms will be deemed a waiver of that right.")}
          </p>
          <h3>{t('18.4 Transfer')}</h3>
          <p>
            {t("You may not assign or transfer any rights or obligations under these Terms without our prior written consent. We may freely assign or transfer these Terms.")}
          </p>
          <h3>{t('18.5 Contact information')}</h3>
          <p>
            {t("If you have any questions regarding these Terms, please contact us:")}
          </p>
          <p>
            {t("Museume Management Headquarters (seso Co., Ltd.)")}
          </p>
          <p>
            {t("Inquiry email address: contact@museume.com")}
          </p>
          <p>
            {t("By using or accessing Museume, you acknowledge that you have read, understood, and agree to be bound by these Terms.")}
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsAndServices;
